import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";

export default async function TopBar() {
  const session = await getServerSession(authOptions);
  const { username, avatarId } = session!.user;

  return (
    <div className="sticky top-0 z-30 glass-surface border-b border-white/8 px-6 py-3 flex items-center gap-4">
      {/* Search bar */}
      <div className="flex-1 flex items-center gap-2 rounded-full bg-white/8 border border-white/15 px-4 py-2">
        <svg
          className="w-4 h-4 text-dream-muted flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Link
          href="/explore"
          className="flex-1 font-sans text-sm text-dream-muted/70 hover:text-dream-muted transition-colors"
        >
          Search dreams, users, or tags...
        </Link>
        <span className="text-dream-gold text-sm">✦</span>
      </div>

      {/* Bell / notifications */}
      <Link href="/activity" aria-label="Notifications">
        <svg
          className="w-5 h-5 text-dream-muted hover:text-dream-text transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </Link>

      {/* Avatar + dropdown chevron → links to profile */}
      <Link
        href={`/profile/${username}`}
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
      >
        <Avatar avatarId={avatarId} className="w-8 h-8" />
        <svg
          className="w-4 h-4 text-dream-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Link>
    </div>
  );
}
