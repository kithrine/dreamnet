import { Session } from "next-auth";
import Avatar from "@/components/ui/Avatar";

interface UserCardProps {
  session: Session;
  commentCount: number;
}

export default function UserCard({ session, commentCount }: UserCardProps) {
  const { username, avatarId, totalStars } = session.user;
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10">
      <Avatar avatarId={avatarId} className="w-10 h-10 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-sans text-white text-sm font-semibold truncate">{username}</p>
        <p className="font-sans text-white/50 text-xs truncate">@{username}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="font-sans text-dream-gold text-xs font-medium">★ {totalStars}</span>
          <span className="font-sans text-white/50 text-xs">💬 {commentCount}</span>
        </div>
      </div>
      {/* Chevron */}
      <svg
        className="w-4 h-4 text-white/40 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
