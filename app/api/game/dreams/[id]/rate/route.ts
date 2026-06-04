import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardStars } from "@/lib/stars";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const value = Number(body.value);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return NextResponse.json({ error: "value must be integer 1-5" }, { status: 400, headers: CORS_HEADERS });
  }

  const dream = await prisma.dream.findUnique({ where: { id } });
  if (!dream) {
    return NextResponse.json({ error: "Dream not found" }, { status: 404, headers: CORS_HEADERS });
  }
  if (dream.userId === session.user.id) {
    return NextResponse.json({ error: "Cannot rate your own dream" }, { status: 400, headers: CORS_HEADERS });
  }

  const existing = await prisma.rating.findUnique({
    where: { userId_dreamId: { userId: session.user.id, dreamId: id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already rated" }, { status: 400, headers: CORS_HEADERS });
  }

  await prisma.rating.create({ data: { value, userId: session.user.id, dreamId: id } });

  const agg = await prisma.rating.aggregate({
    where: { dreamId: id },
    _avg: { value: true },
    _count: { value: true },
  });
  await prisma.dream.update({
    where: { id },
    data: { averageRating: agg._avg.value ?? 0, ratingCount: agg._count.value },
  });

  await awardStars(dream.userId, value, "RECEIVE_RATING");

  return NextResponse.json(
    { success: true, newAverageRating: agg._avg.value ?? 0, starsEarned: value },
    { headers: CORS_HEADERS }
  );
}
