// DreamWorld.tsx
// -----------------------------------------------------------------------------
// The 3D game scene (react-three-fiber). Contains:
//  - a row of static floating islands (exact mockup dimensions/colors)
//  - lavender clouds, gold starfield, indigo fog
//  - the player's chosen avatar floating above the island with an OVAL SHADOW
//  - grab-and-drag movement using the VERIFIED fix (project cursor onto a plane
//    at the avatar's hover height, clamp to the nearest island, ease toward it)
//  - dream bubbles fetched from the REAL /api/game/dreams/random route
//  - click a bubble -> wand fires a star -> bubble pops (particle burst + sound)
//    -> rating panel -> POST to the REAL /api/game/dreams/[id]/rate route
//  - a session-only leaderboard with a seam for the partner's real endpoint
// -----------------------------------------------------------------------------

"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { buildAvatar } from "./avatarBuilders";
import {
  COLORS,
  CLOUD_TINTS,
  STAR_COLORS,
  DREAM_TINTS,
  ISLAND,
  WALK_RADIUS,
  ISLAND_SPACING,
  ISLAND_COUNT,
  GameDream,
  DreamBubble,
  fetchRandomDream,
  rateDream,
  fetchLeaderboard,
  LeaderRow,
} from "./gameData";
import { playFire, playPop, playRate } from "./sounds";

// Movement tuning knobs (exposed as constants so feel is easy to adjust).
const FOLLOW = 0.06; // 0..1 — lower = smoother/slower glide; higher = snappier
const MAX_STEP = 0.16; // max world units the avatar can move per frame (gentle speed cap)
const HOVER = 0.5; // how high the avatar floats above the island top
const DECK_TOP = (ISLAND.topHeight * 0.5 * ISLAND.scale); // world Y of the island's flat top

// Island center X positions for the row (centered around 0).
const ISLAND_CENTERS: number[] = Array.from({ length: ISLAND_COUNT }, (_, i) => {
  const start = -((ISLAND_COUNT - 1) * ISLAND_SPACING) / 2;
  return start + i * ISLAND_SPACING;
});

// Clamp a point to the NEAREST island disc (Option A: avatar always lands on an
// island, never the void). If inside a disc, keep it; else snap to that disc's rim.
function clampToIslands(x: number, z: number): { x: number; z: number } {
  let bestX = ISLAND_CENTERS[0];
  let bestZ = 0;
  let bestDist = Infinity;
  for (const cx of ISLAND_CENTERS) {
    const dx = x - cx;
    const dz = z - 0;
    const d = Math.hypot(dx, dz);
    const edgeDist = d - WALK_RADIUS;
    if (edgeDist < bestDist) {
      bestDist = edgeDist;
      if (d <= WALK_RADIUS) {
        bestX = x;
        bestZ = z; // inside this disc — keep exact point
      } else {
        const k = WALK_RADIUS / d; // project onto the rim
        bestX = cx + dx * k;
        bestZ = dz * k;
      }
    }
  }
  return { x: bestX, z: bestZ };
}

// ---- one floating island (static) -------------------------------------------
function Island({ centerX }: { centerX: number }) {
  // Build the island once as a THREE group (exact mockup geometry + colors).
  const group = useMemo(() => {
    const g = new THREE.Group();
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(ISLAND.topRadius, ISLAND.bottomRadius, ISLAND.topHeight, ISLAND.segments),
      new THREE.MeshStandardMaterial({ color: COLORS.grass, roughness: 0.95, flatShading: true })
    );
    top.receiveShadow = true;
    top.userData.walkTop = true; // tag so we could raycast it if needed
    g.add(top);
    const lip = new THREE.Mesh(
      new THREE.CylinderGeometry(ISLAND.lipTopRadius, ISLAND.lipBottomRadius, ISLAND.lipHeight, ISLAND.segments),
      new THREE.MeshStandardMaterial({ color: COLORS.lip, roughness: 1, flatShading: true })
    );
    lip.position.y = -0.45;
    g.add(lip);
    const rock = new THREE.Mesh(
      new THREE.ConeGeometry(ISLAND.coneRadius, ISLAND.coneHeight, 16),
      new THREE.MeshStandardMaterial({ color: COLORS.underside, roughness: 1, flatShading: true })
    );
    rock.position.y = -4.2;
    g.add(rock);
    // a few dark floating rock chunks under the island
    for (let i = 0; i < 5; i++) {
      const chunk = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.7),
        new THREE.MeshStandardMaterial({ color: COLORS.rockChunk, roughness: 1, flatShading: true })
      );
      const a = Math.random() * Math.PI * 2;
      chunk.position.set(Math.cos(a) * 3, -3 - Math.random() * 3, Math.sin(a) * 3);
      g.add(chunk);
    }
    // NOTE: flowers used to be baked in here, but to support "brush -> shed petals ->
    // regrow" they're now their own managed <Flowers> component (see below), so they
    // can be detected, hidden, and regrown individually. The island mesh stays static.
    g.scale.setScalar(ISLAND.scale);
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Static placement (NO vertical bob — required for accurate dragging).
  return <primitive object={group} position={[centerX, 0, 0]} />;
}

