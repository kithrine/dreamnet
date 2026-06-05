import { prisma } from "@/lib/prisma";

const CONFIDENCE_WEIGHT = 10;

export function bayesianScore(ratingCount: number, ratingSum: number, globalMean: number): number {
  if (ratingCount === 0) return 0;
  return (CONFIDENCE_WEIGHT * globalMean + ratingSum) / (CONFIDENCE_WEIGHT + ratingCount);
}

export async function getTopDreams(limit = 5) {
  const agg = await prisma.rating.aggregate({ _avg: { value: true } });
  const globalMean = agg._avg.value ?? 3;

  const dreams = await prisma.dream.findMany({
    where: { archivedAt: null },
    include: {
      user: { select: { username: true, avatarId: true } },
      tags: { include: { tag: { select: { name: true } } } },
      _count: { select: { comments: true } },
    },
  });

  return dreams
    .map((d) => ({
      ...d,
      score: bayesianScore(d.ratingCount, d.averageRating * d.ratingCount, globalMean),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
