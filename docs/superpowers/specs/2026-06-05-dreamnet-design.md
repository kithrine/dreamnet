# DreamNet — Application Specification

**Version:** 1.0  
**Date:** June 5, 2026  
**Authors:** Kit & Jacqueline  
**Stack:** Next.js 16 · TypeScript · Prisma 7 · Neon PostgreSQL · NextAuth.js · Tailwind CSS · Three.js

---

## 1. Overview

DreamNet is a full-stack social platform where users record and share the dreams they have at night. The platform has two distinct layers:

1. **Main app** — a social feed with ratings, threaded comments, a star economy, notifications, and content management (CRUD).
2. **3D Dream World** — an optional Three.js game at `/game` where users wander a floating island and rate dreams by popping dream bubbles with a wand.

Both layers share the same PostgreSQL database and authentication system. The game communicates with the main app exclusively through a REST API contract (`/api/game/*`).

---

## 2. Authentication

**Provider:** NextAuth.js `CredentialsProvider`  
**Session strategy:** JWT (no DB sessions)  
**Password hashing:** `bcryptjs` (salt rounds: 10)

### Sign-up flow
1. User submits username, email, password, and an `avatarId` (1–5).
2. Server action checks email + username uniqueness.
3. Password is hashed; `User` row is created with `totalStars: 0`.
4. NextAuth session is created.

### Session shape (JWT + session callback)
```typescript
session.user = {
  id: string;
  username: string;
  email: string;
  avatarId: number;
  totalStars: number;   // NOTE: stale — always read live value from DB in layouts
}
```

> ⚠️ `totalStars` in the JWT is set at sign-in and never refreshed. The dashboard layout fetches a fresh value from the DB and passes it as a prop to avoid showing stale counts.

### Route protection
`middleware.ts` redirects all unauthenticated requests to `/auth/signin` for the `/(dashboard)/*` route group. The `/api/game/*` routes check the session independently.

---

## 3. Data Model

### Users