// ---- flowers: brush to shed petals, then regrow after a few seconds ----------
// Flowers are managed here (not baked into the island) so each one can be brushed,
// hidden, and regrown individually. We read the live avatar position each frame to
// detect a "brush" (avatar gets close), then spawn a few gold petals that float up
// and fade; the flower hides and regrows after a short delay.
function Flowers({ playerPos }: { playerPos: React.MutableRefObject<THREE.Vector3> }) {
  // How many flowers per island, how close counts as a "brush", how long to regrow.
  const PER_ISLAND = 6;
  const BRUSH_DISTANCE = 1.1; // world units between avatar and flower to trigger shedding
  const REGROW_SECONDS = 4; // flower comes back after this long

  // Build the flower objects ONCE. Each flower is a group (stem + blossom) placed on
  // the grass of one of the islands. We keep per-flower state alongside the meshes.
  const flowers = useMemo(() => {
    // A flower record holds its mesh group plus its current state (bloomed / regrow timer).
    const list: {
      group: THREE.Group;
      base: THREE.Vector3; // world position of the blossom (for brush distance checks)
      bloomed: boolean; // is it currently shown?
      regrowAt: number; // clock time (seconds) when it should regrow; 0 = not waiting
    }[] = [];
    for (const cx of ISLAND_CENTERS) {
      for (let i = 0; i < PER_ISLAND; i++) {
        // random spot on this island's grassy top, within the walkable radius
        const a = Math.random() * Math.PI * 2;
        const r = 1.5 + Math.random() * (WALK_RADIUS - 2);
        const fx = cx + Math.cos(a) * r;
        const fz = Math.sin(a) * r;
        const g = new THREE.Group();
        // stem
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.1, 0.4, 6),
          new THREE.MeshStandardMaterial({ color: COLORS.flowerStem })
        );
        stem.position.y = DECK_TOP + 0.2;
        // glowing gold blossom
        const blossom = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 8, 8),
          new THREE.MeshStandardMaterial({ color: COLORS.flowerBlossom, emissive: COLORS.flowerGlow, emissiveIntensity: 0.6 })
        );
        blossom.position.y = DECK_TOP + 0.45;
        g.add(stem, blossom);
        g.position.set(fx, 0, fz);
        list.push({ group: g, base: new THREE.Vector3(fx, DECK_TOP + 0.45, fz), bloomed: true, regrowAt: 0 });
      }
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Active petal bursts: small gold bits that float up and fade, then get removed.
  // Kept in a ref (not state) so the animation loop can mutate them every frame cheaply.
  const petals = useRef<{ group: THREE.Group; bits: THREE.Mesh[]; life: number }[]>([]);

  // A parent group that holds every flower group + any active petal bursts.
  const root = useRef<THREE.Group>(null);

  // Attach all flower groups to the root once it exists.
  useEffect(() => {
    const parent = root.current;
    if (!parent) return;
    for (const f of flowers) parent.add(f.group);
    // cleanup on unmount: detach flower groups
    return () => {
      for (const f of flowers) parent.remove(f.group);
    };
  }, [flowers]);

  // Spawn a petal burst at a position (a few gold bits that will float up and fade).
  const shedPetals = (at: THREE.Vector3) => {
    const parent = root.current;
    if (!parent) return;
    const burst = new THREE.Group();
    const bits: THREE.Mesh[] = [];
    // 5 small petals, each given an outward/upward velocity stored in userData
    for (let i = 0; i < 5; i++) {
      const petal = new THREE.Mesh(
        new THREE.CircleGeometry(0.07, 5),
        new THREE.MeshStandardMaterial({
          color: COLORS.flowerBlossom,
          emissive: COLORS.flowerGlow,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 1,
          side: THREE.DoubleSide,
        })
      );
      petal.position.copy(at);
      // gentle outward + upward drift
      petal.userData.vel = new THREE.Vector3((Math.random() - 0.5) * 0.04, 0.03 + Math.random() * 0.03, (Math.random() - 0.5) * 0.04);
      burst.add(petal);
      bits.push(petal);
    }
    parent.add(burst);
    petals.current.push({ group: burst, bits, life: 0 });
  };

  // Each frame: check for brushes, animate petals, handle regrow timing.
  useFrame((state) => {
    const now = state.clock.getElapsedTime();
    const p = playerPos.current;

    // 1) brush detection + regrow
    for (const f of flowers) {
      if (f.bloomed) {
        // brushed? (avatar close enough on the x/z plane)
        const dx = p.x - f.base.x;
        const dz = p.z - f.base.z;
        if (Math.hypot(dx, dz) < BRUSH_DISTANCE) {
          f.bloomed = false; // hide it
          f.group.visible = false;
          f.regrowAt = now + REGROW_SECONDS; // schedule regrow
          shedPetals(f.base); // spray petals from the blossom spot
        }
      } else if (f.regrowAt > 0 && now >= f.regrowAt) {
        // time to come back
        f.bloomed = true;
        f.group.visible = true;
        f.regrowAt = 0;
        // pop back with a tiny scale-in for a soft regrow feel
        f.group.scale.setScalar(0.2);
      }
      // ease the regrow scale-in back to full size
      if (f.bloomed && f.group.scale.x < 1) {
        const s = Math.min(1, f.group.scale.x + 0.06);
        f.group.scale.setScalar(s);
      }
    }

    // 2) animate active petal bursts: drift up, fade out, then remove when done
    const parent = root.current;
    for (let i = petals.current.length - 1; i >= 0; i--) {
      const b = petals.current[i];
      b.life += 0.012; // ~1.4s lifespan at 60fps
      for (const petal of b.bits) {
        const vel = petal.userData.vel as THREE.Vector3;
        petal.position.add(vel);
        petal.rotation.x += 0.05;
        petal.rotation.y += 0.04;
        const mat = petal.material as THREE.MeshStandardMaterial;
        mat.opacity = Math.max(0, 1 - b.life); // fade out
      }
      if (b.life >= 1) {
        if (parent) parent.remove(b.group);
        petals.current.splice(i, 1);
      }
    }
  });

  return <group ref={root} />;
}

