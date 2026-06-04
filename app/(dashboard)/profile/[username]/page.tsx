import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DreamCard from "@/components/dreams/DreamCard";

const AVATAR_COLORS: Record<number, string> = {
  1: "#7c3aed", 2: "#2563eb", 3: "#16a34a", 4: "#dc2626", 5: "#ca8a04",
};

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      dreams: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { username: true, avatarId: true } },
          tags: { include: { tag: { select: { name: true } } } },
          _count: { select: { comments: true } },
        },
      },
    },
  });
  if (!user) notFound();

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-6">
        <div
          className="w-20 h-20 rounded-full flex-shrink-0"
          style={{ backgroundColor: AVATAR_COLORS[user.avatarId] ?? "#7c3aed" }}
        />
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
          {user.dreams.map((dream) => <DreamCard key={dream.id} dream={dream} />)}
          {user.dreams.length === 0 && (
            <p className="font-sans text-dream-muted text-sm">This dreamer hasn&apos;t posted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
