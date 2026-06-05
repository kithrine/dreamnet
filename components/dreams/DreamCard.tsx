"use client";

import Link from "next/link";

type DreamCardProps = {
  dream: {
    id: string;
    title: string;
    averageRating: number;
    ratingCount: number;
    coverImage: string;
    user: { username: string; avatarId: number };
    tags: { tag: { name: string } }[];
    _count: { comments: number };
  };
  rank?: number;
};

export default function DreamCard({ dream, rank }: DreamCardProps) {

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
        <div className="w-20 h-16 rounded-xl flex-shrink-0 overflow-hidden bg-dream-purple/40">
          <img
            src={`/images/cover-photos/${dream.coverImage}`}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-sans font-semibold text-sm text-dream-text truncate group-hover:text-dream-bright transition-colors">
            {dream.title}
          </h3>
          <p className="font-sans text-dream-muted text-xs mt-0.5">by {dream.user.username}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="font-sans text-dream-gold text-xs font-medium">★ {dream.averageRating.toFixed(1)}</span>
            <span className="font-sans text-dream-muted text-xs flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              {dream._count.comments}
            </span>
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
