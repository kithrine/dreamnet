<div align="center">

<img src="dreamnet-logo.png" alt="DreamNet" width="360" height="160" />

# 🌙 DreamNet

**A social dream journal where you share the dreams you have at night — rate them, debate them, tag them — and earn stars when your dreams resonate with other dreamers.**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Neon](https://img.shields.io/badge/Neon%20Postgres-00E599?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech)
[![NextAuth](https://img.shields.io/badge/NextAuth.js-000000?style=flat-square&logo=auth0&logoColor=white)](https://next-auth.js.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org)

[![Authors: Jacqueline & Kit](https://img.shields.io/badge/Authors-Jacqueline%20%26%20Kit-9B5DE5?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kithrine/dreamnet)
[![Repo: DreamNet](https://img.shields.io/badge/Repo-DreamNet-2ECCB6?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kithrine/dreamnet)

</div>

---

DreamNet is a full-stack social platform for sharing the dreams you have at night. Sign up, write down a dream, and it joins a shared feed where other people can **rate it with 1–5 stars**, **leave threaded comments**, and **tag it** for discovery. Every meaningful action — posting, rating, commenting — feeds a personal **star economy**: you earn stars when your dreams resonate, and the community's ratings power a live **Bayesian leaderboard** of the best dreams on the platform.

On top of the feed, DreamNet ships an optional **3D Dream World** — a floating island you wander with a little avatar, where unrated dreams drift by as glowing bubbles you pop with a wand to rate them.

> **The brief:** *"Dreams can now be saved, shared, rated, and commented on by other people."* DreamNet is our take on that — a full social platform with a layered star economy, content management, notifications, and a game layer built by two collaborators around a shared API contract.

---

## ✨ Tech Stack

| Layer | Technology |
| ----- | ---------- |
| **Framework** | Next.js 16 (App Router · Turbopack) |
| **Language** | TypeScript (strict — no `any`, no `var`) |
| **UI** | React · Tailwind CSS (custom dream-themed design tokens) |
| **3D / Game** | Three.js · React Three Fiber · @react-three/drei |
| **Database** | PostgreSQL on Neon |
| **ORM** | Prisma 7 (with the `@prisma/adapter-pg` adapter) |
| **Auth** | NextAuth.js (Credentials + bcrypt, JWT sessions) |
| **Testing** | Jest · React Testing Library (30 tests, 5 suites) |
| **Hosting** | Vercel-ready (Next.js serverless) |

---

## 👥 Authors

DreamNet was built by **Kit** and **Jacqueline** as a two-person project, working on separate branches and reviewing each other's work before merging to `main`.

- **Kit** built the **full main app** — the Prisma schema, authentication, star economy, notifications, all feed/explore/profile/activity pages, the rating and comment system, CRUD operations, and the shared navigation. Also wrote the `/api/game` contract that the 3D game runs on.
- **Jacqueline** built the **3D Dream World** — the avatar gallery, the floating-island scene, the dream-bubble rating loop, and the in-game leaderboard — wiring into Kit's API contract.

We agreed on the data shapes and API contract up front (`Dream`, `Rating`, `User`, and the `/api/game/*` routes), then built each side independently.

---

## 🗺️ Features

### Core Feed

| Feature | Description |
| ------- | ----------- |
| 🌙 **Dream Feed** | Home page — a daily Featured Dream (rotates every 24 hours) + a ranked Top Dreams list powered by a Bayesian average algorithm. |
| ✍️ **Share a Dream** | Post a dream with a title, content, and up to 10 tags. Each dream gets a randomly assigned cover photo from a pool of 18 illustrated images. Earns **+2 ★** on post. |
| 🏷️ **Tags** | Add tags when writing a dream. Browse by tag from the Explore page or click a trending tag from the sidebar. |
| 🔭 **Explore** | Search dreams by keyword, filter by tag, and sort by Newest / Top Rated / Most Comments. |
| 👤 **Profile** | Your public page — avatar, star count, comment count, and all your dreams. |

### Star Economy

Every action in DreamNet earns stars. Stars are immutable — logged in a full transaction history and never taken away.

| Action | Stars Earned |
| ------ | ------------ |
| Post a dream | **+2 ★** |
| Someone rates your dream | **+their rating value (1–5) ★** |
| Leave a comment | **+1 ★** |
| Someone replies to your comment | **+1 ★** |

Stars are awarded atomically via a `StarTransaction` table, so the running total in the sidenav always reflects the live database value (not a stale JWT value).

### Ratings

- Any user can give a dream a **1–5 star rating** (except the author — you can't rate your own dream).
- Ratings power the **dream average** and the platform-wide **Top Dreams** ranking (Bayesian-weighted so one review can't dominate).
- You can **change your rating** at any time — the average recalculates instantly. No extra stars are awarded on a re-rate (the original reward stands).

### Comments

- **Threaded comments** with up to 3 levels of replies.
- Leaving a comment earns **+1 ★**; when someone replies to yours you earn **+1 ★** and get a notification.
- Authors can **edit** their own comment inline or **delete** it (with a confirmation modal). Deletions are a soft-archive — the data stays in the database but disappears permanently from the UI.

### Content Management (CRUD)

- **Edit a dream** — update title, content, and tags via the dream detail page or your profile.
- **Edit a comment** — inline edit without leaving the page.
- **Re-rate a dream** — interactive stars stay live for users who've already rated; clicking a new star updates the rating.
- **Delete a dream or comment** — a "this action cannot be undone" confirmation modal triggers a soft-archive (`archivedAt` timestamp). Archived content is invisible everywhere: feeds, explore, profiles, and the game API.

### Notifications & Activity

- You receive a notification when someone **rates your dream**, **comments on your dream**, or **replies to your comment**.
- The **Activity** page shows your full notification feed with read/unread state.
- Star count updates live in the sidenav on every page after any interaction.

### 3D Dream World 🎮

The optional game layer lives at `/game`:

- **Avatar gallery** — pick one of ten dreamer characters (owl, wizard, fox, knight, dragonling, mushroom 🍄, turquoise dino, bunny, frog, robot) and a color, then enter the world. The avatar choice is session-only.
- **Floating island** — a walkable dreamscape with bridges, glowing flowers, drifting clouds, and a starfield.
- **Pop to rate** — unrated dreams float by as colored bubbles; aim your wand, fire a stream of stars, and the bubble bursts before the rating panel opens.
- **Leaderboard** — a "Top Poppers" board tracks how many dreams you've rated in-game.

The game communicates entirely through the public `/api/game` REST API, so it can never get the data model out of sync with the main app.

---

## 🚀 Setup

You'll need [Node.js](https://nodejs.org) and a [Neon](https://neon.tech) PostgreSQL database.

### 1. Install dependencies

```bash
npm install
```

> `npm install` automatically runs `prisma generate` via the `postinstall` script — no manual step needed.

### 2. Configure environment

Create a `.env.local` file in the project root:

```env
DATABASE_URL=your_neon_postgres_connection_string
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
```

To silence a Postgres SSL deprecation warning, use `sslmode=verify-full` instead of `sslmode=require` in your `DATABASE_URL`.

### 3. Push the schema to your database

```bash
npx prisma db push
```

> This project uses `prisma db push` (schema-first, no migrations directory). Do **not** run `prisma migrate dev`.

### 4. (Optional) Seed with sample data

```bash
npx prisma db seed
```

> ⚠️ The seed script resets the database first — only run it against a database you control, and coordinate before seeding a shared one.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and start sharing dreams. The Dream World lives at `/game`.

---

## 🧪 Tests

```bash
npm test
```

30 tests across 5 suites — all fast, no network calls:

| Suite | What it covers |
| ----- | -------------- |
| `lib/__tests__/ranking.test.ts` | Bayesian score algorithm |
| `lib/__tests__/cover-images.test.ts` | 18-image array, naming convention, URL helper |
| `lib/__tests__/stars.test.ts` | `awardStars` transaction, correct args for all 4 `StarReason` values |
| `components/__tests__/ConfirmModal.test.tsx` | Show/hide, Cancel/Confirm callbacks, disabled + pending states |
| `components/__tests__/StarRating.test.tsx` | 5 stars rendered, correct value on click, no-op when non-interactive |

---

## 📁 Project Structure

```
dreamnet/
├── app/
│   ├── layout.tsx                              # Root layout (font, metadata)
│   ├── globals.css                             # Tailwind + custom dream design tokens
│   ├── auth/
│   │   ├── signin/page.tsx                     # Login form
│   │   └── signup/page.tsx                     # Registration + avatar picker
│   ├── (dashboard)/                            # Auth-protected route group
│   │   ├── layout.tsx                          # Sidenav + TopBar wrapper
│   │   ├── page.tsx                            # Home: featured dream + top dreams + sidebar
│   │   ├── explore/page.tsx                    # Search, tag filter, paginated dream grid
│   │   ├── activity/page.tsx                   # Notification feed
│   │   ├── inbox/page.tsx                      # Redirects to /activity
│   │   ├── settings/page.tsx                   # Account settings (placeholder)
│   │   ├── dreams/
│   │   │   ├── new/
│   │   │   │   ├── page.tsx                    # Create dream form
│   │   │   │   └── actions.ts                  # createDreamAction (server action)
│   │   │   └── [id]/
│   │   │       ├── page.tsx                    # Dream detail + rating + comments
│   │   │       ├── actions.ts                  # rate, comment, edit, archive actions
│   │   │       ├── RatingSection.tsx           # Interactive star rating (client)
│   │   │       ├── CommentSection.tsx          # Comment thread wrapper (client)
│   │   │       └── edit/
│   │   │           ├── page.tsx                # Edit dream form (owner-only)
│   │   │           └── actions.ts              # updateDreamAction (server action)
│   │   └── profile/
│   │       └── [username]/page.tsx             # User profile + dream grid
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts         # NextAuth handler
│   │   └── game/
│   │       ├── dreams/random/route.ts          # GET /api/game/dreams/random
│   │       └── dreams/[id]/rate/route.ts       # POST /api/game/dreams/:id/rate
│   └── game/                                   # 3D Dream World
│       ├── page.tsx                            # Gallery → world orchestrator
│       ├── AvatarGallery.tsx                   # Character + color picker
│       ├── avatarBuilders.ts                   # Three.js mesh builders for 10 avatars
│       ├── DreamWorld.tsx                      # Scene: islands, bubbles, lighting, effects
│       ├── gameData.ts                         # Types, world constants, API helpers
│       └── sounds.ts                           # Web Audio sound effects
├── components/
│   ├── ui/
│   │   ├── StarRating.tsx                      # Interactive / read-only 1–5 star widget
│   │   ├── TagChip.tsx                         # Linked tag badge (for standalone use)
│   │   ├── TagBadge.tsx                        # Non-linked tag badge (inside card links)
│   │   ├── Avatar.tsx                          # Renders one of 5 preset avatars
│   │   ├── AvatarPicker.tsx                    # Avatar selection grid
│   │   ├── Button.tsx                          # Primary / secondary button
│   │   ├── BackButton.tsx                      # "← Back" router.back() button
│   │   └── ConfirmModal.tsx                    # Reusable delete confirmation modal
│   ├── layout/
│   │   ├── Sidenav.tsx                         # Sticky left nav (all links + user card)
│   │   ├── UserCard.tsx                        # Avatar, username, ★ count, 💬 count
│   │   ├── TopBar.tsx                          # Sticky search bar + bell + avatar dropdown
│   │   └── UserDropdown.tsx                    # Avatar click → profile / log out menu
│   ├── dreams/
│   │   ├── DreamCard.tsx                       # Compact card (ranked list, profile grid)
│   │   ├── FeaturedDreamCard.tsx               # Hero card for the daily featured dream
│   │   ├── DreamForm.tsx                       # Shared create + edit form (pre-populated on edit)
│   │   └── DeleteDreamButton.tsx               # "Delete" link + confirmation modal
│   ├── comments/
│   │   ├── CommentThread.tsx                   # Recursive thread with inline edit + delete
│   │   └── CommentInput.tsx                    # Text input + submit for new comments/replies
│   └── dashboard/
│       ├── TrendingTags.tsx                    # Top 8 tags from the last 7 days
│       ├── TopDreamers.tsx                     # Top 5 users by total stars
│       └── RecentActivity.tsx                  # Platform-wide recent comment feed
├── lib/
│   ├── prisma.ts                               # Prisma client singleton (Neon adapter)
│   ├── auth.ts                                 # NextAuth config + session/JWT callbacks
│   ├── ranking.ts                              # Bayesian average + getTopDreams()
│   ├── stars.ts                                # awardStars() atomic transaction helper
│   ├── featured.ts                             # getFeaturedDream() daily rotation
│   ├── tags.ts                                 # getTrendingTags() last-7-days query
│   ├── dreamers.ts                             # getTopDreamers() by totalStars
│   ├── activity.ts                             # getRecentActivity() platform comment feed
│   ├── cover-images.ts                         # COVER_IMAGES array + randomCoverImage()
│   ├── avatars.ts                              # Avatar ID → display name/emoji map
│   └── utils.ts                                # cn() class-merging utility
├── middleware.ts                               # Redirect unauthenticated → /auth/signin
├── prisma/
│   ├── schema.prisma                           # All models (see Data Model section below)
│   ├── seed.ts                                 # Seed data (6 users, 10 dreams, ratings, comments)
│   └── backfill-covers.ts                      # One-off: re-randomise cover images on existing dreams
├── types/
│   └── next-auth.d.ts                          # Session + JWT type extensions
├── jest.config.ts
├── jest.setup.ts
└── .env.local.example
```

---

## 🗃️ Data Model

```
User ──< Dream ──< Rating
     ──< Comment (self-referential, up to 3 levels)
     ──< Notification
     ──< StarTransaction

Dream ──< DreamTag >── Tag
      ──< FeaturedDream   (one row per day — daily featured dream)
      ── archivedAt       (soft-delete: NULL = live, timestamp = archived)

Comment ── archivedAt     (soft-delete, same pattern as Dream)

StarTransaction.reason:  POST_DREAM | RECEIVE_RATING | LEAVE_COMMENT | RECEIVE_REPLY
Notification.type:       RATING_RECEIVED | COMMENT_ON_DREAM | REPLY_TO_COMMENT
```

All cascade deletes are handled at the DB level via Prisma `onDelete: Cascade`.

---

## 🎨 Design Decisions

### Star economy — why immutable?
Stars are never subtracted. Re-rating a dream updates the average but doesn't touch anyone's star balance — the original award stands. This prevents gaming the system by unrating after grinding stars, and keeps the `StarTransaction` log a true audit trail.

### Soft-delete, not hard-delete
Deleted dreams and comments are archived (`archivedAt` timestamp set) rather than removed from the database. To the user, deletion appears permanent and is confirmed by a modal; the data is simply filtered from all queries. This keeps history for potential moderation without building a recycle-bin UI.

### Bayesian ranking — why not just sort by average rating?
A dream with one 5-star review would outrank a dream with 500 reviews averaging 4.8. The Bayesian average pulls each dream's score toward the platform mean weighted by a confidence constant — dreams with few ratings stay near average until they've earned credibility.

### Daily featured dream
A `FeaturedDream` row is created once per calendar day (keyed by `YYYY-MM-DD` string). The same dream shows all day for everyone; after midnight a new one is selected. If today's row already exists, use it; if not, pick a random dream with at least one rating and insert the row.

### Cover photos — 18 images, randomly assigned
Dreams get a random cover photo from a pool of 18 illustrated images on creation (`lib/cover-images.ts`). The pool is a plain array so adding new images is a one-line change. A backfill script (`prisma/backfill-covers.ts`) re-randomises existing dreams when the pool grows.

### Game API contract
The 3D game was built by a separate collaborator. Rather than sharing internal code, we locked down the request/response shapes for `/api/game/dreams/random` and `/api/game/dreams/[id]/rate` before either side started. The game reads and writes through those routes only.

### `prisma db push` (no migrations)
This project uses schema-first development (`npx prisma db push`) rather than a migrations directory. A `postinstall` script ensures `prisma generate` runs on every `npm install` so collaborators always have an up-to-date client after schema changes.

---

## 🌐 Environment Variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ✅ | Full app URL (`http://localhost:3000` locally; your Vercel URL in production) |

---

<div align="center">

### ⭐ Star this project if you found it helpful!

[![Star on GitHub](https://img.shields.io/badge/⭐%20Star%20on%20GitHub-Show%20Your%20Support-FFD166?style=for-the-badge&logo=github&logoColor=black)](https://github.com/kithrine/dreamnet)

**Built with 💜 by Jacqueline & Kit**

</div>
