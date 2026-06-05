"use client";

import { useState } from "react";
import StarRating from "@/components/ui/StarRating";
import { rateDreamAction } from "./actions";

interface RatingSectionProps {
  dreamId: string;
  canRate: boolean;
  isOwner: boolean;
  existingRating?: number;
}

export default function RatingSection({ dreamId, canRate, isOwner, existingRating }: RatingSectionProps) {
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [currentRating, setCurrentRating] = useState<number | undefined>(existingRating);

  if (!canRate) {
    // Owner viewing their own dream — show nothing
    if (isOwner) return null;
    // Not logged in
    return <p className="font-sans text-dream-muted text-sm">Sign in to rate this dream.</p>;
  }

  async function handleRate(value: number) {
    setError(null);
    const result = await rateDreamAction(dreamId, value);
    if (result?.error) {
      setError(result.error);
    } else {
      setCurrentRating(value);
      setSubmitted(true);
    }
  }

  return (
    <div>
      {error && <p className="font-sans text-red-400 text-sm mb-2">{error}</p>}
      <p className="font-sans text-dream-muted text-sm mb-2">
        {submitted
          ? "Rating updated! ★"
          : currentRating
          ? "Update your rating"
          : "Rate this dream"}
      </p>
      <StarRating interactive value={currentRating} onRate={handleRate} />
    </div>
  );
}