// ---- background: clouds + starfield ------------------------------------------
function Background() {
  const clouds = useMemo(() => {
    const g = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const tint = CLOUD_TINTS[Math.floor(Math.random() * CLOUD_TINTS.length)];
      const cloud = new THREE.Group();
      const puffs = 3 + Math.floor(Math.random() * 3);
      for (let p = 0; p < puffs; p++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(1 + Math.random() * 1.2, 10, 10),
          new THREE.MeshStandardMaterial({ color: tint, roughness: 1, flatShading: true, transparent: true, opacity: 0.85 })
        );
        puff.position.set((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 2);
        cloud.add(puff);
      }
      cloud.position.set((Math.random() - 0.5) * 60, -4 - Math.random() * 6, (Math.random() - 0.5) * 40 - 6);
      g.add(cloud);
    }
    return g;
  }, []);

  const stars = useMemo(() => {
    const N = 600;
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = (Math.random() - 0.3) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160 - 20;
      c.setHex(STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({ size: 0.55, vertexColors: true, transparent: true, opacity: 0.95 });
    return new THREE.Points(geo, mat);
  }, []);

  return (
    <>
      <primitive object={clouds} />
      <primitive object={stars} />
    </>
  );
}

// ---- one dream bubble (two-layer: translucent shell + glowing core) ----------
function Bubble({
  bubble,
  position,
  onRequestPop,
}: {
  bubble: DreamBubble;
  position: [number, number, number];
  // ask the scene to play the wand->bubble star effect; it pops + rates when done.
  // we pass the bubble's CURRENT world position (it bobs) so the stars aim true.
  onRequestPop: (b: DreamBubble, worldPos: THREE.Vector3) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const baseY = position[1];
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const hidden = useRef(false); // once clicked, hide while the stars travel

  // gentle bob + slow spin
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = baseY + Math.sin(t * 0.6 + phase) * 0.4;
      ref.current.rotation.y += 0.008;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (hidden.current || !ref.current) return; // ignore double-clicks mid-effect
        hidden.current = true;
        ref.current.visible = false; // hide the shell/core; stars fly, then it pops
        // pass the bubble's live world position so the star stream aims at it
        const wp = new THREE.Vector3();
        ref.current.getWorldPosition(wp);
        onRequestPop(bubble, wp);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      {/* translucent outer shell */}
      <mesh>
        <sphereGeometry args={[0.85, 18, 18]} />
        <meshStandardMaterial
          color={bubble.tint}
          transparent
          opacity={0.34}
          roughness={0.15}
          metalness={0.1}
          emissive={bubble.tint}
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* glowing core */}
      <mesh>
        <sphereGeometry args={[0.24, 12, 12]} />
        <meshStandardMaterial color={bubble.tint} emissive={bubble.tint} emissiveIntensity={1.3} />
      </mesh>
    </group>
  );
}

