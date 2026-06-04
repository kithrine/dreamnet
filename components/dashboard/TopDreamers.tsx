import Link from "next/link";
import Avatar from "@/components/ui/Avatar";

type Dreamer = { id: string; username: string; avatarId: number; totalStars: number };

export default function TopDreamers({ dreamers }: { dreamers: Dreamer[] }) {
  return (
    <div className="dream-card p-5">
      <h3 className="font-sans font-semibold text-dream-text text-sm mb-4 flex items-center gap-2">
        🏆 Top Dreamers
      </h3>
      <div className="space-y-3">
        {dreamers.map((dreamer, i) => (
          <Link
            key={dreamer.id}
            href={`/profile/${dreamer.username}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <span className="font-sans text-dream-muted text-xs w-4 text-center">{i + 1}</span>
            <Avatar avatarId={dreamer.avatarId} className="w-8 h-8" />
            <span className="font-sans text-dream-text text-sm flex-1 truncate font-medium">
              {dreamer.username}
            </span>
            <span className="font-sans text-dream-gold text-xs font-semibold">
              ★ {dreamer.totalStars}
            </span>
          </Link>
        ))}
        {dreamers.length === 0 && (
          <p className="font-sans text-dream-muted text-xs">No dreamers yet.</p>
        )}
      </div>
    </div>
  );
}
