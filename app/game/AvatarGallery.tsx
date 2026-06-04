// AvatarGallery.tsx
// -----------------------------------------------------------------------------
// The avatar gallery shown ONLY when the user enters the game (not at login).
// The user picks one of the 10 avatars + a color FOR THIS GAME SESSION ONLY.
// Nothing is saved to the database — the choice lives in React state and is
// handed to the game when the player clicks "Enter Dream World".
//
// Built with react-three-fiber. Each avatar is rendered via the SAME builder
// used in-game (buildAvatar), so the preview matches the playable character.
// -----------------------------------------------------------------------------

"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AVATARS, AVATAR_SWATCHES, buildAvatar } from "./avatarBuilders";

// A single slowly-rotating avatar preview on its own little turntable.
function AvatarPreview({ avatarKey, color }: { avatarKey: string; color: number }) {
  const ref = useRef<THREE.Group>(null);

  // Rebuild the THREE group whenever the avatar or color changes.
  const group = useMemo(() => buildAvatar(avatarKey, color), [avatarKey, color]);

  // Spin slowly so the player sees the character in the round.
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.6;
  });

  return <primitive ref={ref} object={group} position={[0, -0.9, 0]} />;
}

interface AvatarGalleryProps {
  // Called when the player confirms their choice and enters the game.
  onEnter: (selection: { avatarKey: string; color: number }) => void;
}

export default function AvatarGallery({ onEnter }: AvatarGalleryProps) {
  // Default to the first avatar (Owl) and its default color.
  const [avatarKey, setAvatarKey] = useState<string>(AVATARS[0].key);
  const [color, setColor] = useState<number>(AVATARS[0].color);

  const selected = AVATARS.find((a) => a.key === avatarKey) ?? AVATARS[0];

  // Convert a hex number to a CSS color string for swatch styling.
  const hex = (n: number) => `#${n.toString(16).padStart(6, "0")}`;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at 50% 30%, #2a1d5e 0%, #0a0826 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#e0d4ff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h2 style={{ fontSize: 28, marginBottom: 4, letterSpacing: 1 }}>✦ Choose Your Dreamer ✦</h2>
      <p style={{ color: "#9b8ec4", marginBottom: 12, fontSize: 14 }}>
        Pick an avatar for this game session.
      </p>

      {/* 3D preview of the currently selected avatar */}
      <div style={{ width: 320, height: 320 }}>
        <Canvas camera={{ position: [0, 1.2, 4.2], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 6, 4]} intensity={1.1} />
          <AvatarPreview avatarKey={avatarKey} color={color} />
        </Canvas>
      </div>

      <div style={{ fontSize: 20, marginTop: 4, marginBottom: 10 }}>{selected.name}</div>

      {/* Avatar chooser row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 560 }}>
        {AVATARS.map((a) => (
          <button
            key={a.key}
            onClick={() => {
              setAvatarKey(a.key);
              setColor(a.color); // reset to that avatar's default color
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 12,
              border: a.key === avatarKey ? "2px solid #ffe066" : "1px solid #6a5acd",
              background: a.key === avatarKey ? "rgba(255,224,102,0.15)" : "rgba(106,90,205,0.18)",
              color: "#e0d4ff",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* Color swatches to recolor the selected avatar */}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {AVATAR_SWATCHES.map((sw) => (
          <button
            key={sw}
            aria-label={`Recolor to ${hex(sw)}`}
            onClick={() => setColor(sw)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: hex(sw),
              border: sw === color ? "3px solid #fff" : "2px solid rgba(255,255,255,0.4)",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* Enter the game with the chosen avatar + color (session-only) */}
      <button
        onClick={() => onEnter({ avatarKey, color })}
        style={{
          marginTop: 28,
          padding: "12px 28px",
          borderRadius: 16,
          border: "none",
          background: "linear-gradient(90deg,#7ee0ff,#c9a0ff)",
          color: "#1a1245",
          fontWeight: 700,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Enter Dream World →
      </button>
    </div>
  );
}
