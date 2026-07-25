# Omeagle

An Omegle-style random video + text chat app — connect instantly with strangers worldwide.

## Stack

| Layer | Service |
|-------|---------|
| Frontend | React 18 + TypeScript + Vite |
| Hosting | Vercel (auto-deploys from `main`) |
| Auth + Database + Realtime | Supabase (anonymous auth, PostgreSQL, Realtime) |
| Video | WebRTC peer-to-peer — signaling via Supabase Realtime |

## Features

- 🎥 HD video chat with random strangers
- 💬 Text chat alongside video
- 🔍 Interest & gender matching preferences
- 🌍 Global matchmaking with live country display
- 🎨 Light / dark theme
- 📱 PWA — installable on iOS and Android
- 🔒 Anonymous — no sign-up required
- ⚡ Swipe left to skip, keyboard shortcuts (N, F, C)
- 🖼️ Picture-in-picture self-view, draggable
- ✨ Video filters (Beauty, Vibrant, Cyber, Vintage)

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/abhijithmr226/Omeagle.git
cd Omeagle
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the Supabase SQL Editor
3. Apply migrations in order (`001_` → `004_`) if not already included in the schema
4. Deploy the Edge Function: `supabase functions deploy match-users`

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Both values are in your Supabase project under **Settings → API**.

### 4. Run the dev server

```bash
npm run dev
# → http://localhost:5000
```

## Project structure

```
src/
  components/   UI components (VideoChat, Chat, Modals, Header, Footer…)
  contexts/     React contexts (auth, theme, settings)
  hooks/        useWebRTC, useMedia, useChat
  lib/          Supabase client & auth helpers
  services/     Matchmaking queue, WebRTC signaling, GTM, sounds
  pages/        Static pages (About, Privacy, Terms, Contact, Blog, Safety)
  types/        Shared TypeScript types
supabase/
  schema.sql        Full database schema
  migrations/       Incremental migration files
  functions/        Edge Functions (match-users)
public/             Static assets, manifest, sitemap, robots.txt
vercel.json         SPA rewrites + security headers
```

## Deploying to Vercel

1. Push to `main` — Vercel auto-deploys
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in **Vercel → Project → Settings → Environment Variables**

## Environment variables reference

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (Settings → API → Project URL) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key (Settings → API → anon public) |

## License

MIT
