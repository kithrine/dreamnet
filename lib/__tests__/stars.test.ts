// jest.mock is hoisted before variable declarations, so mock functions must
// be defined inline inside the factory and accessed via the mocked module import.
jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn().mockResolvedValue([]),
    starTransaction: { create: jest.fn() },
    user: { update: jest.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { awardStars } from "@/lib/stars";

// Typed helpers to avoid casting at every call-site
const mockTransaction = prisma.$transaction as jest.Mock;
const mockCreate = prisma.starTransaction.create as jest.Mock;
const mockUpdate = (prisma.user as { update: jest.Mock }).update;

describe("awardStars", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction.mockResolvedValue([]);
  });

  it("calls prisma.$transaction once per invocation", async () => {
    await awardStars("user-1", 5, "RECEIVE_RATING");
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  it("creates a StarTransaction with the correct userId, amount, and reason", async () => {
    await awardStars("user-1", 5, "RECEIVE_RATING");
    expect(mockCreate).toHaveBeenCalledWith({
      data: { userId: "user-1", amount: 5, reason: "RECEIVE_RATING" },
    });
  });

  it("increments the user's totalStars by the correct amount", async () => {
    await awardStars("user-2", 2, "POST_DREAM");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-2" },
      data: { totalStars: { increment: 2 } },
    });
  });

  it("works for all StarReason values", async () => {
    const reasons = ["POST_DREAM", "RECEIVE_RATING", "LEAVE_COMMENT", "RECEIVE_REPLY"] as const;
    for (const reason of reasons) {
      jest.clearAllMocks();
      mockTransaction.mockResolvedValue([]);
      await awardStars("user-3", 1, reason);
      expect(mockCreate).toHaveBeenCalledWith({
        data: { userId: "user-3", amount: 1, reason },
      });
    }
  });
});
