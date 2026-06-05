/**
 * One-time backfill: assigns a random cover image to every dream that still has
 * the default "coverphoto-1.png" set by the schema migration.
 *
 * Run once after `prisma db push`:
 *   npx tsx prisma/backfill-covers.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { COVER_IMAGES } from "../lib/cover-images";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as never);

  const dreams = await prisma.dream.findMany({ select: { id: true } });
  console.log(`🌙 Backfilling ${dreams.length} dream(s) with random cover images...`);

  for (const dream of dreams) {
    const cover = COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];
    await prisma.dream.update({
      where: { id: dream.id },
      data: { coverImage: cover },
    });
  }

  console.log("✓ Done — all dreams now have a cover image.");
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
