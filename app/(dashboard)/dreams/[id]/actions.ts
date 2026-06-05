"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardStars } from "@/lib/stars";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function rateDreamAction(dreamId: string, value: number) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Not authenticated." };
  if (value < 1 || value > 5) return { error: "Invalid rating." };

  // Verify the session user actually exists in the DB (guards against stale JWT after a DB reset)
  const userExists = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true } });
  if (!userExists) return { error: "Session expired. Please sign out and sign back in." };

  const dream = await prisma.dream.findUnique({ where: { id: dreamId } });
  if (!dream) return { error: "Dream not found." };
  if (dream.userId === session.user.id) return { error: "You cannot rate your own dream." };

  const existing = await prisma.rating.findUnique({
    where: { userId_dreamId: { userId: session.user.id, dreamId } },
  });

  if (existing) {
    // Re-rating: update value only, no additional star award
    await prisma.rating.update({
      where: { userId_dreamId: { userId: session.user.id, dreamId } },
      data: { value },
    });
  } else {
    // First-time rating: create, award stars, notify dream owner
    await prisma.rating.create({ data: { value, userId: session.user.id, dreamId } });
    await awardStars(dream.userId, value, "RECEIVE_RATING");
    await prisma.notification.create({
      data: {
        userId: dream.userId,
        type: "RATING_RECEIVED",
        relatedDreamId: dreamId,
        relatedUserId: session.user.id,
      },
    });
  }

  // Always recalculate average (covers both first rating and re-rating)
  const agg = await prisma.rating.aggregate({
    where: { dreamId },
    _avg: { value: true },
    _count: { value: true },
  });
  await prisma.dream.update({
    where: { id: dreamId },
    data: {
      averageRating: agg._avg.value ?? 0,
      ratingCount: agg._count.value,
    },
  });

  revalidatePath(`/dreams/${dreamId}`);
  return { success: true };
}

export async function addCommentAction(dreamId: string, content: string, parentId?: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Not authenticated." };
  if (!content.trim()) return { error: "Comment cannot be empty." };

  const userExists = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true } });
  if (!userExists) return { error: "Session expired. Please sign out and sign back in." };

  const dream = await prisma.dream.findUnique({ where: { id: dreamId } });
  if (!dream) return { error: "Dream not found." };

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      userId: session.user.id,
      dreamId,
      parentId: parentId ?? null,
    },
  });

  await awardStars(session.user.id, 1, "LEAVE_COMMENT");

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (parent && parent.userId !== session.user.id) {
      await awardStars(parent.userId, 1, "RECEIVE_REPLY");
      await prisma.notification.create({
        data: {
          userId: parent.userId,
          type: "REPLY_TO_COMMENT",
          relatedDreamId: dreamId,
          relatedUserId: session.user.id,
        },
      });
    }
  } else if (dream.userId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: dream.userId,
        type: "COMMENT_ON_DREAM",
        relatedDreamId: dreamId,
        relatedUserId: session.user.id,
      },
    });
  }

  revalidatePath(`/dreams/${dreamId}`);
  return { success: true, commentId: comment.id };
}

export async function updateCommentAction(commentId: string, dreamId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated." };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });
  if (!comment || comment.userId !== session.user.id) return { error: "Not authorized." };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Comment cannot be empty." };

  await prisma.comment.update({ where: { id: commentId }, data: { content: trimmed } });
  revalidatePath(`/dreams/${dreamId}`);
  return { success: true };
}

export async function archiveCommentAction(commentId: string, dreamId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated." };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });
  if (!comment || comment.userId !== session.user.id) return { error: "Not authorized." };

  await prisma.comment.update({ where: { id: commentId }, data: { archivedAt: new Date() } });
  revalidatePath(`/dreams/${dreamId}`);
  return { success: true };
}

export async function archiveDreamAction(dreamId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated." };

  const dream = await prisma.dream.findUnique({
    where: { id: dreamId },
    select: { userId: true },
  });
  if (!dream) return { error: "Dream not found." };
  if (dream.userId !== session.user.id) return { error: "Not authorized." };

  await prisma.dream.update({ where: { id: dreamId }, data: { archivedAt: new Date() } });
  revalidatePath("/", "layout");
  redirect("/");
}
