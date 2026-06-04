"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardStars } from "@/lib/stars";
import { revalidatePath } from "next/cache";

export async function rateDreamAction(dreamId: string, value: number) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Not authenticated." };
  if (value < 1 || value > 5) return { error: "Invalid rating." };

  const dream = await prisma.dream.findUnique({ where: { id: dreamId } });
  if (!dream) return { error: "Dream not found." };
  if (dream.userId === session.user.id) return { error: "You cannot rate your own dream." };

  const existing = await prisma.rating.findUnique({
    where: { userId_dreamId: { userId: session.user.id, dreamId } },
  });
  if (existing) return { error: "You have already rated this dream." };

  await prisma.rating.create({ data: { value, userId: session.user.id, dreamId } });

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

  await awardStars(dream.userId, value, "RECEIVE_RATING");
  await prisma.notification.create({
    data: {
      userId: dream.userId,
      type: "RATING_RECEIVED",
      relatedDreamId: dreamId,
      relatedUserId: session.user.id,
    },
  });

  revalidatePath(`/dreams/${dreamId}`);
  return { success: true };
}

export async function addCommentAction(dreamId: string, content: string, parentId?: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Not authenticated." };
  if (!content.trim()) return { error: "Comment cannot be empty." };

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
