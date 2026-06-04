import { Session } from "next-auth";

const AVATAR_COLORS: Record<number, string> = {
  1: "#7c3aed", 2: "#2563eb", 3: "#16a34a", 4: "#dc2626", 5: "#ca8a04",
};

export default function UserCard({ session }: { session: Session }) {
  const { username, avatarId, totalStars } = session.user;
  return (
    <div className="flex items-center gap-3 p-3 bg-dream-purple pixel-border">
      <div
        className="w-10 h-10 rounded flex-shrink-0"
        style={{ backgroundColor: AVATAR_COLORS[avatarId] ?? "#7c3aed" }}
      />
      <div className="min-w-0">
        <p className="font-sans text-dream-text text-sm font-semibold truncate">{username}</p>
        <p className="font-pixel text-dream-gold text-xs">@{username}</p>
        <div className="flex gap-3 mt-1">
          <span className="font-pixel text-dream-gold text-xs">★ {totalStars}</span>
        </div>
      </div>
    </div>
  );
}
