import { prisma } from "@/lib/prisma";
import DreamCard from "@/components/dreams/DreamCard";
import TagChip from "@/components/ui/TagChip";
import Link from "next/link";

const PAGE_SIZE = 20;

async function searchDreams(q: string, tag: string, sort: string, page: number) {
  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
      { user: { username: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (tag) {
    where.tags = { some: { tag: { name: tag } } };
  }

  const orderBy =
    sort === "comments"
      ? { comments: { _count: "desc" as const } }
      : sort === "top"
      ? { averageRating: "desc" as const }
      : { createdAt: "desc" as const };

  const [dreams, total] = await Promise.all([
    prisma.dream.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { username: true, avatarId: true } },
        tags: { include: { tag: { select: { name: true } } } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.dream.count({ where }),
  ]);

  return { dreams, total, pages: Math.ceil(total / PAGE_SIZE) };
}

async function getAllTags() {
  return prisma.tag.findMany({ take: 20, orderBy: { dreams: { _count: "desc" } } });
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; sort?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const tag = sp.tag ?? "";
  const sort = sp.sort ?? "newest";
  const page = parseInt(sp.page ?? "1");

  const [{ dreams, total, pages }, allTags] = await Promise.all([
    searchDreams(q, tag, sort, page),
    getAllTags(),
  ]);

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams({ ...(q && { q }), ...(tag && { tag }), sort, page: String(page), ...overrides });
    return `/explore?${params}`;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="font-pixel text-dream-bright text-sm">EXPLORE DREAMS</h1>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search dreams, users, or tags..."
          className="flex-1 bg-dream-purple border border-dream-border p-3 text-dream-text font-sans focus:outline-none focus:border-dream-violet"
        />
        <button type="submit" className="font-pixel text-xs bg-dream-violet text-white px-4 pixel-border hover:bg-dream-bright">
          SEARCH
        </button>
      </form>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2">
        {tag && (
          <Link href="/explore" className="font-pixel text-xs text-red-400 border border-red-400 px-2 py-1 hover:bg-red-900/20">
            ✕ Clear filter
          </Link>
        )}
        {allTags.map((t) => <TagChip key={t.id} name={t.name} />)}
      </div>

      {/* Sort */}
      <div className="flex gap-2">
        {[
          { value: "newest", label: "Newest" },
          { value: "top", label: "Top Rated" },
          { value: "comments", label: "Most Comments" },
        ].map((s) => (
          <Link
            key={s.value}
            href={buildUrl({ sort: s.value, page: "1" })}
            className={`font-pixel text-xs px-3 py-2 pixel-border ${sort === s.value ? "bg-dream-violet text-white" : "text-dream-muted hover:text-dream-text"}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* Results */}
      <div>
        <p className="font-pixel text-dream-muted text-xs mb-4">
          {total} dream{total !== 1 ? "s" : ""} found
        </p>
        <div className="space-y-3">
          {dreams.map((dream) => <DreamCard key={dream.id} dream={dream} />)}
          {dreams.length === 0 && (
            <p className="font-pixel text-dream-muted text-xs">No dreams found. Try a different search.</p>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={buildUrl({ page: String(page - 1) })} className="font-pixel text-xs px-3 py-2 pixel-border text-dream-muted hover:text-dream-text">
              ← PREV
            </Link>
          )}
          <span className="font-pixel text-xs px-3 py-2 text-dream-muted">
            {page} / {pages}
          </span>
          {page < pages && (
            <Link href={buildUrl({ page: String(page + 1) })} className="font-pixel text-xs px-3 py-2 pixel-border text-dream-muted hover:text-dream-text">
              NEXT →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
