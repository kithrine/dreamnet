import { prisma } from "@/lib/prisma";

export type ActivityItem = {
  id: string;
  user: { username: string; avatarId: number };
  dream: { id: string; title: string };
  createdAt: Date;
};

export async function getRecentActivity(limit = 5): Promise<ActivityItem[]> {
  const comments = await prisma.comment.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    where: { parentId: null },
    include: {
      user: { select: { username: true, avatarId: true } },
      dream: { select: { id: true, title: true } },
    },
  });
  return comments;
}
