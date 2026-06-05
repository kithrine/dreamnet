export const COVER_IMAGES = [
  "coverphoto-1.png",
  "coverphoto-2.png",
  "coverphoto-3.png",
  "coverphoto-4.png",
  "coverphoto-5.png",
  "coverphoto-6.png",
  "coverphoto-7.png",
  "coverphoto-8.png",
  "coverphoto-9.png",
  "coverphoto-10.png",
  "coverphoto-11.png",
  "coverphoto-12.png",
  "coverphoto-13.png",
  "coverphoto-14.png",
  "coverphoto-15.png",
  "coverphoto-16.png",
  "coverphoto-17.png",
  "coverphoto-18.png",
] as const;

export type CoverImage = (typeof COVER_IMAGES)[number];

export function randomCoverImage(): CoverImage {
  return COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];
}

export function coverImageUrl(filename: string): string {
  return `/images/cover-photos/${filename}`;
}
