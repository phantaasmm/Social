# Deployment

## Vercel settings

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Add these environment variables to the Vercel project for Production, Preview,
and Development:

- `VITE_SUPABASE_URL` — the Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — the Supabase publishable anonymous key

Never add a Supabase service-role key to this frontend project. Local values stay
in the ignored `.env` file.

## SPA routes

`vercel.json` rewrites application routes to `index.html`, allowing React Router
URLs such as `/profile`, `/communities/example`, and `/chess/example` to load
correctly after a browser refresh. Static files in `dist/assets` continue to be
served normally by Vercel.

## Pre-deployment verification

Run:

```sh
npm install
npm run typecheck
npm run lint
npm run build
```

To inspect the production build locally, run `npm run preview` and stop it when
testing is complete.