// ---- the player's avatar (floating) + oval shadow ----------------------------
function Player({
  avatarKey,
  color,
  playerPos,
  bubblePositions,
}: {
  avatarKey: string;
  color: number;
  playerPos: React.MutableRefObject<THREE.Vector3>;
  // live world positions of the dream bubbles, so the avatar can look toward the nearest
  bubblePositions: React.MutableRefObject<THREE.Vector3[]>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  // Build the chosen avatar once (session-only selection).
  const avatar = useMemo(() => buildAvatar(avatarKey, color), [avatarKey, color]);

  // Collect this avatar's pupils once (tagged in avatarBuilders) so we can move them.
  const pupils = useMemo(() => {
    const found: THREE.Mesh[] = [];
    avatar.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && o.userData && o.userData.pupil) found.push(o as THREE.Mesh);
    });
    return found;
  }, [avatar]);

  // Reused vectors so we don't allocate every frame.
  const tmpTarget = useRef(new THREE.Vector3());

  // Float the avatar; track the nearest bubble with BOTH the eyes and a gentle turn.
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const p = playerPos.current;
    const y = DECK_TOP + HOVER + Math.sin(t * 1.4) * 0.04;
    const g = groupRef.current;
    if (g) {
      g.position.set(p.x, y, p.z);
    }
    if (shadowRef.current) {
      // shadow sits on the grass directly beneath the avatar
      shadowRef.current.position.set(p.x, DECK_TOP + 0.02, p.z);
    }

    // find the nearest dream bubble (in x/z) to look toward
    const bubbles = bubblePositions.current;
    let nearest: THREE.Vector3 | null = null;
    let best = Infinity;
    for (const b of bubbles) {
      const dx = b.x - p.x;
      const dz = b.z - p.z;
      const q = dx * dx + dz * dz;
      if (q < best) {
        best = q;
        nearest = b;
      }
    }

    if (g && nearest) {
      // 1) GENTLE TURN: rotate the whole avatar slightly to face the nearest bubble.
      // We ease toward the target yaw so it's a soft turn, not a snap.
      const targetYaw = Math.atan2(nearest.x - p.x, nearest.z - p.z);
      let diff = targetYaw - g.rotation.y;
      while (diff > Math.PI) diff -= 2 * Math.PI; // normalize to [-PI, PI]
      while (diff < -Math.PI) diff += 2 * Math.PI;
      g.rotation.y += diff * 0.05; // small factor = gentle turn

      // 2) EYE TRACK: shift each pupil a little toward the bubble within its range.
      // Compute a local left/right + up/down nudge from the avatar to the bubble.
      tmpTarget.current.set(nearest.x - p.x, nearest.y - y, nearest.z - p.z).normalize();
      for (const pupil of pupils) {
        const rest = pupil.userData.rest as THREE.Vector3;
        const range = pupil.userData.range as number;
        // nudge pupil sideways (x) and UP (y) toward the bubble; dreams float above, so
        // we bias strongly upward and add a small constant lift so the eyes read as "looking up"
        const nx = rest.x + tmpTarget.current.x * range;
        const ny = rest.y + (Math.max(0, tmpTarget.current.y) + 0.5) * range; // bias upward gaze
        const nz = rest.z + Math.abs(tmpTarget.current.z) * range * 0.2;
        // ease the pupil toward the computed look position
        pupil.position.x += (nx - pupil.position.x) * 0.2;
        pupil.position.y += (ny - pupil.position.y) * 0.2;
        pupil.position.z += (nz - pupil.position.z) * 0.2;
      }
    }
  });

  return (
    <>
      <primitive ref={groupRef} object={avatar} />
      {/* soft oval contact shadow on the grass */}
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 24]} />
        <meshBasicMaterial color={0x000000} transparent opacity={0.28} />
      </mesh>
    </>
  );
}

// ---- wand star-streams + whimsical particle burst ---------------------------
// Imperative handle the rest of the scene can call to play the pop sequence:
// stars fly from the wand tip to the bubble, then the bubble bursts into slow
// particles that wander into space, then onPopped() fires (to open the rating panel).
interface EffectsHandle {
  fire: (from: THREE.Vector3, to: THREE.Vector3, tint: number, onPopped: () => void) => void;
}

// A single travelling star (part of the stream from wand -> bubble).
interface StarShot {
  mesh: THREE.Mesh;
  from: THREE.Vector3;
  to: THREE.Vector3;
  t: number; // 0..1 progress
  speed: number; // progress per frame
  tint: number;
  onArrive: () => void; // called once when this star reaches the bubble
}

// A burst of particles that drift slowly outward and fade.
interface Burst {
  group: THREE.Group;
  bits: THREE.Mesh[];
  life: number; // 0..1
}

// Build the effects component. `handleRef` receives the imperative `fire` method.
function Effects({ handleRef }: { handleRef: React.MutableRefObject<EffectsHandle | null> }) {
  // Parent group that holds all active stars + bursts.
  const root = useRef<THREE.Group>(null);
  // Active star shots and bursts (refs so the frame loop can mutate cheaply).
  const shots = useRef<StarShot[]>([]);
  const bursts = useRef<Burst[]>([]);

  // Spawn a slow, whimsical particle burst at a point (particles wander into space ~2s).
  const spawnBurst = (at: THREE.Vector3, tint: number) => {
    const parent = root.current;
    if (!parent) return;
    const group = new THREE.Group();
    const bits: THREE.Mesh[] = [];
    // ~16 small glowing shards drifting outward in random directions
    for (let i = 0; i < 16; i++) {
      const shard = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.07),
        new THREE.MeshStandardMaterial({ color: tint, emissive: tint, emissiveIntensity: 1, transparent: true, opacity: 1 })
      );
      shard.position.copy(at);
      // slow outward velocity (small numbers = gentle wander), slight upward bias
      const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.3, Math.random() - 0.5).normalize();
      shard.userData.vel = dir.multiplyScalar(0.015 + Math.random() * 0.02);
      group.add(shard);
      bits.push(shard);
    }
    parent.add(group);
    bursts.current.push({ group, bits, life: 0 });
  };

  // Expose the imperative `fire` method to the rest of the scene via the handle ref.
  useEffect(() => {
    handleRef.current = {
      fire: (from, to, tint, onPopped) => {
        const parent = root.current;
        if (!parent) {
          onPopped();
          return;
        }
        // launch a short STREAM of tiny stars from the wand toward the bubble
        const COUNT = 5; // tiny star-stream
        for (let i = 0; i < COUNT; i++) {
          const star = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.1),
            new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xffae3a, emissiveIntensity: 1.2 })
          );
          star.position.copy(from);
          parent.add(star);
          shots.current.push({
            mesh: star,
            from: from.clone(),
            to: to.clone(),
            // stagger each star so they form a stream; ~0.6s for the lead star to arrive
            t: -i * 0.12,
            speed: 0.03,
            tint,
            // only the LAST star triggers the burst + rating, so it fires once
            onArrive:
              i === COUNT - 1
                ? () => {
                    spawnBurst(to.clone(), tint); // bubble bursts into slow particles
                    playPop();
                    onPopped(); // open the rating panel
                  }
                : () => {},
          });
        }
        playFire();
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef]);

  // Per-frame: advance stars toward the bubble, then drift + fade burst particles.
  useFrame(() => {
    const parent = root.current;
    if (!parent) return;

    // stars travel from wand to bubble
    for (let i = shots.current.length - 1; i >= 0; i--) {
      const s = shots.current[i];
      s.t += s.speed;
      if (s.t < 0) continue; // staggered start (still waiting to launch)
      const tt = Math.min(1, s.t);
      // ease along the path with a little arc by lifting mid-flight
      s.mesh.position.lerpVectors(s.from, s.to, tt);
      s.mesh.position.y += Math.sin(tt * Math.PI) * 0.6; // gentle arc upward
      s.mesh.rotation.x += 0.3;
      s.mesh.rotation.y += 0.3;
      if (s.t >= 1) {
        parent.remove(s.mesh);
        shots.current.splice(i, 1);
        s.onArrive();
      }
    }

    // burst particles wander slowly outward and fade over ~2s
    for (let i = bursts.current.length - 1; i >= 0; i--) {
      const b = bursts.current[i];
      b.life += 0.008; // ~2s lifespan at 60fps
      for (const shard of b.bits) {
        const vel = shard.userData.vel as THREE.Vector3;
        shard.position.add(vel);
        shard.rotation.x += 0.02;
        shard.rotation.y += 0.03;
        const mat = shard.material as THREE.MeshStandardMaterial;
        mat.opacity = Math.max(0, 1 - b.life);
      }
      if (b.life >= 1) {
        parent.remove(b.group);
        bursts.current.splice(i, 1);
      }
    }
  });

  return <group ref={root} />;
}

