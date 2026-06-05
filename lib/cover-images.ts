export const COVER_IMAGES = [
  "coverphoto-1.png",
  "coverphoto-2.png",
  "coverphoto-3.png",
  "coverphoto-4.png",
] as const;

export type CoverImage = (typeof COVER_IMAGES)[number];

export function randomCoverImage(): CoverImage {
  return COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];
}

export function coverImageUrl(filename: string): string {
  return `/images/cover-photos/${filename}`;
}
