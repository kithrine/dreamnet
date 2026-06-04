import Link from "next/link";

type Dreamer = { id: string; username: string; avatarId: number; totalStars: number };

const AVATAR_COLORS: Record<number, string> = {
  1: "#7c3aed", 2: "#2563eb", 3: "#16a34a", 4: "#dc2626", 5: "#ca8a04",
};

export default function TopDreamers({ dreamers }: { dreamers: Dreamer[] }) {
  return (
    <div className="bg-dream-surface pixel-border p-4">
      <h3 className="font-pixel text-dream-text text-xs tracking-widest mb-4">TOP DREAMERS</h3>
      <div className="space-y-3">
        {dreamers.map((dreamer, i) => (
          <Link key={dreamer.id} href={`/profile/${dreamer.username}`} className="flex items-center gap-3 hover:opacity-80">
            <span className="font-pixel text-dream-muted text-xs w-4">{i + 1}</span>
            <div
              className="w-8 h-8 rounded flex-shrink-0"
              style={{ backgroundColor: AVATAR_COLORS[dreamer.avatarId] ?? "#7c3aed" }}
            />
            <span className="font-sans text-dream-text text-sm flex-1 truncate">{dreamer.username}</span>
            <span className="font-pixel text-dream-gold text-xs">★ {dreamer.totalStars}</span>
          </Link>
        ))}
        {dreamers.length === 0 && (
          <p className="font-pixel text-dream-muted text-xs">No dreamers yet.</p>
        )}
      </div>
    </div>
  );
}
