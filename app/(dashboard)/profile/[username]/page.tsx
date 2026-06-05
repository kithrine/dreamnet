import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DreamCard from "@/components/dreams/DreamCard";
import DeleteDreamButton from "@/components/dreams/DeleteDreamButton";
import Avatar from "@/components/ui/Avatar";
import BackButton from "@/components/ui/BackButton";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [user, session] = await Promise.all([
    prisma.user.findUnique({
      where: { username },
      include: {
        dreams: {
          where: { archivedAt: null },
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { username: true, avatarId: true } },
            tags: { include: { tag: { select: { name: true } } } },
            _count: { select: { comments: true } },
          },
        },
      },
    }),
    getServerSession(authOptions),
  ]);
  if (!user) notFound();

  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <BackButton />
      <div className="flex items-center gap-6">
        <Avatar avatarId={user.avatarId} className="w-20 h-20" />
        <div>
          <h1 className="font-sans text-2xl font-bold text-dream-bright">{user.username}</h1>
          <p className="font-sans font-medium text-dream-gold text-sm mt-2">★ {user.totalStars} stars</p>
          <p className="font-sans font-medium text-dream-muted text-sm mt-1">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <p className="font-sans font-medium text-dream-muted text-sm">{user.dreams.length} dream{user.dreams.length !== 1 ? "s" : ""} posted</p>
        </div>
      </div>

      <div>
        <h2 className="font-sans font-semibold text-dream-text text-sm mb-4">Dreams</h2>
        <div className="space-y-3">
          {user.dreams.map((dream) =>
            isOwnProfile ? (
              <div key={dream.id} className="relative group">
                <DreamCard dream={dream} />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteDreamButton dreamId={dream.id} />
                </div>
              </div>
            ) : (
              <DreamCard key={dream.id} dream={dream} />
            )
          )}
          {user.dreams.length === 0 && (
            <p className="font-sans text-dream-muted text-sm">This dreamer hasn&apos;t posted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
