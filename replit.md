# Omeagle

An Omegle-style random video + text chat app built with React 18 + TypeScript + Vite,
using Supabase for auth, real-time matchmaking, and WebRTC signaling.

## Stack
- **Frontend:** React 18 + TypeScript, Vite (port 5000)
- **Backend:** Supabase (auth, PostgreSQL, Realtime broadcast, Edge Functions)
- **Video:** WebRTC peer-to-peer via Supabase Realtime signaling

## Structure
- `src/` — React/TypeScript frontend
  - `components/` — UI components (VideoChat, Chat, Modals, Header, Footer, etc.)
  - `contexts/` — React contexts (Supabase auth, theme, settings)
  - `hooks/` — Custom hooks (useWebRTC, useMedia, useChat)
  - `lib/` — Supabase client & auth helpers
  - `services/` — Queue/matchmaking, signaling, WebRTC, GTM, sounds
  - `pages/` — Static pages (About, Privacy, Terms, Contact, Blog, Safety)
  - `types/` — Shared TypeScript types
- `supabase/` — Supabase schema SQL, migrations, and Edge Functions
- `public/` — Static assets (manifest, icons, images)

## Required secrets
Set these in the Replit Secrets panel (🔒) before starting:

| Secret | Description |
|--------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxx.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/publishable API key |

Both are found in your Supabase project under **Settings → API**.

The app renders a setup screen until both secrets are present.

## Running
```bash
npm run dev    # Vite dev server on port 5000 (hot reload)
npm run build  # Production build → dist/
```

## Database
Apply `supabase/schema.sql` in the Supabase SQL Editor to create all tables, RLS
policies, and RPCs. See `supabase/migrations/` for incremental migrations and
`supabase/functions/` for Edge Functions.

## User preferences
