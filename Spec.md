# SPEC.md — Project Build Brief (v2, Professional)

> Source-of-truth spec for the app. Keep it in the repo root.
> Give this whole file to the AI coding assistant (Codex) as context, then build
> **one milestone at a time** (Section 11). Do not build everything in one prompt.

---

## 1. Product vision

A professional, mobile-and-desktop social platform where people sign in with their **verified official college or company email**. Verified users build profiles, find and befriend each other, join **communities gated to a specific email domain** (only `ietdavv.edu.in` addresses can join that college's space), share a rich feed of **posts** (text, image, video, poll, or question) with **per-post audience control** (public / friends / organisation), and play **realtime chess**. Accounts can be **public or private**. Others can respond to posts (comment/answer, vote in polls). The wedge is *trust*: verified email makes org-restricted spaces genuinely real.

## 2. Scope of Version 1 (MVP)

**In scope for v1:**
1. Auth: email sign-up / log-in / log-out with email verification.
2. Profiles with **public or private** account setting.
3. User search + friend requests (send / accept / remove).
4. Communities: create, browse, join — **join restricted by email domain**.
5. **Feed & posts** — create text, image, video, poll, and question posts, each with an **audience** (public / friends / organisation).
6. **Responses** — comment/answer on posts; vote in polls; like posts.
7. Realtime 1-versus-1 chess between two friends.
8. **Professional theming** — light mode + dark mode, responsive on phone and laptop.

**OUT of scope for v1 (do later):**
- Tournaments / competitions / leaderboards.
- Games other than chess.
- Direct/private messaging (DMs).
- Push notifications, native mobile apps.
- Reposts/quote posts, hashtags, trending, algorithms (feed is chronological in v1).
- Payments / premium features.

Keep v1 tight. Launch at one college, get real daily users, then expand.

## 3. Tech stack (all free tiers)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | **React + TypeScript** via **Vite** | Standard, fast, AI-friendly |
| Styling | **Tailwind CSS** (dark mode = `class` strategy) | Powers the design system below |
| Icons | **lucide-react** | Clean, consistent icon set |
| Routing | **react-router-dom** | Pages / navigation |
| Backend / DB / Auth / Realtime / Storage | **Supabase** (free tier) | Postgres + Auth + Realtime + Storage bundled |
| DB client | **@supabase/supabase-js** | Talk to Supabase from React |
| Chess rules | **chess.js** | Move validation, FEN/PGN state |
| Chess board UI | **react-chessboard** | Interactive board |
| Media upload | **Supabase Storage** | Avatars, images, short videos |
| Hosting | **Vercel** (free) | Auto-deploy from GitHub |

**No custom backend server in v1.** React talks to Supabase directly; security is enforced by Supabase **Row Level Security (RLS)** (Section 6).

### Free-tier limits to design around
- Supabase free projects **pause after 7 days idle** (fine while building; go Pro ~$25/mo for a live product).
- Built-in email sender is **rate-limited** (a few verification emails/hour). For real launch, connect a free SMTP provider (e.g. Resend) — Phase 2.
- Storage is **1 GB** with **5 GB/month egress** on free tier. **Video is heavy** — in v1 limit uploads to short clips / small files (e.g. cap ~20–50 MB), and serve media via Supabase Storage's CDN. Real video at scale needs dedicated storage/CDN — Phase 2.
- v1 chess is **client-authoritative** (browsers enforce rules via chess.js) — fine for friendly games, cheatable; add a server referee later.

## 4. Design system (professional look, light + dark)

The app must feel like a polished product, not a template. Follow these tokens.

### 4.1 Theme mechanism
- Tailwind `darkMode: 'class'`. A `.dark` class on `<html>` switches the theme.
- Define semantic colors as CSS variables in `index.css` under `:root` (light) and `.dark`, and reference them from Tailwind (via `theme.extend.colors` mapped to `var(--...)`).
- **Theme toggle** in the top bar / sidebar. Persist the choice in `localStorage`. On first load, if no saved choice, respect the OS setting (`prefers-color-scheme`).
- Smooth, subtle transition on theme change.

### 4.2 Color tokens (hex values to use)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F8FAFC` | `#0F172A` | Page background |
| `--surface` | `#FFFFFF` | `#1E293B` | Cards, sheets, nav |
| `--surface-2` | `#F1F5F9` | `#334155` | Inputs, hover, subtle fills |
| `--border` | `#E2E8F0` | `#334155` | Dividers, card borders |
| `--text` | `#0F172A` | `#F1F5F9` | Primary text |
| `--text-muted` | `#64748B` | `#94A3B8` | Secondary text |
| `--primary` | `#4F46E5` | `#6366F1` | Buttons, links, active state |
| `--primary-hover` | `#4338CA` | `#818CF8` | Hover on primary |
| `--primary-fg` | `#FFFFFF` | `#FFFFFF` | Text on primary |
| `--accent` | `#0EA5E9` | `#38BDF8` | Highlights, secondary accents |
| `--success` | `#16A34A` | `#22C55E` | Success states |
| `--danger` | `#DC2626` | `#EF4444` | Errors, destructive actions |
| `--ring` | `#6366F1` | `#818CF8` | Focus rings |

### 4.3 Typography
- Font: **Inter** (fallback `system-ui, sans-serif`). Load via Google Fonts or `@fontsource/inter`.
- Scale: Display 30px/700, H1 24px/700, H2 20px/600, H3 18px/600, Body 16px/400, Small 14px/400, XS 12px/500. Line-height ~1.5 for body.

### 4.4 Spacing, radius, elevation
- Spacing on a 4px grid (4/8/12/16/24/32).
- Radius: inputs/buttons 8px, cards 12–16px, avatars/pills full.
- Shadows: subtle in light mode; in dark mode prefer borders over heavy shadows.
- Buttons: clear primary / secondary / ghost / destructive variants, with hover, focus-ring, disabled, and loading states.

### 4.5 Responsive layout & navigation
Mobile-first. Breakpoints: mobile < 768px, tablet 768–1023px, desktop ≥ 1024px.
- **Mobile:** top app bar (logo + theme toggle + avatar) and a **bottom tab bar**: Home (feed), Search, Create (+), Communities, Profile. Full-width cards.
- **Desktop:** **left sidebar** nav (same destinations + theme toggle), a centered feed column (max ~600px), optional right column for suggestions. No bottom bar.
- Everything must be usable one-handed on a phone and comfortable on a laptop. All interactive targets ≥ 44px on touch.
- Include proper loading skeletons, empty states, and error states everywhere.

## 5. Data model (Postgres tables)

`auth.users` is provided by Supabase Auth. Every user has one `profiles` row.

**profiles**
- `id` uuid — PK, references `auth.users.id`
- `username` text — unique, required
- `display_name` text
- `avatar_url` text — nullable
- `bio` text — nullable
- `email_domain` text — part after `@`, captured at signup (powers org gating)
- `is_private` boolean — default false (false = open/public account, true = private)
- `created_at` timestamptz — default now()

**communities**
- `id` uuid — PK, default gen_random_uuid()
- `name` text — required
- `slug` text — unique
- `description` text — nullable
- `owner_id` uuid — references `profiles.id`
- `allowed_domain` text — email domain permitted to join
- `created_at` timestamptz — default now()

**community_members**
- `community_id` uuid — references `communities.id`
- `user_id` uuid — references `profiles.id`
- `role` text — `owner` / `admin` / `member`
- `joined_at` timestamptz — default now()
- PK (`community_id`, `user_id`)

**friendships**
- `id` uuid — PK, default gen_random_uuid()
- `requester_id` uuid — references `profiles.id`
- `addressee_id` uuid — references `profiles.id`
- `status` text — `pending` / `accepted`
- `created_at` timestamptz — default now()
- unique (`requester_id`, `addressee_id`)

**posts**
- `id` uuid — PK, default gen_random_uuid()
- `author_id` uuid — references `profiles.id`
- `type` text — `text` / `image` / `video` / `poll` / `question`
- `content` text — caption / question text / body (nullable for pure media)
- `media_url` text — nullable; for `image`/`video` (Supabase Storage URL)
- `visibility` text — `public` / `friends` / `organisation`
- `organisation_domain` text — nullable; set only when `visibility = 'organisation'` (= author's `email_domain`)
- `created_at` timestamptz — default now()

**poll_options** (only for `type = 'poll'`)
- `id` uuid — PK, default gen_random_uuid()
- `post_id` uuid — references `posts.id`
- `option_text` text — required
- `position` int — display order

**poll_votes**
- `id` uuid — PK, default gen_random_uuid()
- `post_id` uuid — references `posts.id`
- `option_id` uuid — references `poll_options.id`
- `voter_id` uuid — references `profiles.id`
- `created_at` timestamptz — default now()
- unique (`post_id`, `voter_id`)  ← one vote per user per poll

**comments** (replies to posts and answers to questions)
- `id` uuid — PK, default gen_random_uuid()
- `post_id` uuid — references `posts.id`
- `author_id` uuid — references `profiles.id`
- `content` text — required
- `created_at` timestamptz — default now()

**post_likes**
- `post_id` uuid — references `posts.id`
- `user_id` uuid — references `profiles.id`
- `created_at` timestamptz — default now()
- PK (`post_id`, `user_id`)

**games** (chess)
- `id` uuid — PK, default gen_random_uuid()
- `white_player_id` uuid — references `profiles.id`
- `black_player_id` uuid — references `profiles.id`
- `fen` text — current board state
- `pgn` text — move history
- `turn` text — `w` / `b`
- `status` text — `pending` / `active` / `finished`
- `winner_id` uuid — nullable
- `created_at` timestamptz — default now()
- `updated_at` timestamptz — default now()

## 6. Visibility, privacy & security (Row Level Security)

Enable RLS on **every** app table. This section is the heart of the app — implement and test it carefully.

### 6.1 The single post-visibility rule
A viewer **V** can see post **P** by author **A** if `V = A`, OR any of:
- `P.visibility = 'organisation'` AND `V.email_domain = P.organisation_domain`
- `P.visibility = 'friends'` AND V is an accepted friend of A
- `P.visibility = 'public'` AND (`A.is_private = false` OR V is an accepted friend of A)

Design notes:
- A **private account** (`is_private = true`) hides even its "public" posts from non-friends — only accepted friends see them.
- **Organisation** posts are visible to anyone in the same verified email domain, even from a private account (the org is a trusted context). Say this in the audience picker.
- Implement this rule once as a reusable SQL condition / security-definer function, then reference it from the policies below.

### 6.2 Policies (plain English → write as SQL policies)
- **profiles:** logged-in users can *read* profiles (needed for search; a private account still appears in search but its posts are gated by 6.1). A user can *insert/update* only their own row (`id = auth.uid()`).
- **communities:** any logged-in user can *read* all and *create* (becomes owner). Only owner can *update/delete*.
- **community_members** (domain gate): a user may *insert* their own membership **only if** their `profiles.email_domain` = the community's `allowed_domain`. Members can *read* memberships of communities they belong to. This makes org gating unfakeable.
- **friendships:** *insert* only where you are requester; *read* rows where you are requester or addressee; *update* (accept) only rows where you are addressee.
- **posts:** *insert* only where `author_id = auth.uid()` (and if `visibility='organisation'`, `organisation_domain` must equal your own `email_domain`). *Read* only if the viewer passes the 6.1 rule. *Delete/update* only your own posts.
- **poll_options / poll_votes / comments / post_likes:** you can *read* a child row only if you can *read* its parent post (6.1). You can *insert* a comment/vote/like/answer only if you can see the post AND the row's user = `auth.uid()`. One vote per user per poll (enforced by the unique constraint).
- **games:** only the two players can *read/update* their game.

## 7. Auth flow

1. Sign up with email + password → Supabase sends a verification email; account unusable until verified.
2. On first login, create the `profiles` row and set `email_domain` = substring after `@` (best via a database trigger on `auth.users`).
3. Log out clears the session.
4. Protected routes redirect to login when there is no session.

## 8. Feature requirements & acceptance criteria

**Theming & responsiveness**
- Light and dark mode both fully styled; toggle works and persists; respects OS setting on first load.
- Layout correct and comfortable on phone (bottom nav) and laptop (sidebar). No horizontal scroll on mobile.

**Auth & profile**
- Register → verify → log in works. Profile shows/edits display name, bio, avatar, and the **public/private** toggle. `email_domain` set correctly.

**Search & friends**
- Search users by username/display name. Send request; recipient accepts; both appear in each other's friends list; can remove a friend.
- On a **private** account, non-friends cannot see its posts (per 6.1).

**Communities**
- Create a community with an `allowed_domain`. Browse communities.
- **Join only if email domain matches**; otherwise blocked with a clear message.

**Feed & posts**
- Compose posts of type **text, image, video, poll, question**, choosing an **audience: public / friends / organisation**.
- Media uploads to Supabase Storage; images and short videos render inline.
- Feed shows posts the viewer is allowed to see (6.1), newest first, with pagination/infinite scroll.
- **Poll:** viewers see options, cast one vote, then see live percentages and total votes.
- **Question:** viewers answer via comments; answers list under the question.
- **Comment/like:** viewers can comment on and like any post they can see; counts update.

**Chess**
- Challenge a friend → creates `games` row (`pending`). Opponent accepts → `active`.
- Both see the board; moves validated by chess.js; on a move the game row updates and the opponent's board updates **live** via Supabase Realtime. Checkmate/draw sets `finished` + `winner_id`.

## 9. Environment / setup checklist

1. Install Node.js LTS + npm.
2. Scaffold Vite React+TS. Install: `@supabase/supabase-js`, `react-router-dom`, `chess.js`, `react-chessboard`, `lucide-react`, Tailwind CSS, and the Inter font.
3. Configure Tailwind `darkMode: 'class'`; add the color tokens (Section 4.2) as CSS variables + Tailwind theme colors.
4. Create a free Supabase project. Put **Project URL** + **anon key** in `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Never commit real keys.
5. In Supabase SQL editor: create tables (Section 5), enable RLS, add policies (Section 6). Create a Storage bucket (e.g. `media`) with appropriate access.
6. In Supabase Auth: enable email sign-up + email confirmation.
7. `npm run dev` locally; deploy frontend to Vercel via GitHub.

## 10. Non-functional requirements
- **Accessibility:** semantic HTML, labeled inputs, visible focus rings, sufficient contrast in both themes, alt text on images.
- **Performance:** paginate the feed; lazy-load images/video; show skeletons.
- **Security:** never trust the client — all access controlled by RLS; never expose the service key in the frontend.
- **Consistency:** one shared component library (Button, Input, Card, Avatar, Modal, Tabs, Toast) reused everywhere.

## 11. Build order (feed Codex ONE milestone at a time)

Build and test each before the next.

- **M1 — Skeleton + design system:** Vite + React + TS + Tailwind, dark/light theming with toggle + persistence, Inter font, color tokens, the shared component library (Button/Input/Card/Avatar/Modal/Tabs/Toast), and the responsive shell (mobile bottom nav + desktop sidebar) with empty pages.
- **M2 — Auth + profiles:** signup, verification, login, logout, protected routes, profile row + `email_domain` trigger, profile view/edit incl. **public/private** toggle and avatar upload.
- **M3 — Database schema + RLS:** all tables + all policies (Sections 5–6), Storage bucket. Manually verify org-gating and the 6.1 visibility rule.
- **M4 — Search + friends:** search, friend requests, accept/remove, friends list; enforce private-account hiding.
- **M5 — Communities:** create, browse, join (domain gate), community page.
- **M6 — Feed & posts:** composer for text/image/video/poll/question with audience picker; feed with visibility filtering + pagination; likes and comments; poll voting; question answers.
- **M7 — Chess:** challenge flow, board, chess.js validation, realtime sync, game end.
- **M8 — Polish:** loading/empty/error states, responsive QA on real phone + laptop, accessibility pass, deploy to Vercel.

*Phase 2:* custom SMTP, tournaments/competitions, more games, DMs, reposts/hashtags, server-side chess referee, dedicated video hosting, upgrade Supabase to Pro.

---

## How to use this with Codex
1. Put `SPEC.md` in your repo. Tell Codex: *"Read SPEC.md — it is the source of truth."*
2. Build one milestone at a time, e.g.: *"Implement Milestone M6 (Feed & posts) from SPEC.md. Follow the data model in Section 5, the visibility rules in Section 6.1, and the design system in Section 4. Show me each file and its contents."*
3. Run it, test against Section 8, fix, commit, then next milestone.
4. On errors, paste the exact error plus the relevant spec section back to Codex.