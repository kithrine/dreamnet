"use client";

import { useState } from "react";
import { AVATAR_MAP } from "@/lib/avatars";
import { cn } from "@/lib/utils";

interface AvatarProps {
  avatarId: number;
  className?: string;
}

export default function Avatar({ avatarId, className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const avatar = AVATAR_MAP[avatarId] ?? AVATAR_MAP[1];

  if (imgError) {
    // Graceful fallback to colored circle if image fails to load
    return (
      <div
        className={cn("rounded-full flex-shrink-0", className)}
        style={{ backgroundColor: avatar.fallback }}
      />
    );
  }

  return (
    <img
      src={avatar.src}
      alt={avatar.label}
      className={cn("rounded-full object-cover flex-shrink-0", className)}
      onError={() => setImgError(true)}
    />
  );
}
