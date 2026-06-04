import Link from "next/link";

type Dreamer = { id: string; username: string; avatarId: number; totalStars: number };

const AVATAR_COLORS: Record<number, string> = {
  1: "#7c3aed", 2: "#2563eb", 3: "#16a34a", 4: "#dc2626", 5: "#ca8a04",
};

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
            <div
              className="w-8 h-8 rounded-full flex-shrink-0"
              style={{ backgroundColor: AVATAR_COLORS[dreamer.avatarId] ?? "#7c3aed" }}
            />
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
