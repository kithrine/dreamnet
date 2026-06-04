// page.tsx
// -----------------------------------------------------------------------------
// The game page at /game (route group: app/(dashboard)/game/page.tsx).
// This is the entry point the "Game" side-nav link points to.
//
// Flow:
//   1) Show the avatar gallery (the user picks an avatar + color FOR THE SESSION).
//   2) On "Enter Dream World", show the 3D game with that avatar.
//   3) "Exit to Home" navigates back to the dashboard home (/).
//
// The chosen avatar/color is session-only React state — never written to the DB.
// -----------------------------------------------------------------------------

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AvatarGallery from "./AvatarGallery";
import DreamWorld from "./DreamWorld";

export default function GamePage() {
  const router = useRouter();

  // Session-only selection. `null` until the player picks and enters.
  const [selection, setSelection] = useState<{ avatarKey: string; color: number } | null>(null);

  return (
    // Full-viewport stage. The dashboard layout's sidenav still frames the app;
    // this fills the main content area.
    <div style={{ position: "fixed", inset: 0, left: 0 }}>
      {selection === null ? (
        // Step 1: choose an avatar for the game session.
        <AvatarGallery onEnter={setSelection} />
      ) : (
        // Step 2: play, using the chosen avatar + color.
        <DreamWorld
          avatarKey={selection.avatarKey}
          color={selection.color}
          onExit={() => router.push("/")}
        />
      )}
    </div>
  );
}
