import Link from "next/link";
import TagBadge from "@/components/ui/TagBadge";

type FeaturedDreamProps = {
  dream: {
    id: string;
    title: string;
    content: string;
    averageRating: number;
    coverImage: string;
    user: { username: string };
    tags: { tag: { name: string } }[];
    _count: { comments: number };
  };
};

export default function FeaturedDreamCard({ dream }: FeaturedDreamProps) {
  const excerpt = dream.content.slice(0, 180) + (dream.content.length > 180 ? "..." : "");

  return (
    <Link href={`/dreams/${dream.id}`} className="block group">
      <div className="dream-card-gold p-5 hover:border-dream-gold/50 transition-colors">
        <div className="flex gap-6">
          {/* Cover image */}
          <div className="w-56 h-48 rounded-xl flex-shrink-0 overflow-hidden">
            <img
              src={`/images/cover-photos/${dream.coverImage}`}
              alt={dream.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="font-sans text-2xl font-bold text-dream-gold leading-tight">
                  {dream.title}
                </h2>
                <span className="text-dream-gold/60 text-lg flex-shrink-0 mt-1">✦</span>
              </div>
              <p className="font-sans text-dream-muted text-sm mb-3">
                by {dream.user.username}{" "}
                <span className="text-dream-violet">✦</span>
              </p>
              <p className="font-sans text-dream-text text-sm leading-relaxed">{excerpt}</p>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
                {dream.tags.slice(0, 4).map(({ tag }) => (
                  <TagBadge key={tag.name} name={tag.name} />
                ))}
              </div>
              <div className="flex items-center gap-5">
                <span className="font-sans text-dream-gold text-sm font-semibold">
                  ★ {dream.averageRating.toFixed(1)}
                </span>
                <span className="font-sans text-dream-muted text-sm flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  {dream._count.comments}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
