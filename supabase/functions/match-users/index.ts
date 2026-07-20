import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Production domain — also allow any localhost and *.replit.dev for local dev
const ALLOWED_ORIGINS = new Set([
  "https://omeagle.online",
  "https://www.omeagle.online",
]);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  // Allow exact production origins, any localhost port, and Replit dev previews
  const allowed =
    ALLOWED_ORIGINS.has(origin) ||
    /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
    /^https:\/\/[a-z0-9-]+(\.replit\.dev|\.repl\.co)$/.test(origin);

  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://omeagle.online",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// Simple in-memory rate limiter: 1 request per 2s per user
const rateLimitMap = new Map<string, number>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(userId) ?? 0;
  if (now - last < 2000) return true;
  rateLimitMap.set(userId, now);
  // Cleanup old entries every ~500 calls
  if (rateLimitMap.size > 500) {
    for (const [k, v] of rateLimitMap) {
      if (now - v > 30000) rateLimitMap.delete(k);
    }
  }
  return false;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseSecretKey = Deno.env.get("SUPABASE_SECRET_KEY")!;

    // Admin client (bypasses RLS)
    const adminClient = createClient(supabaseUrl, supabaseSecretKey);

    // Validate auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // User client (validates JWT)
    const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const userClient = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting
    if (isRateLimited(user.id)) {
      return new Response(
        JSON.stringify({ status: "waiting" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { mode, preferences } = body;

    if (!mode || !["video", "text"].includes(mode)) {
      return new Response(
        JSON.stringify({ error: "Invalid mode" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the PostgreSQL matching function (SECURITY DEFINER bypasses RLS)
    const { data, error } = await adminClient.rpc("match_users_in_queue", {
      p_user_id: user.id,
      p_mode: mode,
      p_preferences: preferences || {},
    });

    if (error) {
      console.error("[match-users] RPC error:", error);
      return new Response(
        JSON.stringify({ error: "Matchmaking failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[match-users] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
