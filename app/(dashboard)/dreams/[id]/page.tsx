import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TagChip from "@/components/ui/TagChip";
import RatingSection from "./RatingSection";
import CommentSection from "./CommentSection";
import Link from "next/link";

async function getDream(id: string) {
  return prisma.dream.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, avatarId: true, totalStars: true } },
      tags: { include: { tag: { select: { name: true } } } },
      comments: {
        where: { parentId: null },
        include: {
          user: { select: { username: true, avatarId: true } },
          replies: {
            include: {
              user: { select: { username: true, avatarId: true } },
              replies: {
                include: {
                  user: { select: { username: true, avatarId: true } },
                  replies: { include: { user: { select: { username: true, avatarId: true } }, replies: [] } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export default async function DreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [dream, session] = await Promise.all([
    getDream(id),
    getServerSession(authOptions),
  ]);
  if (!dream) notFound();

  const userRating = session
    ? await prisma.rating.findUnique({
        where: { userId_dreamId: { userId: session.user.id, dreamId: dream.id } },
      })
    : null;

  const canRate = !!session && dream.userId !== session.user.id && !userRating;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-pixel text-dream-gold text-base mb-2">{dream.title}</h1>
        <div className="flex items-center gap-3">
          <Link href={`/profile/${dream.user.username}`} className="font-pixel text-dream-violet text-xs hover:text-dream-bright">
            by {dream.user.username}
          </Link>
          <span className="font-pixel text-dream-gold text-xs">★ {dream.user.totalStars}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {dream.tags.map(({ tag }) => <TagChip key={tag.name} name={tag.name} />)}
        </div>
      </div>

      {/* Content */}
      <div className="bg-dream-surface pixel-border p-6">
        <p className="font-sans text-dream-text text-sm leading-relaxed whitespace-pre-wrap">{dream.content}</p>
      </div>

      {/* Rating */}
      <div className="bg-dream-surface pixel-border p-6 space-y-3">
        <h2 className="font-pixel text-dream-text text-xs tracking-widest">RATING</h2>
        <div className="flex items-center gap-4">
          <span className="font-pixel text-dream-gold text-sm">★ {dream.averageRating.toFixed(1)}</span>
          <span className="font-pixel text-dream-muted text-xs">{dream.ratingCount} rating{dream.ratingCount !== 1 ? "s" : ""}</span>
        </div>
        <RatingSection dreamId={dream.id} canRate={canRate} existingRating={userRating?.value} />
      </div>

      {/* Comments */}
      <div className="bg-dream-surface pixel-border p-6 space-y-4">
        <h2 className="font-pixel text-dream-text text-xs tracking-widest">
          COMMENTS ({dream.comments.length})
        </h2>
        <CommentSection dreamId={dream.id} comments={dream.comments} canComment={!!session} />
      </div>
    </div>
  );
}
