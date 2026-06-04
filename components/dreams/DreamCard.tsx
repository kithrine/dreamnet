import Link from "next/link";

type DreamCardProps = {
  dream: {
    id: string;
    title: string;
    averageRating: number;
    ratingCount: number;
    user: { username: string; avatarId: number };
    tags: { tag: { name: string } }[];
    _count: { comments: number };
  };
  rank?: number;
};

// Gradient placeholders keyed by common tag names
const TAG_GRADIENTS: Record<string, string> = {
  fantasy:   "from-violet-600 to-purple-900",
  adventure: "from-orange-500 to-red-800",
  ocean:     "from-blue-500 to-cyan-900",
  flying:    "from-sky-400 to-indigo-800",
  night:     "from-indigo-700 to-slate-900",
  lucid:     "from-teal-500 to-cyan-900",
  weird:     "from-fuchsia-600 to-purple-900",
  city:      "from-slate-500 to-gray-900",
  mystery:   "from-purple-700 to-slate-900",
  forest:    "from-green-600 to-emerald-900",
  space:     "from-blue-900 to-slate-950",
};

function getThumbnailGradient(tags: { tag: { name: string } }[]) {
  for (const { tag } of tags) {
    if (TAG_GRADIENTS[tag.name]) return TAG_GRADIENTS[tag.name];
  }
  return "from-dream-violet to-dream-purple";
}

export default function DreamCard({ dream, rank }: DreamCardProps) {
  const gradient = getThumbnailGradient(dream.tags);

  return (
    <Link href={`/dreams/${dream.id}`} className="block group">
      <div className="dream-card flex items-center gap-4 p-4 hover:border-white/20 transition-colors">
        {/* Rank badge */}
        {rank !== undefined && (
          <div className="w-7 h-7 rounded-full bg-dream-purple/80 flex items-center justify-center flex-shrink-0">
            <span className="font-sans font-bold text-xs text-dream-text">{rank}</span>
          </div>
        )}

        {/* Thumbnail */}
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex-shrink-0`} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-sans font-semibold text-sm text-dream-text truncate group-hover:text-dream-bright transition-colors">
            {dream.title}
          </h3>
          <p className="font-sans text-dream-muted text-xs mt-0.5">by {dream.user.username}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="font-sans text-dream-gold text-xs font-medium">★ {dream.averageRating.toFixed(1)}</span>
            <span className="font-sans text-dream-muted text-xs">💬 {dream._count.comments}</span>
          </div>
        </div>

        {/* Bookmark icon */}
        <button
          onClick={(e) => e.preventDefault()}
          className="flex-shrink-0 text-dream-muted hover:text-dream-bright transition-colors"
          aria-label="Bookmark"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </Link>
  );
}
