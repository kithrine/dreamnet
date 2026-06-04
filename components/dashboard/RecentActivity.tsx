import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import type { ActivityItem } from "@/lib/activity";

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="font-sans font-semibold text-dream-text text-sm mb-3 flex items-center gap-2">
        🌀 Recent Activity
      </h2>
      <div className="dream-card divide-y divide-white/6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar avatarId={item.user.avatarId} className="w-8 h-8 flex-shrink-0" />
            <p className="font-sans text-sm text-dream-text flex-1 min-w-0">
              <span className="font-semibold">{item.user.username}</span>
              {" commented on "}
              <Link
                href={`/dreams/${item.dream.id}`}
                className="text-dream-violet hover:text-dream-bright transition-colors"
              >
                {item.dream.title}
              </Link>
            </p>
            <span className="font-sans text-dream-muted text-xs flex-shrink-0 whitespace-nowrap">
              {timeAgo(item.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
