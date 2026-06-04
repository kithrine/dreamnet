import { prisma } from "@/lib/prisma";

export async function getTopDreamers(limit = 5) {
  return prisma.user.findMany({
    orderBy: { totalStars: "desc" },
    take: limit,
    select: { id: true, username: true, avatarId: true, totalStars: true },
  });
}
