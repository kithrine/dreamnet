import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidenav from "@/components/layout/Sidenav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  // Fetch totalStars fresh from the DB — the JWT session value is stale after awards
  const freshUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totalStars: true, _count: { select: { comments: true } } },
  });
  const totalStars = freshUser?.totalStars ?? 0;
  const commentCount = freshUser?._count.comments ?? 0;

  return (
    <div className="flex min-h-screen bg-dream-bg">
      <Sidenav session={session} commentCount={commentCount} totalStars={totalStars} />
      <main
        className="flex-1 ml-64 min-h-screen relative"
        style={{
          backgroundImage: "url('/images/dreamnet-dashboard-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Dark overlay so the bg doesn't overpower the content */}
        <div className="absolute inset-0 bg-dream-bg/80 pointer-events-none" />
        {/* Content sits above the overlay */}
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
