"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateDreamAction(dreamId: string, _prev: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated." };

  const dream = await prisma.dream.findUnique({
    where: { id: dreamId },
    select: { userId: true },
  });
  if (!dream) return { error: "Dream not found." };
  if (dream.userId !== session.user.id) return { error: "Not authorized." };

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const tagsRaw = (formData.get("tags") as string) ?? "";

  if (!title || !content) return { error: "Title and content are required." };

  const tagNames = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean)
    .slice(0, 10);

  // Replace all tags: delete old associations, create new ones
  await prisma.dream.update({
    where: { id: dreamId },
    data: {
      title,
      content,
      tags: {
        deleteMany: {},
        create: tagNames.map((name) => ({
          tag: { connectOrCreate: { where: { name }, create: { name } } },
        })),
      },
    },
  });

  revalidatePath(`/dreams/${dreamId}`);
  redirect(`/dreams/${dreamId}`);
}
