// gameData.ts
// -----------------------------------------------------------------------------
// Shared types, world constants, and data helpers for the game.
// All API calls here target the REAL backend routes your partner built:
//   READ:  GET  /api/game/dreams/random   -> one random dream
//   WRITE: POST /api/game/dreams/[id]/rate -> submit a 1-5 rating
// We never invent endpoints. The leaderboard is session-only for now, behind a
// single function (fetchLeaderboard) so it can be swapped to the real
// totalStars endpoint in ONE place once your partner ships it.
// -----------------------------------------------------------------------------

// The exact shape returned by GET /api/game/dreams/random (confirmed from route.ts).
// NOTE the real field names: `content` (not description) and author.username / author.avatarId.
export interface GameDream {
  id: string;
  title: string;
  content: string;
  author: { username: string; avatarId: number };
  averageRating: number;
  ratingCount: number;
  tags: string[];
}

// A dream rendered as a floating bubble in the world.
export interface DreamBubble {
  dream: GameDream;
  tint: number; // one of DREAM_TINTS
  // world position is managed by the scene; kept out of this type to stay framework-free
}

// ---- exact world constants (match dream-world-game-2-fixed.html mockup) ------

// Island geometry (THREE world units). Whole island is scaled by 1.35.
export const ISLAND = {
  topRadius: 5,
  bottomRadius: 4.6,
  topHeight: 1.1,
  segments: 22,
  lipTopRadius: 5.05,
  lipBottomRadius: 4.7,
  lipHeight: 0.4,
  coneRadius: 4.7,
  coneHeight: 7,
  scale: 1.35,
} as const;

// Effective walkable radius = topRadius * scale = 6.75. Used to clamp the avatar.
export const WALK_RADIUS = ISLAND.topRadius * ISLAND.scale; // 6.75

// Row layout: islands along X at y=0. Spacing 16 gives clear gaps between separate
// floating islands (the mockup's 7 overlaps; the prompt says raise to ~16-20 for gaps).
export const ISLAND_SPACING = 7;  // mockup value: islands overlap into one connected, walkable landmass
export const ISLAND_COUNT = 5; // a row of 5, connected (matches the mockup)

// Per-island bubble tint accents (used to vary flower/bubble color per island).
export const ISLAND_NAMES = ["Cyan Cove", "Rose Reach", "Violet Vale", "Mint Meadow", "Gold Glade"];

// Colors (hex) — copied exactly from the locked visual spec.
export const COLORS = {
  grass: 0x4aa84a,
  lip: 0x2d7a2d,
  underside: 0x5a4a6e,
  rockChunk: 0x4a3a5e,
  flowerStem: 0xd8c8f0,
  flowerBlossom: 0xffe066,
  flowerGlow: 0xffae3a,
  fog: 0x0a0826,
} as const;

// Cloud tints (random per cloud).
export const CLOUD_TINTS = [0x9b7ec4, 0xb8a4d4, 0xc9b8e0, 0x8a6eb8, 0xa890c8];

// Sky gradient stops (top -> bottom).
export const SKY_STOPS = [0x0a0826, 0x1a1245, 0x2a1d5e, 0x3a2870];

// Star colors for the background starfield.
export const STAR_COLORS = [0xffe066, 0xffffff, 0xccd9ff, 0xfff2b3];

// Dream bubble tints. Gold (#ffe066) is the last entry.
// PROMPT INTENT: gold marks "home-page-submitted" dreams. BACKEND REALITY: the API
// has no flag distinguishing dream origin (every dream is user-submitted via the home
// page), so we cannot currently single out "gold" dreams. For now we assign the four
// non-gold tints at random. If a `source`/`featured` flag is added later, switch gold
// on for those. (Flagged to discuss with partner — needs a schema/route field.)
export const DREAM_TINTS = [0x7ee0ff, 0xff9ed8, 0xc9a0ff, 0x9effc8];
export const GOLD_TINT = 0xffe066;

// ---- dream fetching (real endpoint) -----------------------------------------

// Fetch one random dream from the real route. Returns null on any non-OK status
// (e.g. 401 not logged in, 404 no dreams) so the caller can decide what to do.
export async function fetchRandomDream(): Promise<GameDream | null> {
  try {
    // same-origin call; the NextAuth session cookie rides along automatically
    const res = await fetch("/api/game/dreams/random", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as GameDream;
  } catch {
    return null;
  }
}

// Result of submitting a rating, normalized for the UI.
export interface RateResult {
  ok: boolean;
  status: number;
  // server payload on success
  newAverageRating?: number;
  starsEarned?: number;
  // human-readable reason on failure (own dream, already rated, etc.)
  message?: string;
}

// Submit a rating to the real route: POST /api/game/dreams/[id]/rate  body { value }.
// The route enforces: must be logged in (401), value 1-5 (400), not your own dream
// (400), not already rated (400), dream exists (404). We map those to friendly text.
export async function rateDream(dreamId: string, value: number): Promise<RateResult> {
  try {
    const res = await fetch(`/api/game/dreams/${dreamId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    const data = await res.json().catch(() => ({} as Record<string, unknown>));
    if (res.ok) {
      return {
        ok: true,
        status: res.status,
        newAverageRating: Number(data.newAverageRating ?? 0),
        starsEarned: Number(data.starsEarned ?? value),
      };
    }
    // Map known server errors to friendly messages.
    const err = String(data.error ?? "");
    let message = "Could not submit rating.";
    if (res.status === 401) message = "Please sign in on the home page to rate.";
    else if (/own dream/i.test(err)) message = "That's your own dream — pop someone else's!";
    else if (/already rated/i.test(err)) message = "You've already rated this dream.";
    else if (res.status === 404) message = "That dream is no longer available.";
    else if (/value/i.test(err)) message = "Pick a rating from 1 to 5.";
    return { ok: false, status: res.status, message };
  } catch {
    return { ok: false, status: 0, message: "Network error — try again." };
  }
}

// ---- leaderboard (session-only for now, with a seam for the real endpoint) ---

export interface LeaderRow {
  username: string;
  avatarId: number; // shown using the home-page pixel avatar 1-5
  count: number; // session score (dreams popped/rated this session)
  isYou?: boolean;
}

// Seeded placeholder entries so the panel looks alive in a demo. Clearly fake.
const SEED_ROWS: LeaderRow[] = [
  { username: "Nova_Owl", avatarId: 1, count: 42 },
  { username: "Cmdr_Vex", avatarId: 2, count: 37 },
  { username: "ShadowFox", avatarId: 3, count: 29 },
  { username: "Mistweaver", avatarId: 4, count: 24 },
  { username: "BreadCrumb", avatarId: 5, count: 18 },
];

// Build the leaderboard for display.
// TODO: swap to partner's real ranking endpoint (top users by User.totalStars)
//       when it ships — replace the body of this function with a fetch() to it.
//       Everything else in the game can stay the same.
export function fetchLeaderboard(you: { username: string; avatarId: number; count: number }): LeaderRow[] {
  const rows: LeaderRow[] = [...SEED_ROWS, { ...you, isYou: true }];
  rows.sort((a, b) => b.count - a.count);
  return rows;
}
