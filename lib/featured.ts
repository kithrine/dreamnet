import { prisma } from "@/lib/prisma";

function todayString() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export async function getFeaturedDream() {
  const today = todayString();
  const existing = await prisma.featuredDream.findUnique({
    where: { date: today },
    include: {
      dream: {
        include: {
          user: { select: { username: true, avatarId: true } },
          tags: { include: { tag: { select: { name: true } } } },
          _count: { select: { comments: true } },
        },
      },
    },
  });
  if (existing) return existing.dream;

  // Pick a random dream — prefer those with at least one rating
  const count = await prisma.dream.count({ where: { ratingCount: { gt: 0 } } });
  const fallbackCount = await prisma.dream.count();
  if (fallbackCount === 0) return null;

  const skip = Math.floor(Math.random() * (count > 0 ? count : fallbackCount));
  const [dream] = await prisma.dream.findMany({
    where: count > 0 ? { ratingCount: { gt: 0 } } : {},
    skip,
    take: 1,
    include: {
      user: { select: { username: true, avatarId: true } },
      tags: { include: { tag: { select: { name: true } } } },
      _count: { select: { comments: true } },
    },
  });
  if (!dream) return null;

  await prisma.featuredDream.create({ data: { dreamId: dream.id, date: today } });
  return dream;
}
