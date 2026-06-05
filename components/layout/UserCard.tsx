import { Session } from "next-auth";
import Avatar from "@/components/ui/Avatar";

interface UserCardProps {
  session: Session;
  commentCount: number;
  totalStars: number;
}

export default function UserCard({ session, commentCount, totalStars }: UserCardProps) {
  const { username, avatarId } = session.user;
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10">
      <Avatar avatarId={avatarId} className="w-10 h-10 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-sans text-white text-sm font-semibold truncate">{username}</p>
        <p className="font-sans text-white/50 text-xs truncate">@{username}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="font-sans text-dream-gold text-xs font-medium">★ {totalStars}</span>
          <span className="font-sans text-white/50 text-xs flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              {commentCount}
            </span>
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