// ---- the drag plane + camera + scene driver ----------------------------------
// This component lives INSIDE the Canvas so it can use r3f hooks.
function SceneInner({
  avatarKey,
  color,
  bubbles,
  onPop,
  draggingRef,
}: {
  avatarKey: string;
  color: number;
  bubbles: { uid: number; bubble: DreamBubble; position: [number, number, number] }[];
  onPop: (uid: number, b: DreamBubble) => void;
  draggingRef: React.MutableRefObject<boolean>;
}) {
  const { camera, gl, scene } = useThree();

  // Eased movement state: target (set by drag) and current (eased toward target).
  const targetPos = useRef(new THREE.Vector3(ISLAND_CENTERS[Math.floor(ISLAND_COUNT / 2)], 0, 0));
  const playerPos = useRef(new THREE.Vector3(ISLAND_CENTERS[Math.floor(ISLAND_COUNT / 2)], 0, 0));

  // Camera orbit state (yaw/pitch/distance) — now actually updated by dragging.
  const orbit = useRef({ yaw: 0.6, pitch: 0.35, dist: 20 });

  // Live bubble positions (as THREE.Vector3) so the avatar can look toward the nearest.
  // We keep a ref and sync it whenever the bubbles prop changes (no per-frame allocation).
  const bubblePositions = useRef<THREE.Vector3[]>([]);
  useEffect(() => {
    bubblePositions.current = bubbles.map((b) => new THREE.Vector3(b.position[0], b.position[1], b.position[2]));
  }, [bubbles]);

  // A ref to the avatar group so pointer handling can tell "did I grab the avatar?".
  const avatarRef = useRef<THREE.Group | null>(null);

  // Imperative handle to the Effects component (stars + burst). Set by <Effects>.
  const effects = useRef<EffectsHandle | null>(null);

  // Compute the wand-tip world position (where star streams launch from).
  // The avatar group stores a local wandTip offset (set in buildAvatar). We search the
  // avatar subtree for it, then transform it to world space using the live transform.
  const wandTipWorld = (): THREE.Vector3 => {
    const out = new THREE.Vector3(0.6, DECK_TOP + HOVER + 1.0, 0.4); // sensible fallback
    const a = avatarRef.current;
    if (a) {
      // find the object that carries the wandTip offset (the built avatar group)
      let tip: THREE.Vector3 | null = null;
      let host: THREE.Object3D | null = null;
      a.traverse((o) => {
        if (!tip && o.userData && o.userData.wandTip) {
          tip = o.userData.wandTip as THREE.Vector3;
          host = o;
        }
      });
      if (tip && host) {
        out.copy(tip);
        host.localToWorld(out); // local -> world using the avatar's live position/rotation
      }
    }
    return out;
  };

  // Called by a bubble when clicked: fire the star stream from the wand to the bubble,
  // then (when the stream arrives) burst particles and open the rating panel via onPop.
  // We carry the bubble's unique uid so the right instance is removed (dreams can repeat).
  const requestPop = (uid: number, b: DreamBubble, worldPos: THREE.Vector3) => {
    const from = wandTipWorld();
    if (effects.current) {
      effects.current.fire(from, worldPos, b.tint, () => onPop(uid, b));
    } else {
      // effects not ready (shouldn't happen) — fall back to popping immediately
      onPop(uid, b);
    }
  };

  // Reusable raycaster + the horizontal plane at the avatar's hover height.
  // We project the cursor onto THIS plane to move the floating avatar (the verified
  // fix — never raycast the green mesh, which fails because the avatar floats).
  const ray = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -(DECK_TOP + HOVER)));
  const hit = useRef(new THREE.Vector3());

  // Local drag state: are we dragging the AVATAR or ORBITING the camera?
  const mode = useRef<"none" | "avatar" | "orbit">("none");
  const last = useRef({ x: 0, y: 0 });

  // ---- pointer + wheel handling on the actual canvas element -----------------
  // (DOM listeners on gl.domElement — the same robust approach the mockup used —
  //  so it works regardless of what 3D object is under the cursor.)
  useEffect(() => {
    const el = gl.domElement;

    const setMouseFromEvent = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ray.current.setFromCamera(mouse.current, camera);
    };

    const pointerOverAvatar = (): boolean => {
      if (!avatarRef.current) return false;
      return ray.current.intersectObject(avatarRef.current, true).length > 0;
    };

    const onDown = (e: PointerEvent) => {
      setMouseFromEvent(e);
      // grabbing the avatar starts an avatar-drag; anywhere else orbits the camera
      mode.current = pointerOverAvatar() ? "avatar" : "orbit";
      draggingRef.current = mode.current === "avatar";
      last.current = { x: e.clientX, y: e.clientY };
    };

    const onMove = (e: PointerEvent) => {
      if (mode.current === "none") {
        // just update the cursor style based on hover
        setMouseFromEvent(e);
        el.style.cursor = pointerOverAvatar() ? "grab" : "default";
        return;
      }
      if (mode.current === "avatar") {
        // project the cursor onto the hover plane, clamp to the islands, set target
        setMouseFromEvent(e);
        if (ray.current.ray.intersectPlane(dragPlane.current, hit.current)) {
          const { x, z } = clampToIslands(hit.current.x, hit.current.z);
          targetPos.current.x = x;
          targetPos.current.z = z;
        }
        el.style.cursor = "grabbing";
      } else {
        // orbit the camera by the drag delta (turn the world)
        const o = orbit.current;
        o.yaw -= (e.clientX - last.current.x) * 0.006;
        o.pitch += (e.clientY - last.current.y) * 0.006;
        o.pitch = Math.max(-0.2, Math.min(0.85, o.pitch)); // keep a sensible tilt range
        last.current = { x: e.clientX, y: e.clientY };
        el.style.cursor = "grabbing";
      }
    };

    const onUp = () => {
      mode.current = "none";
      draggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const o = orbit.current;
      o.dist = Math.max(9, Math.min(46, o.dist + e.deltaY * 0.02)); // zoom in/out
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [gl, camera, scene, draggingRef]);

  // Ease playerPos toward targetPos with a speed cap, then position the camera
  // (which now uses the live, drag-updated orbit so you can turn the world).
  useFrame(() => {
    const p = playerPos.current;
    const tg = targetPos.current;
    let ex = (tg.x - p.x) * FOLLOW;
    let ez = (tg.z - p.z) * FOLLOW;
    const step = Math.hypot(ex, ez);
    if (step > MAX_STEP) {
      ex = (ex / step) * MAX_STEP;
      ez = (ez / step) * MAX_STEP;
    }
    p.x += ex;
    p.z += ez;

    const o = orbit.current;
    const cx = p.x + Math.cos(o.yaw) * Math.cos(o.pitch) * o.dist;
    const cz = p.z + Math.sin(o.yaw) * Math.cos(o.pitch) * o.dist;
    const cy = Math.sin(o.pitch) * o.dist + 4;
    camera.position.set(cx, cy, cz);
    camera.lookAt(p.x, DECK_TOP + 0.9, p.z);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 12, 8]} intensity={1.1} castShadow />
      <fog attach="fog" args={[COLORS.fog, 10, 70]} />
      <color attach="background" args={[0x0a0826]} />

      <Background />

      {/* connected row of islands */}
      {ISLAND_CENTERS.map((cx, i) => (
        <Island key={i} centerX={cx} />
      ))}

      {/* managed flowers (brush to shed petals, regrow after a few seconds) */}
      <Flowers playerPos={playerPos} />

      {/* wooden plank bridges between adjacent islands (visual link of the connected row) */}
      {ISLAND_CENTERS.slice(0, -1).map((cx, i) => (
        <Bridge key={"b" + i} x0={cx + WALK_RADIUS * 0.72} x1={ISLAND_CENTERS[i + 1] - WALK_RADIUS * 0.72} />
      ))}

      {/* the player avatar — we keep a ref so pointer handling knows when it's grabbed */}
      <group ref={avatarRef}>
        <Player avatarKey={avatarKey} color={color} playerPos={playerPos} bubblePositions={bubblePositions} />
      </group>

      {/* wand star-streams + whimsical particle bursts (exposes fire() via the ref) */}
      <Effects handleRef={effects} />

      {/* dream bubbles — clicking one fires the star stream, then pops + rates */}
      {bubbles.map((b) => (
        <Bubble key={b.uid} bubble={b.bubble} position={b.position} onRequestPop={(bb, wp) => requestPop(b.uid, bb, wp)} />
      ))}
    </>
  );
}

