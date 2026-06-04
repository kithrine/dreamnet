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
        <p className="font-sans text-dream-muted text-sm mb-2">Your rating</p>
        <StarRating value={existingRating} />
      </div>
    );
  }

  if (!canRate) {
    return <p className="font-sans text-dream-muted text-sm">{submitted ? "Rating submitted!" : "Sign in to rate this dream."}</p>;
  }

  async function handleRate(value: number) {
    const result = await rateDreamAction(dreamId, value);
    if (result?.error) setError(result.error);
    else setSubmitted(true);
  }

  if (submitted) return <p className="font-sans text-green-400 text-sm">Rating submitted! ★</p>;

  return (
    <div>
      {error && <p className="font-sans text-red-400 text-sm mb-2">{error}</p>}
      <p className="font-sans text-dream-muted text-sm mb-2">Rate this dream</p>
      <StarRating interactive onRate={handleRate} />
    </div>
  );
}
