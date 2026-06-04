import Link from "next/link";
import TagChip from "@/components/ui/TagChip";

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

export default function DreamCard({ dream, rank }: DreamCardProps) {
  return (
    <Link href={`/dreams/${dream.id}`} className="block">
      <div className="flex items-center gap-4 bg-dream-surface pixel-border p-4 hover:border-dream-violet transition-colors">
        {rank !== undefined && (
          <span className="font-pixel text-dream-gold text-sm w-6 text-center">{rank}</span>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-pixel text-dream-violet text-xs truncate">{dream.title}</h3>
          <p className="font-sans text-dream-muted text-xs mt-1">by {dream.user.username}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="font-pixel text-dream-gold text-xs">★ {dream.averageRating.toFixed(1)}</span>
            <span className="font-pixel text-dream-muted text-xs">💬 {dream._count.comments}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
