# Omeagle

An Omegle-style random video + text chat app.

## Stack
- **Frontend:** React 18 + TypeScript, Vite
- **Backend:** Express 5 + Socket.io 4
- **Video:** WebRTC (peer-to-peer)

## Structure
- `src/` — React/TypeScript frontend
- `server/` — Express + Socket.io backend
- `dist/` — Pre-built frontend (served by the backend)
- `public/` — Static assets (images, manifest, etc.)

## Running the app
```bash
# Start the backend (serves pre-built frontend from dist/)
node server/index.js
```

The server listens on `PORT` (defaults to `3001`).

To rebuild the frontend after making changes:
```bash
npm run build   # tsc + vite build → outputs to dist/
```

To run the frontend dev server separately (hot reload):
```bash
npm run dev     # Vite dev server (--host)
```

## Notes
- No external API keys required — fully self-contained
- WebRTC signaling is handled via Socket.io rooms
- Matchmaking uses a polling-based REST API (`/api/...`) + Socket.io events

## User preferences
