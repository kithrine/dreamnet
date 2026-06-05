"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardStars } from "@/lib/stars";
import { randomCoverImage } from "@/lib/cover-images";
import { redirect } from "next/navigation";

export async function createDreamAction(_prev: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Not authenticated." };

  const title = (formData.get("title") as string).trim();
  const content = (formData.get("content") as string).trim();
  const tagsRaw = (formData.get("tags") as string).trim();

  if (!title || !content) return { error: "Title and content are required." };

  const tagNames = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean)
    .slice(0, 10);

  const dream = await prisma.dream.create({
    data: {
      title,
      content,
      userId: session.user.id,
      coverImage: randomCoverImage(),
      tags: {
        create: await Promise.all(
          tagNames.map(async (name) => {
            const tag = await prisma.tag.upsert({
              where: { name },
              update: {},
              create: { name },
            });
            return { tagId: tag.id };
          })
        ),
      },
    },
  });

  await awardStars(session.user.id, 2, "POST_DREAM");
  redirect(`/dreams/${dream.id}`);
}
