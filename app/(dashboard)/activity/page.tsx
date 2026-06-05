import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NotificationType } from "@prisma/client";

function notificationMessage(type: NotificationType, username: string | null, dreamTitle?: string) {
  const who = username ?? "Someone";
  switch (type) {
    case "RATING_RECEIVED": return `${who} rated your dream "${dreamTitle}"`;
    case "COMMENT_ON_DREAM": return `${who} commented on your dream "${dreamTitle}"`;
    case "REPLY_TO_COMMENT": return `${who} replied to your comment on "${dreamTitle}"`;
    default: return `${who} interacted with you`;
  }
}

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      dream: { select: { id: true, title: true } },
    },
  });

  const relatedUserIds = [...new Set(notifications.map((n) => n.relatedUserId).filter((id): id is string => id !== null))];
  const relatedUsers = await prisma.user.findMany({
    where: { id: { in: relatedUserIds } },
    select: { id: true, username: true },
  });
  const userMap = Object.fromEntries(relatedUsers.map((u) => [u.id, u.username]));

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="font-sans font-semibold text-dream-bright text-sm">Activity</h1>
      <div className="space-y-3">
        {notifications.map((n) => {
          const triggerUsername = n.relatedUserId ? userMap[n.relatedUserId] : null;
          return (
            <div key={n.id} className={`dream-card p-4 flex items-start gap-3 ${!n.read ? "border-dream-violet" : ""}`}>
              <span className="text-xl mt-0.5 flex-shrink-0">
                {n.type === "RATING_RECEIVED" ? "★" : n.type === "COMMENT_ON_DREAM" ? (
                  <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                ) : "↩️"}
              </span>
              <div>
                <p className="font-sans text-dream-text text-sm">
                  {notificationMessage(n.type, triggerUsername, n.dream?.title)}
                </p>
                {n.dream && (
                  <Link href={`/dreams/${n.dream.id}`} className="font-sans text-dream-muted text-xs hover:text-dream-bright transition-colors">
                    View dream →
                  </Link>
                )}
                <p className="font-sans text-dream-muted text-xs mt-1">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <p className="font-sans text-dream-muted text-sm">No activity yet. Start exploring dreams!</p>
        )}
      </div>
    </div>
  );
}
