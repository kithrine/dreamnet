jest.mock("@/lib/prisma", () => ({ prisma: {} }));

import { bayesianScore } from "@/lib/ranking";

describe("bayesianScore", () => {
  it("returns 0 for a dream with no ratings", () => {
    expect(bayesianScore(0, 0, 4)).toBe(0);
  });

  it("gives a single 5-star dream a lower score than a dream with 50 four-star reviews", () => {
    const globalMean = 3.5;
    const singleFiveStar = bayesianScore(1, 5, globalMean);
    const fiftyFourStar = bayesianScore(50, 200, globalMean);
    expect(fiftyFourStar).toBeGreaterThan(singleFiveStar);
  });

  it("converges toward the rating as count increases", () => {
    const score100 = bayesianScore(100, 500, 3.5); // avg 5.0 with 100 votes
    const score1 = bayesianScore(1, 5, 3.5);       // avg 5.0 with 1 vote
    expect(score100).toBeGreaterThan(score1);
  });
});
