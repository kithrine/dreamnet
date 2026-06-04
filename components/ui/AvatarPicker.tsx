"use client";
import { cn } from "@/lib/utils";

const AVATARS = [
  { id: 1, color: "#7c3aed", label: "Purple Spirit" },
  { id: 2, color: "#2563eb", label: "Night Owl" },
  { id: 3, color: "#16a34a", label: "Dream Weaver" },
  { id: 4, color: "#dc2626", label: "Fire Dreamer" },
  { id: 5, color: "#ca8a04", label: "Star Gazer" },
];

interface AvatarPickerProps {
  selected: number;
  onChange: (id: number) => void;
}

export default function AvatarPicker({ selected, onChange }: AvatarPickerProps) {
  return (
    <div className="flex gap-3">
      {AVATARS.map((avatar) => (
        <button
          key={avatar.id}
          type="button"
          onClick={() => onChange(avatar.id)}
          className={cn(
            "w-12 h-12 rounded pixel-border transition-all",
            selected === avatar.id ? "ring-2 ring-dream-gold scale-110" : "opacity-60 hover:opacity-100"
          )}
          style={{ backgroundColor: avatar.color }}
          title={avatar.label}
        />
      ))}
      <input type="hidden" name="avatarId" value={selected} />
    </div>
  );
}
