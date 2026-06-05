import { COVER_IMAGES, randomCoverImage, coverImageUrl } from "@/lib/cover-images";

describe("COVER_IMAGES", () => {
  it("contains 18 images", () => {
    expect(COVER_IMAGES).toHaveLength(18);
  });

  it("all entries follow the coverphoto-N.png naming convention", () => {
    COVER_IMAGES.forEach((name) => {
      expect(name).toMatch(/^coverphoto-\d+\.png$/);
    });
  });

  it("has no duplicate entries", () => {
    const unique = new Set(COVER_IMAGES);
    expect(unique.size).toBe(COVER_IMAGES.length);
  });
});

describe("randomCoverImage", () => {
  it("always returns a value that exists in COVER_IMAGES", () => {
    for (let i = 0; i < 100; i++) {
      expect(COVER_IMAGES).toContain(randomCoverImage());
    }
  });

  it("returns different values across multiple calls (probabilistic)", () => {
    const results = new Set(Array.from({ length: 50 }, () => randomCoverImage()));
    // With 18 options and 50 draws, we expect more than 1 unique value
    expect(results.size).toBeGreaterThan(1);
  });
});

describe("coverImageUrl", () => {
  it("returns the correct public path for a given filename", () => {
    expect(coverImageUrl("coverphoto-1.png")).toBe("/images/cover-photos/coverphoto-1.png");
  });

  it("works for any filename string", () => {
    expect(coverImageUrl("coverphoto-18.png")).toBe("/images/cover-photos/coverphoto-18.png");
  });
});