// ---- a wooden plank bridge laid between two islands (decorative, on the surface) ----
function Bridge({ x0, x1 }: { x0: number; x1: number }) {
  const group = useMemo(() => {
    const g = new THREE.Group();
    const len = Math.abs(x1 - x0);
    const planks = Math.max(3, Math.round(len / 0.9));
    const plankMat = new THREE.MeshStandardMaterial({ color: 0x9b7a4e, roughness: 1, flatShading: true });
    for (let i = 0; i < planks; i++) {
      const px = x0 + ((i + 0.5) / planks) * (x1 - x0);
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 1.6), plankMat);
      // sit the planks on the island top surface
      plank.position.set(px, DECK_TOP + 0.06, 0);
      plank.receiveShadow = true;
      g.add(plank);
    }
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x0, x1]);
  return <primitive object={group} />;
}

// ---- the rating panel (opens after a bubble pops) ----------------------------
function RatingPanel({
  dream,
  onSubmit,
  onClose,
  notice,
}: {
  dream: GameDream;
  onSubmit: (value: number) => void;
  onClose: () => void;
  notice: string | null;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(8,6,26,0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
      }}
    >
      <div
        style={{
          width: 420,
          maxWidth: "90vw",
          background: "rgba(26,20,64,0.95)",
          border: "1px solid rgba(155,126,196,0.5)",
          borderRadius: 20,
          padding: 22,
          color: "#e0d4ff",
          fontFamily: "system-ui, sans-serif",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: 13, color: "#9b8ec4" }}>
          by {dream.author.username} · ★ {dream.averageRating.toFixed(1)} ({dream.ratingCount})
        </div>
        <h3 style={{ fontSize: 22, margin: "6px 0 10px" }}>{dream.title}</h3>
        {/* JSX auto-escapes user text; we never use dangerouslySetInnerHTML */}
        <p style={{ fontSize: 14, lineHeight: 1.5, color: "#d6c9f5", maxHeight: 160, overflowY: "auto" }}>{dream.content}</p>

        {dream.tags.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#9b8ec4" }}>{dream.tags.map((t) => `#${t}`).join("  ")}</div>
        )}

        {notice ? (
          <p style={{ marginTop: 16, color: "#ffd27e", fontSize: 14 }}>{notice}</p>
        ) : (
          <>
            <p style={{ marginTop: 16, marginBottom: 6, fontSize: 13, color: "#9b8ec4" }}>Rate this dream</p>
            <div style={{ display: "flex", gap: 6, fontSize: 34, cursor: "pointer" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => onSubmit(n)}
                  style={{ color: n <= hover ? "#ffe066" : "#5a4a8e", transition: "color 0.1s" }}
                >
                  ★
                </span>
              ))}
            </div>
          </>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: 18,
            padding: "8px 16px",
            borderRadius: 12,
            border: "1px solid #6a5acd",
            background: "transparent",
            color: "#c9b8e0",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ---- top-level game component ------------------------------------------------
