# Omeagle

An Omegle-style random video + text chat app.

## Production stack
| Layer | Service |
|-------|---------|
| Frontend hosting | **Vercel** — auto-deploys from GitHub on push to `main` |
| Source control | **GitHub** |
| Auth + database + realtime | **Supabase** (anonymous auth, PostgreSQL, Realtime broadcast) |
| Video | WebRTC peer-to-peer; signaling via Supabase Realtime |

Replit is used as the **development environment only** — not for hosting or deployment.

## Frontend stack
- React 18 + TypeScript
- Vite (dev server on port 5000 for Replit preview)
- react-router-dom v7 (SPA, all routes rewritten to `/index.html` by `vercel.json`)

## Required environment variables
Set in **Replit Secrets** (🔒) for local dev, and in **Vercel → Project → Settings → Environment Variables** for production.

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (Settings → API → Project URL) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key (Settings → API → anon public) |

See `.env.example` for reference.

## Project structure
```
src/
  components/   UI (VideoChat, Chat, Modals, Header, Footer, …)
  contexts/     React contexts (auth, theme, settings)
  hooks/        useWebRTC, useMedia, useChat
  lib/          Supabase client & auth helpers
  services/     Matchmaking queue, WebRTC signaling, GTM, sounds
  pages/        Static pages (About, Privacy, Terms, Contact, Blog, Safety)
  types/        Shared TypeScript types
supabase/
  schema.sql        Full schema — run once in Supabase SQL Editor
  migrations/       Incremental migration files
  functions/        Supabase Edge Functions (match-users)
public/             Static assets, manifest, sitemap, robots.txt
vercel.json         SPA rewrites + security headers for Vercel
```

## Running locally (Replit)
```bash
npm run dev      # Vite dev server → http://localhost:5000
```
Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Replit Secrets.
The app shows a setup screen until both secrets are present.

## Database setup
1. Create a Supabase project at https://supabase.com
2. Run `supabase/schema.sql` in the Supabase SQL Editor
3. Run migration files in order (`001_` → `004_`) if not already applied
4. Deploy `supabase/functions/match-users/` via `supabase functions deploy match-users`

## Deploying to Vercel
1. Push to `main` on GitHub → Vercel auto-deploys
2. Or trigger manually in the Vercel dashboard
3. Ensure both env vars are set in Vercel before deploying

## User preferences
