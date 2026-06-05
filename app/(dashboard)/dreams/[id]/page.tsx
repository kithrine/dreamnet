import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TagChip from "@/components/ui/TagChip";
import BackButton from "@/components/ui/BackButton";
import DeleteDreamButton from "@/components/dreams/DeleteDreamButton";
import RatingSection from "./RatingSection";
import CommentSection from "./CommentSection";
import Link from "next/link";

async function getDream(id: string) {
  return prisma.dream.findUnique({
    where: { id, archivedAt: null },
    include: {
      user: { select: { id: true, username: true, avatarId: true, totalStars: true } },
      tags: { include: { tag: { select: { name: true } } } },
      comments: {
        where: { parentId: null, archivedAt: null },
        include: {
          user: { select: { username: true, avatarId: true } },
          replies: {
            where: { archivedAt: null },
            include: {
              user: { select: { username: true, avatarId: true } },
              replies: {
                where: { archivedAt: null },
                include: {
                  user: { select: { username: true, avatarId: true } },
                  replies: {
                    where: { archivedAt: null },
                    include: { user: { select: { username: true, avatarId: true } } },
                    orderBy: { createdAt: "asc" },
                  },
                },
                orderBy: { createdAt: "asc" },
              },
            },
            orderBy: { createdAt: "asc" },
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

  const isOwner = !!session && session.user.id === dream.user.id;
  const canRate = !!session && !isOwner;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <BackButton />
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
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="font-sans text-2xl font-bold text-dream-gold">{dream.title}</h1>
          {/* Author controls */}
          {isOwner && (
            <div className="flex items-center gap-3 flex-shrink-0 mt-1">
              <Link
                href={`/dreams/${dream.id}/edit`}
                className="font-sans text-xs text-dream-muted hover:text-dream-text transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
              <DeleteDreamButton dreamId={dream.id} />
            </div>
          )}
        </div>
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
        <CommentSection
          dreamId={dream.id}
          comments={dream.comments}
          canComment={!!session}
          currentUserId={session?.user?.id}
        />
      </div>
    </div>
  );
}
