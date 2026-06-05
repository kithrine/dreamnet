import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
  }

  const count = await prisma.dream.count({ where: { archivedAt: null } });
  if (count === 0) {
    return NextResponse.json({ error: "No dreams available" }, { status: 404, headers: CORS_HEADERS });
  }

  const skip = Math.floor(Math.random() * count);
  const [dream] = await prisma.dream.findMany({
    where: { archivedAt: null },
    skip,
    take: 1,
    include: {
      user: { select: { username: true, avatarId: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return NextResponse.json(
    {
      id: dream.id,
      title: dream.title,
      content: dream.content,
      author: { username: dream.user.username, avatarId: dream.user.avatarId },
      averageRating: dream.averageRating,
      ratingCount: dream.ratingCount,
      tags: dream.tags.map((dt) => dt.tag.name),
    },
    { headers: CORS_HEADERS }
  );
}