```prisma
model User {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  passwordHash String
  avatarId     Int      @default(1)   // 1–5
  totalStars   Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Dreams

```prisma
model Dream {
  id            String    @id @default(cuid())
  title         String
  content       String    @db.Text
  userId        String
  averageRating Float     @default(0)
  ratingCount   Int       @default(0)
  coverImage    String    @default("coverphoto-1.png")
  archivedAt    DateTime?            // NULL = live; any timestamp = soft-deleted
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

**Cover images:** 18 options (`coverphoto-1.png` through `coverphoto-18.png`) stored in `public/images/cover-photos/`. Assigned randomly on creation via `lib/cover-images.ts → randomCoverImage()`.

**Soft-delete:** Setting `archivedAt` to a timestamp archives the dream. All queries filter `WHERE archivedAt IS NULL`. The user sees a permanent deletion; the row is retained for moderation purposes.

### Tags

```prisma
model Tag      { id String @id; name String @unique }
model DreamTag { dreamId String; tagId String; @@id([dreamId, tagId]) }
```

Tags are created with `connectOrCreate` — a tag name is reused if it already exists, created fresh if not. Up to 10 tags per dream. Tag names are lowercased and hyphen-normalized on save.

### Ratings

```prisma
model Rating {
  id        String   @id @default(cuid())
  value     Int      // 1–5
  userId    String
  dreamId   String
  createdAt DateTime @default(now())
  @@unique([userId, dreamId])
}
```

**Business rules:**
- A user cannot rate their own dream.
- A user can only have one rating per dream (`@@unique` constraint).
- **Re-rating** is supported: the existing `Rating` row is updated via `prisma.rating.update`. No additional stars are awarded on re-rate.
- After create or update, `averageRating` and `ratingCount` on the `Dream` row are recalculated via `prisma.rating.aggregate`.

### Comments

```prisma
model Comment {
  id         String    @id @default(cuid())
  content    String
  userId     String
  dreamId    String
  parentId   String?              // NULL = top-level; non-null = reply
  archivedAt DateTime?            // soft-delete (same pattern as Dream)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}
```

**Threading:** Up to 3 levels (comment → reply → reply-to-reply). The UI renders this recursively in `CommentThread.tsx`. All nesting levels filter `archivedAt: null` in the query.

**Soft-delete:** Same pattern as Dream. Archived comments are excluded from all queries.

### Star Transactions

```prisma
model StarTransaction {
  id        String     @id @default(cuid())
  userId    String
  amount    Int
  reason    StarReason
  createdAt DateTime   @default(now())
}

enum StarReason {
  POST_DREAM       // +2
  RECEIVE_RATING   // +value (1–5)
  LEAVE_COMMENT    // +1
  RECEIVE_REPLY    // +1
}
```

Stars are awarded via `lib/stars.ts → awardStars(userId, amount, reason)`, which runs as a `prisma.$transaction` to atomically create the `StarTransaction` row and increment `User.totalStars`.

**Stars are never decremented.** Re-rating does not trigger a star adjustment. This is intentional — stars are an immutable reward ledger.

### Featured Dreams

```prisma
model FeaturedDream {
  id        String   @id @default(cuid())
  dreamId   String
  date      String   @unique   // "YYYY-MM-DD"
  createdAt DateTime @default(now())
}
```

`lib/featured.ts → getFeaturedDream()`:
1. Look up today's `FeaturedDream` row by date string.
2. If found, return the associated dream.
3. If not found, pick a random dream with `ratingCount > 0` and `archivedAt: null`, insert a `FeaturedDream` row for today, return the dream.

This ensures the same dream is shown all day platform-wide.

### Notifications

```prisma
model Notification {
  id             String           @id @default(cuid())
  userId         String           // recipient
  type           NotificationType
  relatedDreamId String?
  relatedUserId  String?          // who triggered it
  read           Boolean          @default(false)
  createdAt      DateTime         @default(now())
}

enum NotificationType {
  RATING_RECEIVED
  COMMENT_ON_DREAM
  REPLY_TO_COMMENT
}
```

Notifications are created by server actions when the triggering event occurs (rating, comment, reply). They are never deleted — only marked `read: true`.

---

## 4. Star Economy

| Trigger | Recipient | Amount | Reason |
| ------- | --------- | ------ | ------ |
| User posts a dream | The poster | +2 | `POST_DREAM` |
| User rates a dream | The dream's author | +rating value (1–5) | `RECEIVE_RATING` |
| User leaves a comment | The commenter | +1 | `LEAVE_COMMENT` |
| User replies to a comment | The original commenter | +1 | `RECEIVE_REPLY` |

**Implementation:** `lib/stars.ts`

```typescript
export async function awardStars(userId: string, amount: number, reason: StarReason) {
  await prisma.$transaction([
    prisma.starTransaction.create({ data: { userId, amount, reason } }),
    prisma.user.update({ where: { id: userId }, data: { totalStars: { increment: amount } } }),
  ]);
}
```

**Live counts:** The dashboard layout (`app/(dashboard)/layout.tsx`) fetches `totalStars` and `commentCount` fresh from the DB on every render, bypassing the stale JWT value. These are passed as props through `Sidenav → UserCard`.

---

## 5. Ranking Algorithm

**File:** `lib/ranking.ts`

Top Dreams are ranked using a **Bayesian average** to prevent low-volume dreams from dominating the leaderboard.

```
score = (C × m + Σrating) / (C + n)

where:
  C = confidence weight (10) — minimum "virtual" ratings
  m = global mean rating across all dreams
  n = number of ratings for this dream
  Σrating = sum of all ratings for this dream
```

A dream with 1 five-star review scores lower than a dream with 50 reviews averaging 4.8, because `n=1` means the formula pulls heavily toward the global mean.

---

## 6. Pages & Routes

| Route | Auth | Component | Description |
| ----- | ---- | --------- | ----------- |
| `/auth/signin` | Public | `app/auth/signin/page.tsx` | Login form |
| `/auth/signup` | Public | `app/auth/signup/page.tsx` | Registration + avatar picker |
| `/` | Required | `app/(dashboard)/page.tsx` | Feed: featured dream + top dreams + sidebar widgets |
| `/explore` | Required | `app/(dashboard)/explore/page.tsx` | Search, tag filter, sort, paginated grid |
| `/activity` | Required | `app/(dashboard)/activity/page.tsx` | Notification feed |
| `/inbox` | Required | `app/(dashboard)/inbox/page.tsx` | Redirects to `/activity` |
| `/settings` | Required | `app/(dashboard)/settings/page.tsx` | Placeholder |
| `/dreams/new` | Required | `app/(dashboard)/dreams/new/page.tsx` | Create dream |
| `/dreams/[id]` | Required | `app/(dashboard)/dreams/[id]/page.tsx` | Dream detail, rating, comments |
| `/dreams/[id]/edit` | Required (owner) | `app/(dashboard)/dreams/[id]/edit/page.tsx` | Edit dream |
| `/profile/[username]` | Required | `app/(dashboard)/profile/[username]/page.tsx` | Public profile |
| `/game` | Required | `app/game/page.tsx` | 3D Dream World |

---

## 7. Server Actions

All mutations use Next.js Server Actions (`"use server"`). Every action:
1. Calls `getServerSession(authOptions)` — returns early with `{ error }` if unauthenticated.
2. Validates ownership where required (checks `dream.userId === session.user.id`).
3. Calls `revalidatePath(...)` before returning or redirecting.

| Action | File | Description |
| ------ | ---- | ----------- |
| `signUpAction` | `app/auth/signup/actions.ts` | Create user + sign in |
| `createDreamAction` | `app/(dashboard)/dreams/new/actions.ts` | Create dream + award stars + revalidate layout |
| `rateDreamAction` | `app/(dashboard)/dreams/[id]/actions.ts` | Create or update rating; award stars on first rate only |
| `addCommentAction` | `app/(dashboard)/dreams/[id]/actions.ts` | Create comment + award stars + notify |
| `addReplyAction` | `app/(dashboard)/dreams/[id]/actions.ts` | Create reply + award stars + notify |
| `updateDreamAction` | `app/(dashboard)/dreams/[id]/edit/actions.ts` | Update title/content/tags (owner only) |
| `archiveDreamAction` | `app/(dashboard)/dreams/[id]/actions.ts` | Set `archivedAt` + redirect to `/` |
| `updateCommentAction` | `app/(dashboard)/dreams/[id]/actions.ts` | Update comment content (owner only) |
| `archiveCommentAction` | `app/(dashboard)/dreams/[id]/actions.ts` | Set `archivedAt` on comment (owner only) |

---

## 8. Game API Contract

The 3D Dream World communicates via two REST endpoints. Both require an active NextAuth session cookie.

### `GET /api/game/dreams/random`

Returns a random live dream (`archivedAt: null`).

**Response:**
```json
{
  "id": "clx...",
  "title": "Sky Island",
  "content": "I found a floating island above the clouds...",
  "author": { "username": "PixelTraveler", "avatarId": 3 },
  "averageRating": 4.9,
  "ratingCount": 24,
  "tags": ["fantasy", "flying"]
}
```

**Errors:** `401` if not authenticated · `404` if no dreams exist.

### `POST /api/game/dreams/[id]/rate`

Submit a rating from the game. Uses the same upsert logic as `rateDreamAction` — no double star awards on re-rate.

**Request body:**
```json
{ "value": 5 }
```

**Response:**
```json
{
  "success": true,
  "newAverageRating": 4.95,
  "starsEarned": 5
}
```

**Errors:** `401` unauthenticated · `400` invalid value (not 1–5) or self-rating · `404` dream not found.

---

## 9. Component Responsibilities

### Layout
| Component | Responsibility |
| --------- | -------------- |
| `Sidenav.tsx` | Sticky left nav — logo, nav links with active state + sparkle, user card, background image |
| `UserCard.tsx` | Avatar, username, live ★ count, live 💬 count (props from layout, not JWT) |
| `TopBar.tsx` | Sticky top — search bar (links to Explore), bell (links to Activity), avatar dropdown |
| `UserDropdown.tsx` | Client component — avatar click opens Profile / Log out menu |

### Dreams
| Component | Responsibility |
| --------- | -------------- |
| `DreamCard.tsx` | Compact card for ranked lists and profile grids — cover thumbnail, title, author, rating, tags |
| `FeaturedDreamCard.tsx` | Two-column hero card — cover image, excerpt, rating, comment count, tags as `TagBadge` |
| `DreamForm.tsx` | Shared create + edit form — accepts `initialTitle/Content/Tags` for pre-population on edit |
| `DeleteDreamButton.tsx` | "Delete" text link + `ConfirmModal` — calls `archiveDreamAction` on confirm |

### Comments
| Component | Responsibility |
| --------- | -------------- |
| `CommentThread.tsx` | Recursive renderer — shows edit/delete controls to comment owner; inline textarea on edit; `ConfirmModal` on delete |
| `CommentInput.tsx` | Textarea + submit for new top-level comments and replies |

### UI Primitives
| Component | Responsibility |
| --------- | -------------- |
| `StarRating.tsx` | 1–5 star widget — `interactive` prop enables click; `onRate` callback; `value` for current state |
| `ConfirmModal.tsx` | Generic danger confirmation — `isOpen`, `onClose`, `onConfirm`, `isPending` props |
| `TagChip.tsx` | Linked tag pill — renders `<Link href="/explore?tag=...">` (use standalone, NOT inside a card link) |
| `TagBadge.tsx` | Non-linked tag pill — identical visual to `TagChip` but renders `<span>` (use inside `<Link>`-wrapped cards to avoid nested `<a>`) |
| `Avatar.tsx` | Renders preset avatar by `avatarId` (1–5) |
| `BackButton.tsx` | `router.back()` button — appears at top of all non-home dashboard pages |

---

## 10. Soft-Delete Pattern

Both `Dream` and `Comment` use a nullable `archivedAt DateTime?` field for soft deletion.

**Archiving:**
```typescript
await prisma.dream.update({ where: { id }, data: { archivedAt: new Date() } });
```

**Querying live content** (must be applied at every query site):
```typescript
where: { archivedAt: null }
```

**Files that filter archived content:**
- `app/(dashboard)/dreams/[id]/page.tsx` — dream + all comment nesting levels
- `app/(dashboard)/explore/page.tsx`
- `app/(dashboard)/profile/[username]/page.tsx`
- `lib/ranking.ts`, `lib/featured.ts`, `lib/activity.ts`
- `app/api/game/dreams/random/route.ts`

---

## 11. Cover Images

**File:** `lib/cover-images.ts`

18 illustrated images (`coverphoto-1.png` → `coverphoto-18.png`) in `public/images/cover-photos/`.

```typescript
export const COVER_IMAGES = [
  "coverphoto-1.png", ..., "coverphoto-18.png"
] as const;

export function randomCoverImage(): string { ... }
export function coverImageUrl(filename: string): string {
  return `/images/cover-photos/${filename}`;
}
```

Assigned on dream creation via `coverImage: randomCoverImage()` in `createDreamAction`. To add more images: drop files in `public/images/cover-photos/` following the naming convention, add to the `COVER_IMAGES` array, run `npx tsx prisma/backfill-covers.ts` to re-randomise existing dreams.

---

## 12. Testing

**Framework:** Jest + React Testing Library  
**Config:** `jest.config.ts` (Next.js jest preset), `jest.setup.ts` (jest-dom matchers)

| Suite | File | Tests |
| ----- | ---- | ----- |
| Bayesian ranking | `lib/__tests__/ranking.test.ts` | 4 |
| Cover images | `lib/__tests__/cover-images.test.ts` | 6 |
| Star transactions | `lib/__tests__/stars.test.ts` | 4 |
| ConfirmModal | `components/__tests__/ConfirmModal.test.tsx` | 9 |
| StarRating | `components/__tests__/StarRating.test.tsx` | 7 |

**Total: 30 tests** — all pass with no network calls. Run with `npm test`.

**Mock pattern for Prisma** (avoids Jest hoisting pitfall):
```typescript
// jest.mock() is hoisted before const declarations — define fns inline in the factory,
// then access them via the imported mocked module (not closure variables).
jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn().mockResolvedValue([]),
    starTransaction: { create: jest.fn() },
    user: { update: jest.fn() },
  },
}));
import { prisma } from "@/lib/prisma";
const mockTransaction = prisma.$transaction as jest.Mock;
```

---

## 13. Environment Variables

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string. Use `sslmode=verify-full` to silence SSL deprecation warning. |
| `NEXTAUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | `http://localhost:3000` locally; full Vercel URL in production |

---

## 14. Schema Management

This project uses **`prisma db push`** (no migrations directory). Schema changes:

```bash
# After editing prisma/schema.prisma:
npx prisma db push
npx prisma generate   # (runs automatically via postinstall on npm install)
```

> For collaborators: after pulling schema changes, run `npx prisma generate` if `npm install` hasn't been run yet.

The `postinstall` script in `package.json` ensures `prisma generate` runs automatically on every `npm install`.
