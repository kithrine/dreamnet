"use client";

import { AVATAR_MAP } from "@/lib/avatars";
import { cn } from "@/lib/utils";

interface AvatarPickerProps {
  selected: number;
  onChange: (id: number) => void;
}

export default function AvatarPicker({ selected, onChange }: AvatarPickerProps) {
  return (
    <div className="flex gap-3">
      {Object.entries(AVATAR_MAP).map(([idStr, avatar]) => {
        const id = Number(idStr);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "w-14 h-14 rounded-full transition-all overflow-hidden",
              selected === id
                ? "ring-2 ring-dream-gold ring-offset-2 ring-offset-dream-surface/75 scale-110"
                : "opacity-60 hover:opacity-90 hover:scale-105"
            )}
            title={avatar.label}
          >
            <img
              src={avatar.src}
              alt={avatar.label}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to colored circle if image missing
                const el = e.currentTarget.parentElement as HTMLButtonElement;
                el.style.backgroundColor = avatar.fallback;
                e.currentTarget.style.display = "none";
              }}
            />
          </button>
        );
      })}
      <input type="hidden" name="avatarId" value={selected} />
    </div>
  );
}