export default function DreamWorld({
  avatarKey,
  color,
  onExit,
}: {
  avatarKey: string;
  color: number;
  onExit: () => void;
}) {
  // Active dream bubbles with their world positions.
  const [bubbles, setBubbles] = useState<{ uid: number; bubble: DreamBubble; position: [number, number, number] }[]>([]);
  // monotonically increasing id so every bubble instance is unique (dreams can repeat)
  const nextUid = useRef(0);
  // The dream currently being rated (panel open) + any notice (already rated, etc.).
  const [activeDream, setActiveDream] = useState<GameDream | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // Session score (dreams popped/rated this session) for the leaderboard.
  const [score, setScore] = useState(0);
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  // Track which dream ids we've already shown so we don't duplicate bubbles.
  const seenIds = useRef<Set<string>>(new Set());
  // Whether the avatar is currently being dragged (shared with the inner scene).
  const draggingRef = useRef<boolean>(false);

  // End any drag on pointer-up anywhere.
  useEffect(() => {
    const up = () => (draggingRef.current = false);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  // Give each new bubble a position floating above one of the islands.
  const placeBubble = useCallback((): [number, number, number] => {
    const cx = ISLAND_CENTERS[Math.floor(Math.random() * ISLAND_CENTERS.length)];
    const a = Math.random() * Math.PI * 2;
    const r = 1.5 + Math.random() * 4;
    return [cx + Math.cos(a) * r, 3 + Math.random() * 5, Math.sin(a) * r];
  }, []);

  // Fetch dreams from the REAL random route to fill up to ~10 bubbles.
  // Top the world up to TARGET bubbles by fetching random dreams. Uses the live
  // bubble count (read inside the functional updater) so repeated calls always refill
  // correctly — 10 on screen, and back up to 10 as they're popped.
  const TARGET_BUBBLES = 10;
  const fillBubbles = useCallback(async () => {
    // how many we still need right now (read from the latest state, not a stale closure)
    let current = 0;
    setBubbles((prev) => {
      current = prev.length;
      return prev; // no change yet — just reading the live count
    });
    // fetch enough fresh, non-duplicate dreams to reach the target
    const fresh: { uid: number; bubble: DreamBubble; position: [number, number, number] }[] = [];
    let guard = 0; // avoid infinite loops if the dream pool is small
    let misses = 0; // consecutive duplicates — signals the pool is exhausted
    while (current + fresh.length < TARGET_BUBBLES && guard < 60) {
      guard++;
      const dream = await fetchRandomDream();
      if (!dream) break; // 401/404/etc — stop trying
      if (seenIds.current.has(dream.id)) {
        misses++;
        // if we keep drawing dreams we've already shown, the pool is exhausted —
        // clear the "seen" set so dreams can be reused and the world stays full
        if (misses > 12) seenIds.current.clear();
        continue;
      }
      misses = 0;
      seenIds.current.add(dream.id);
      const tint = DREAM_TINTS[Math.floor(Math.random() * DREAM_TINTS.length)];
      fresh.push({ uid: nextUid.current++, bubble: { dream, tint }, position: placeBubble() });
    }
    // append the fresh bubbles to whatever is currently on screen
    if (fresh.length > 0) setBubbles((prev) => [...prev, ...fresh]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeBubble]);

  // Initial fill on mount.
  useEffect(() => {
    void fillBubbles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute the leaderboard whenever the score changes.
  useEffect(() => {
    // "You" uses avatarId 1 as a placeholder home-page pixel avatar for display.
    setLeaders(fetchLeaderboard({ username: "You", avatarId: 1, count: score }));
  }, [score]);

  // Called AFTER the star stream arrives and the bubble bursts (see Effects.fire).
  // The sounds (fire + pop) and the visual burst are handled inside the effect; here we
  // just remove the popped bubble from the world and open its rating panel.
  const handlePop = useCallback((uid: number, b: DreamBubble) => {
    // remove the EXACT popped bubble instance (by uid, so repeated dreams are safe)
    setBubbles((prev) => prev.filter((x) => x.uid !== uid));
    setNotice(null);
    setActiveDream(b.dream);
  }, []);

  // Submit a rating to the REAL route and handle all outcomes.
  const handleSubmit = useCallback(
    async (value: number) => {
      if (!activeDream) return;
      const result = await rateDream(activeDream.id, value);
      if (result.ok) {
        playRate();
        setScore((s) => s + 1); // session score climbs
        setNotice(`Rated ${value}★ · the dreamer earned ${result.starsEarned} stars!`);
        // after a beat, close and top up the world with fresh bubbles
        setTimeout(() => {
          setActiveDream(null);
          setNotice(null);
          void fillBubbles();
        }, 1300);
      } else {
        // own dream / already rated / not signed in / etc — show the friendly notice
        setNotice(result.message ?? "Could not submit rating.");
      }
    },
    [activeDream, fillBubbles]
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* the 3D canvas */}
      <Canvas shadows camera={{ position: [12, 8, 12], fov: 50 }}>
        <SceneInner
          avatarKey={avatarKey}
          color={color}
          bubbles={bubbles}
          onPop={handlePop}
          draggingRef={draggingRef}
        />
      </Canvas>

      {/* HUD: title + exit */}
      <div style={{ position: "absolute", top: 16, left: 18, color: "#e0d4ff", fontFamily: "system-ui", pointerEvents: "none" }}>
        <div style={{ fontSize: 26, fontWeight: 700 }}>✦ Dream World ✦</div>
        <div style={{ fontSize: 13, color: "#9b8ec4" }}>Grab your dreamer and drag · click a bubble to pop &amp; rate</div>
      </div>
      <button
        onClick={onExit}
        style={{
          position: "absolute",
          top: 16,
          right: 18,
          padding: "8px 16px",
          borderRadius: 14,
          border: "1px solid rgba(155,126,196,0.5)",
          background: "rgba(26,20,64,0.7)",
          color: "#e0d4ff",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        ← Exit to Home
      </button>

      {/* in-game leaderboard (session-only for now) */}
      <div
        style={{
          position: "absolute",
          top: 72,
          right: 18,
          width: 200,
          background: "rgba(26,20,64,0.62)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(155,126,196,0.45)",
          borderRadius: 18,
          padding: 13,
          color: "#e0d4ff",
          fontFamily: "system-ui",
          fontSize: 13,
        }}
      >
        <div style={{ textAlign: "center", color: "#ffe066", fontWeight: 700, marginBottom: 8 }}>★ TOP POPPERS</div>
        {leaders.map((row, i) => (
          <div
            key={row.username + i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 6px",
              borderRadius: 8,
              background: row.isYou ? "rgba(255,224,102,0.12)" : "transparent",
              border: row.isYou ? "1px solid rgba(255,224,102,0.5)" : "1px solid transparent",
            }}
          >
            <span style={{ width: 14, color: "#9b8ec4" }}>{i + 1}</span>
            {/* leaderboard shows just the username (rank number is on the left) */}
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {row.username}
            </span>
            <span style={{ color: "#ffe066", fontWeight: 700 }}>{row.count}</span>
          </div>
        ))}
        <div style={{ textAlign: "center", color: "#7a6ca8", fontSize: 11, marginTop: 6 }}>Pop &amp; rate dreams to climb</div>
      </div>

      {/* rating panel */}
      {activeDream && (
        <RatingPanel
          dream={activeDream}
          notice={notice}
          onSubmit={handleSubmit}
          onClose={() => {
            setActiveDream(null);
            setNotice(null);
            // if the world is getting empty, top it up
            void fillBubbles(); // always top the world back up to 10
          }}
        />
      )}
    </div>
  );
}
