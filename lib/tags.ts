import { prisma } from "@/lib/prisma";

export async function getTrendingTags(limit = 8) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const results = await prisma.dreamTag.groupBy({
    by: ["tagId"],
    where: {
      dream: { createdAt: { gte: sevenDaysAgo } },
    },
    _count: { tagId: true },
    orderBy: { _count: { tagId: "desc" } },
    take: limit,
  });

  const tagIds = results.map((r) => r.tagId);
  const tags = await prisma.tag.findMany({ where: { id: { in: tagIds } } });

  return results.map((r) => ({
    ...tags.find((t) => t.id === r.tagId)!,
    count: r._count.tagId,
  }));
}
