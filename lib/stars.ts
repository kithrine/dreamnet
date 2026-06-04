import { prisma } from "@/lib/prisma";
import { StarReason } from "@prisma/client";

export async function awardStars(userId: string, amount: number, reason: StarReason) {
  await prisma.$transaction([
    prisma.starTransaction.create({ data: { userId, amount, reason } }),
    prisma.user.update({
      where: { id: userId },
      data: { totalStars: { increment: amount } },
    }),
  ]);
}
