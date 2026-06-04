"use client";

import { useState } from "react";
import StarRating from "@/components/ui/StarRating";
import { rateDreamAction } from "./actions";

interface RatingSectionProps {
  dreamId: string;
  canRate: boolean;
  existingRating?: number;
}

export default function RatingSection({ dreamId, canRate, existingRating }: RatingSectionProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (existingRating) {
    return (
      <div>
        <p className="font-pixel text-dream-muted text-xs mb-2">YOUR RATING</p>
        <StarRating value={existingRating} />
      </div>
    );
  }

  if (!canRate) {
    return <p className="font-pixel text-dream-muted text-xs">{submitted ? "Rating submitted!" : "Sign in to rate this dream."}</p>;
  }

  async function handleRate(value: number) {
    const result = await rateDreamAction(dreamId, value);
    if (result?.error) setError(result.error);
    else setSubmitted(true);
  }

  if (submitted) return <p className="font-pixel text-green-400 text-xs">Rating submitted! ★</p>;

  return (
    <div>
      {error && <p className="font-pixel text-red-400 text-xs mb-2">{error}</p>}
      <p className="font-pixel text-dream-muted text-xs mb-2">RATE THIS DREAM</p>
      <StarRating interactive onRate={handleRate} />
    </div>
  );
}
