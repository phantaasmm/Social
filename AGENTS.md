# AGENTS.md — Standing instructions for AI coding assistants

Read this before doing any work in this repository. These rules always apply.

## Project
CommonGround: a trust-first social app where people sign in with a verified college/company email. Live in production. Stack: React + TypeScript + Vite + Tailwind, Supabase (auth, Postgres, RLS, realtime, storage), deployed on Vercel. See SPEC.md for the v1 spec and PHASE2_PLAN.md for the current roadmap.

## Branching & deploy safety (critical)
- All current work happens on the `phase2` branch. Confirm you are on `phase2` before changing anything.
- NEVER push to or commit on `main`. `main` auto-deploys to the live production site. The human merges to `main` manually after testing.
- Do not run `git push` to `main`, `git merge` into `main`, or `git reset` on any branch. If a git operation beyond commit-on-phase2 seems needed, stop and ask.

## Database rules (critical)
- The Supabase database, tables, RLS policies, and triggers already exist. Build against the existing schema.
- NEVER write, invent, run, or modify SQL yourself, and do not add `.sql` files. When a feature needs new tables or policies, the human provides the exact SQL and runs it in Supabase. If you think schema changes are required, describe what's needed and stop — do not create them.
- Never call `.insert()` on profiles; profiles are created by an existing signup trigger.
- All data access is governed by RLS. Never use or expose the Supabase service key in the frontend. Only the publishable/anon key belongs in the client.

## Environment
- Secrets live in `.env` (gitignored) locally and in Vercel's env settings for production. Never commit `.env`. The required vars are `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Code conventions
- Reuse the existing shared UI components and the design system / theme tokens already in the project. Do not introduce a new styling approach.
- Keep light and dark mode working, and keep the app responsive (mobile bottom nav, desktop sidebar).
- Follow the existing project structure (feature folders, providers, hooks, pages) rather than inventing new patterns.
- Use React.lazy + the existing LazyRouteBoundary for new routes, consistent with the M8 code-splitting setup.

## Product principles (apply to every feature)
- Trust is the core: never blur "verified organisation" with anything unverified. Open communities must be clearly, visually distinct from verified org communities.
- Sounds only on meaningful moments (game actions, notifications), always subtle, always with a mute toggle that persists the user's choice. Never on every click.
- In-game chat is preset emojis + canned phrases only, transient (fade out). No free-text in-game chat.

## Workflow for each task
1. Confirm you're on `phase2`.
2. Build only what the current prompt asks; don't scope-creep into other features.
3. If the feature needs new database tables/policies, stop and tell the human what SQL is needed — do not write it.
4. Show each file changed. Confirm `npm run build`, `npm run lint`, and `npm run typecheck` pass.
5. Do not commit to main and do not merge. Leave merging to the human.
````
````

A couple of notes on how to use it:

`AGENTS.md` is special — many AI coding tools (Codex included) **read it automatically** at the start of a session, so you don't have to paste it every time. That's the whole point of it: set the rules once, and they persist. Still, the first time, it's worth telling Codex explicitly: *"I've added an AGENTS.md at the repo root — read it, it contains the standing rules for this project."*

Both files (`PHASE2_PLAN.md` and `AGENTS.md`) should be committed on the `phase2` branch along with your code. They're just markdown docs, safe to commit (unlike `.env`).

So your immediate to-do: create both files at the repo root (`PHASE2_PLAN.md` from before, `AGENTS.md` above), push your code + these files to the `phase2` branch, then tell Codex to read `AGENTS.md`.

After that, we build P1 (Notifications) — which needs a new table, so I'll write you the **SQL first**, then the **P1 Codex prompt**. Ready for the P1 SQL whenever you've got the files in place — just say go, and confirm you want to start with P1 (or P2.5 in-game reactions if you'd rather open with a fun win).