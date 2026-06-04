import { Session } from "next-auth";
import Avatar from "@/components/ui/Avatar";

export default function UserCard({ session }: { session: Session }) {
  const { username, avatarId, totalStars } = session.user;
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
      <Avatar avatarId={avatarId} className="w-10 h-10" />
      <div className="min-w-0">
        <p className="font-sans text-dream-text text-sm font-semibold truncate">{username}</p>
        <p className="font-sans text-dream-muted text-xs truncate">@{username}</p>
        <span className="font-sans text-dream-gold text-xs font-medium">★ {totalStars}</span>
      </div>
    </div>
  );
}
