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
  const excerpt = dream.content.slice(0, 200) + (dream.content.length > 200 ? "..." : "");

  return (
    <Link href={`/dreams/${dream.id}`} className="block">
      <div className="bg-dream-surface pixel-border-gold p-6 hover:border-dream-bright transition-colors">
        <div className="flex flex-col gap-3">
          <h2 className="font-pixel text-dream-gold text-base">{dream.title}</h2>
          <p className="font-pixel text-dream-muted text-xs">by {dream.user.username}</p>
          <p className="font-sans text-dream-text text-sm leading-relaxed">{excerpt}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {dream.tags.map(({ tag }) => <TagChip key={tag.name} name={tag.name} />)}
          </div>
          <div className="flex items-center gap-6 mt-2">
            <span className="font-pixel text-dream-gold text-xs">★ {dream.averageRating.toFixed(1)}</span>
            <span className="font-pixel text-dream-muted text-xs">💬 {dream._count.comments}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
