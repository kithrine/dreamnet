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
                  replies: { include: { user: { select: { username: true, avatarId: true } } } },
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
      {/* Cover image hero */}
      <div className="w-full h-56 rounded-2xl overflow-hidden">
        <img
          src={`/images/cover-photos/${dream.coverImage}`}
          alt={dream.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Header */}
      <div>
        <h1 className="font-sans text-2xl font-bold text-dream-gold mb-2">{dream.title}</h1>
        <div className="flex items-center gap-3">
          <Link href={`/profile/${dream.user.username}`} className="font-sans text-dream-violet text-sm hover:text-dream-bright transition-colors">
            by {dream.user.username}
          </Link>
          <span className="font-sans font-medium text-dream-gold text-sm">★ {dream.user.totalStars}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {dream.tags.map(({ tag }) => <TagChip key={tag.name} name={tag.name} />)}
        </div>
      </div>

      {/* Content */}
      <div className="dream-card p-6">
        <p className="font-sans text-dream-text text-sm leading-relaxed whitespace-pre-wrap">{dream.content}</p>
      </div>

      {/* Rating */}
      <div className="dream-card p-6 space-y-3">
        <h2 className="font-sans font-semibold text-dream-text text-sm">Rating</h2>
        <div className="flex items-center gap-4">
          <span className="font-sans font-medium text-dream-gold text-sm">★ {dream.averageRating.toFixed(1)}</span>
          <span className="font-sans text-dream-muted text-sm">{dream.ratingCount} rating{dream.ratingCount !== 1 ? "s" : ""}</span>
        </div>
        <RatingSection dreamId={dream.id} canRate={canRate} existingRating={userRating?.value} />
      </div>

      {/* Comments */}
      <div className="dream-card p-6 space-y-4">
        <h2 className="font-sans font-semibold text-dream-text text-sm">
          Comments ({dream.comments.length})
        </h2>
        <CommentSection dreamId={dream.id} comments={dream.comments} canComment={!!session} />
      </div>
    </div>
  );
}
