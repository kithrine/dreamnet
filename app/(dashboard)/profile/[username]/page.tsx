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
          className="w-20 h-20 rounded pixel-border flex-shrink-0"
          style={{ backgroundColor: AVATAR_COLORS[user.avatarId] ?? "#7c3aed" }}
        />
        <div>
          <h1 className="font-pixel text-dream-bright text-sm">{user.username}</h1>
          <p className="font-pixel text-dream-gold text-xs mt-2">★ {user.totalStars} stars</p>
          <p className="font-pixel text-dream-muted text-xs mt-1">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <p className="font-pixel text-dream-muted text-xs">{user.dreams.length} dream{user.dreams.length !== 1 ? "s" : ""} posted</p>
        </div>
      </div>

      <div>
        <h2 className="font-pixel text-dream-text text-xs tracking-widest mb-4">DREAMS</h2>
        <div className="space-y-3">
          {user.dreams.map((dream) => <DreamCard key={dream.id} dream={dream} />)}
          {user.dreams.length === 0 && (
            <p className="font-pixel text-dream-muted text-xs">This dreamer hasn&apos;t posted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
