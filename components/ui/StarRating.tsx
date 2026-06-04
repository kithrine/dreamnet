"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value?: number;
  interactive?: boolean;
  onRate?: (value: number) => void;
}

export default function StarRating({ value = 0, interactive = false, onRate }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={cn(
            "text-2xl transition-transform",
            interactive && "cursor-pointer hover:scale-110",
            !interactive && "cursor-default"
          )}
        >
          <span className={star <= (hovered || value) ? "text-dream-gold" : "text-dream-muted"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
