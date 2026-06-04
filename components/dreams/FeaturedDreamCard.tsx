import Link from "next/link";
import TagChip from "@/components/ui/TagChip";

type FeaturedDreamProps = {
  dream: {
    id: string;
    title: string;
    content: string;
    averageRating: number;
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
          {/* Illustration placeholder — replaced when images are added */}
          <div className="w-56 h-48 rounded-xl flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-violet-600 via-dream-purple to-indigo-900">
            {/* Glow orb */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-dream-violet/50 blur-2xl" />
            {/* Moon */}
            <div className="absolute top-4 right-6 text-3xl opacity-80">🌙</div>
            {/* Sparkles */}
            <div className="absolute top-6  left-6  text-dream-gold/70 text-xs">✦</div>
            <div className="absolute bottom-8 right-8 text-dream-gold/50 text-base">✦</div>
            <div className="absolute bottom-4 left-10 text-dream-gold/40 text-xs">✦</div>
            <div className="absolute top-16 right-4 text-dream-rose/40 text-xs">✦</div>
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-indigo-900/80 to-transparent" />
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
                  <TagChip key={tag.name} name={tag.name} />
                ))}
              </div>
              <div className="flex items-center gap-5">
                <span className="font-sans text-dream-gold text-sm font-semibold">
                  ★ {dream.averageRating.toFixed(1)}
                </span>
                <span className="font-sans text-dream-muted text-sm">
                  💬 {dream._count.comments}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
