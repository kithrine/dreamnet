// avatarBuilders.ts
// -----------------------------------------------------------------------------
// Imperative THREE.js builders for the 10 game avatars.
// These are intentionally framework-agnostic (plain THREE groups) so the SAME
// builder is reused by both the avatar gallery and the in-game avatar — that
// guarantees "what you preview is what you play" with zero duplication.
//
// Each builder takes a `tint` (hex color number) used to recolor the main body,
// which is how the gallery's color swatches recolor the selected character.
// -----------------------------------------------------------------------------

import * as THREE from "three";

// The 10 avatars in the roster. `key` is the stable id, `name` is the label,
// `color` is the default tint shown first in the gallery.
export interface AvatarDef {
  key: string;
  name: string;
  color: number;
}

export const AVATARS: AvatarDef[] = [
  { key: "owl", name: "Owl", color: 0x9b7ec4 }, // NEW (created to match the low-poly style)
  { key: "wizard", name: "Wizard", color: 0x6a5acd },
  { key: "fox", name: "Fox", color: 0xe07a3c },
  { key: "knight", name: "Knight", color: 0xb0b6c8 },
  { key: "dragon", name: "Dragonling", color: 0x4aa890 },
  { key: "mushroom", name: "Mushroom", color: 0xd8554e },
  { key: "dino", name: "Turquoise Dinosaur", color: 0x3fc7c2 }, // NEW
  { key: "bunny", name: "Bunny", color: 0xe9c6d6 },
  { key: "frog", name: "Frog", color: 0x6fae4a },
  { key: "robot", name: "Robot", color: 0x8a93a8 },
];

// The color swatches offered to recolor the selected avatar (dreamy palette).
export const AVATAR_SWATCHES: number[] = [
  0x9b7ec4, 0xff9ed8, 0x7ee0ff, 0x9effc8, 0xffe066, 0xe07a3c, 0x6a5acd, 0xb0b6c8,
];

// ---- shared material + part helpers -----------------------------------------

// Standard flat-shaded material helper (keeps the soft low-poly look).
function M(color: number, opts: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.8, flatShading: true }, opts));
}

// Adds a pair of cartoon eyes (white sphere + dark pupil + tiny glint) to a group.
// Each pupil is tagged (userData.pupil) and remembers its rest position so the game
// can shift it slightly toward a target (eye-tracking) and ease it back.
function addEyes(g: THREE.Group, y: number, z: number, sep: number, r: number): void {
  const white = M(0xffffff, { roughness: 0.3 });
  const black = M(0x16161f);
  [-1, 1].forEach((s) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), white);
    e.position.set(s * sep, y, z);
    g.add(e);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(r * 0.52, 12, 12), black);
    pupil.position.set(s * sep, y, z + r * 0.62);
    // tag this pupil and store its rest position + how far it may travel, so the
    // game can nudge it toward a bubble and lerp it home (see eye-tracking in the world)
    pupil.userData.pupil = true;
    pupil.userData.rest = pupil.position.clone();
    pupil.userData.range = r * 0.35; // max distance the pupil can shift from rest
    g.add(pupil);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(r * 0.18, 8, 8), M(0xffffff));
    glint.position.set(s * sep + r * 0.2, y + r * 0.22, z + r * 0.7);
    g.add(glint);
  });
}

// Quick sphere helper.
function ball(r: number, mat: THREE.Material, seg = 18): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), mat);
}

// ---- the wand every player holds (shoots stars) -----------------------------

// Builds the wand as its own group so the game can find it (avatar.userData.wandTip)
// to know where stars launch from.
export function buildWand(): THREE.Group {
  const w = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.9, 8), M(0x6a4a8e));
  stick.position.y = 0.45;
  w.add(stick);
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), M(0xffe066, { emissive: 0xffae3a, emissiveIntensity: 1 }));
  star.position.y = 0.95;
  w.add(star);
  w.position.set(0.55, 0.05, 0.25);
  w.rotation.z = -0.3;
  return w;
}

// ---- the 10 avatar builders --------------------------------------------------
// Each returns a THREE.Group standing on y=0, roughly ~1.8 units tall.

type Builder = (tint: number) => THREE.Group;

const builders: Record<string, Builder> = {
  // OWL (new): round body, big eye discs, beak, ear tufts, little wings.
  owl: (t) => {
    const g = new THREE.Group();
    const body = ball(0.62, M(t));
    body.position.y = 0.85;
    body.scale.set(1, 1.15, 0.9);
    body.castShadow = true;
    g.add(body);
    const belly = ball(0.4, M(0xf3ead6));
    belly.position.set(0, 0.78, 0.42);
    belly.scale.set(1, 1.2, 0.5);
    g.add(belly);
    addEyes(g, 1.02, 0.42, 0.24, 0.18); // big owl eyes
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 4), M(0xffb347));
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.82, 0.66);
    g.add(beak);
    [-1, 1].forEach((s) => {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 5), M(t));
      tuft.position.set(s * 0.32, 1.4, 0);
      tuft.rotation.z = s * 0.3;
      g.add(tuft);
      const wing = ball(0.26, M(t));
      wing.scale.set(0.45, 1.1, 0.7);
      wing.position.set(s * 0.6, 0.82, 0);
      g.add(wing);
    });
    return g;
  },

  // WIZARD: cone robe, head, beard, pointy hat, staff with gem.
  wizard: (t) => {
    const g = new THREE.Group();
    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.55, 16), M(t));
    robe.position.y = 0.78;
    robe.castShadow = true;
    g.add(robe);
    const head = ball(0.34, M(0xf0d9b5));
    head.position.y = 1.55;
    g.add(head);
    // eyes: pushed forward to z=0.32 (near the head's front surface) and slightly larger
    // so they read clearly on the face and aren't hidden by the head/beard
    addEyes(g, 1.62, 0.32, 0.13, 0.085);
    const beard = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.5, 12), M(0xeeeef5));
    beard.position.set(0, 1.32, 0.18);
    beard.rotation.x = 0.2;
    g.add(beard);
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.05, 16), M(0x4a3a8e));
    hat.position.set(0, 2.1, 0);
    hat.rotation.z = 0.08;
    g.add(hat);
    const brim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.07, 8, 20), M(0x4a3a8e));
    brim.rotation.x = Math.PI / 2;
    brim.position.y = 1.75;
    g.add(brim);
    return g;
  },

  // FOX: body, head, snout, ears, bushy tail.
  fox: (t) => {
    const g = new THREE.Group();
    const body = ball(0.5, M(t));
    body.position.y = 0.7;
    body.scale.set(1, 1, 1.2);
    body.castShadow = true;
    g.add(body);
    const head = ball(0.36, M(t));
    head.position.set(0, 1.0, 0.2);
    g.add(head);
    addEyes(g, 1.05, 0.45, 0.16, 0.09);
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 12), M(0xfff4e6));
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.95, 0.6);
    g.add(snout);
    [-1, 1].forEach((s) => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.45, 4), M(t));
      ear.position.set(s * 0.3, 1.4, 0.1);
      ear.rotation.z = s * 0.18;
      g.add(ear);
    });
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1, 12), M(t));
    tail.position.set(0, 0.6, -0.7);
    tail.rotation.x = -0.9;
    g.add(tail);
    const tip = ball(0.2, M(0xfff4e6));
    tip.position.set(0, 1.05, -1.05);
    g.add(tip);
    return g;
  },

  // KNIGHT: armored cylinder body, helmet with visor, plume, shield.
  knight: (t) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.9, 16), M(t, { metalness: 0.5, roughness: 0.45 }));
    body.position.y = 0.6;
    body.castShadow = true;
    g.add(body);
    const helm = ball(0.34, M(t, { metalness: 0.5, roughness: 0.45 }));
    helm.position.y = 1.3;
    g.add(helm);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.1), M(0x16161f));
    visor.position.set(0, 1.3, 0.34);
    g.add(visor);
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.04), M(0xffe066, { emissive: 0xffae3a, emissiveIntensity: 1 }));
    eye.position.set(0, 1.3, 0.4);
    g.add(eye);
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 8), M(0xc0392b));
    plume.position.set(0, 1.75, -0.05);
    g.add(plume);
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.1), M(0x6a5acd, { metalness: 0.3 }));
    shield.position.set(-0.65, 0.7, 0.1);
    shield.rotation.y = 0.3;
    g.add(shield);
    return g;
  },

  // DRAGONLING: body, snout, horns, little wings, spiky tail.
  dragon: (t) => {
    const g = new THREE.Group();
    const body = ball(0.5, M(t));
    body.position.y = 0.7;
    body.scale.set(1, 1.05, 1.15);
    body.castShadow = true;
    g.add(body);
    const head = ball(0.34, M(t));
    head.position.set(0, 1.05, 0.25);
    g.add(head);
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.26, 0.4), M(t));
    snout.position.set(0, 0.98, 0.6);
    g.add(snout);
    addEyes(g, 1.15, 0.5, 0.2, 0.1);
    [-1, 1].forEach((s) => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 6), M(0xfff0c0));
      horn.position.set(s * 0.22, 1.42, 0.05);
      horn.rotation.z = s * 0.2;
      g.add(horn);
      const wing = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.12, 3), M(t, { transparent: true, opacity: 0.92 }));
      wing.scale.set(1, 1, 1.6);
      wing.position.set(s * 0.7, 0.95, -0.25);
      wing.rotation.set(0, s * -0.5, s * -1.1);
      g.add(wing);
    });
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1, 10), M(t));
    tail.position.set(0, 0.55, -0.75);
    tail.rotation.x = -1;
    g.add(tail);
    return g;
  },

  // MUSHROOM: stem body, big cap, dots, eyes, tiny arms.
  mushroom: (t) => {
    const g = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.85, 14), M(0xfff0e0));
    stem.position.y = 0.55;
    stem.castShadow = true;
    g.add(stem);
    addEyes(g, 0.65, 0.34, 0.14, 0.1);
    const cap = ball(0.6, M(t));
    cap.scale.set(1, 0.6, 1);
    cap.position.y = 1.05;
    g.add(cap);
    // white spots on the cap
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const dot = ball(0.08, M(0xfff0e0));
      dot.position.set(Math.cos(a) * 0.4, 1.12, Math.sin(a) * 0.4);
      g.add(dot);
    }
    [-1, 1].forEach((s) => {
      const arm = ball(0.1, M(0xfff0e0));
      arm.position.set(s * 0.4, 0.5, 0.2);
      g.add(arm);
    });
    return g;
  },

  // TURQUOISE DINOSAUR (new): rounded body, neck+head, back plates, stubby legs, tail.
  dino: (t) => {
    const g = new THREE.Group();
    const body = ball(0.55, M(t));
    body.position.y = 0.7;
    body.scale.set(1, 1, 1.3);
    body.castShadow = true;
    g.add(body);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.6, 10), M(t));
    neck.position.set(0, 1.1, 0.35);
    neck.rotation.x = -0.4;
    g.add(neck);
    const head = ball(0.3, M(t));
    head.position.set(0, 1.4, 0.6);
    g.add(head);
    addEyes(g, 1.48, 0.82, 0.16, 0.08);
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.3), M(t));
    snout.position.set(0, 1.36, 0.85);
    g.add(snout);
    // back plates
    for (let i = 0; i < 4; i++) {
      const plate = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 4), M(0x2a9d8f));
      plate.position.set(0, 1.15 - i * 0.02, 0.2 - i * 0.35);
      g.add(plate);
    }
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.1, 10), M(t));
    tail.position.set(0, 0.6, -0.85);
    tail.rotation.x = -1.1;
    g.add(tail);
    [-1, 1].forEach((s) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.4, 8), M(t));
      leg.position.set(s * 0.32, 0.2, 0.2);
      g.add(leg);
    });
    return g;
  },

  // BUNNY: body, head, tall ears, whiskers, fluffy tail.
  bunny: (t) => {
    const g = new THREE.Group();
    const body = ball(0.46, M(t));
    body.position.y = 0.65;
    body.castShadow = true;
    g.add(body);
    const head = ball(0.34, M(t));
    head.position.set(0, 1.15, 0.1);
    g.add(head);
    addEyes(g, 1.2, 0.34, 0.15, 0.09);
    [-1, 1].forEach((s) => {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.7, 10), M(t));
      ear.position.set(s * 0.18, 1.7, 0);
      ear.rotation.z = s * 0.12;
      g.add(ear);
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.55, 8), M(0xffc0cb));
      inner.position.set(s * 0.18, 1.73, 0.05);
      inner.rotation.z = s * 0.12;
      g.add(inner);
    });
    const tail = ball(0.16, M(0xffffff));
    tail.position.set(0, 0.5, -0.5);
    g.add(tail);
    return g;
  },

  // FROG: wide body, big eyes on top, smile, webbed feet.
  frog: (t) => {
    const g = new THREE.Group();
    const body = ball(0.55, M(t));
    body.position.y = 0.5;
    body.scale.set(1.2, 0.9, 1);
    body.castShadow = true;
    g.add(body);
    // bulging eyes sit on top of the head
    [-1, 1].forEach((s) => {
      const bulge = ball(0.18, M(t));
      bulge.position.set(s * 0.25, 0.95, 0.25);
      g.add(bulge);
      const white = ball(0.12, M(0xffffff, { roughness: 0.3 }));
      white.position.set(s * 0.25, 1.0, 0.32);
      g.add(white);
      const pupil = ball(0.06, M(0x16161f));
      pupil.position.set(s * 0.25, 1.0, 0.42);
      g.add(pupil);
    });
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 8, 18, Math.PI), M(0x3a6a2a));
    mouth.position.set(0, 0.55, 0.62);
    g.add(mouth);
    [-1, 1].forEach((s) => {
      const foot = ball(0.18, M(t));
      foot.scale.set(1.4, 0.5, 1);
      foot.position.set(s * 0.5, 0.12, 0.45);
      g.add(foot);
    });
    return g;
  },

  // ROBOT: box body + head, glowing visor, antenna, arms, chest light.
  robot: (t) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.85, 0.6), M(t, { metalness: 0.4, roughness: 0.5 }));
    body.position.y = 0.65;
    body.castShadow = true;
    g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.55), M(t, { metalness: 0.4, roughness: 0.5 }));
    head.position.y = 1.35;
    g.add(head);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.05), M(0x16d0ff, { emissive: 0x16d0ff, emissiveIntensity: 1.2 }));
    visor.position.set(0, 1.38, 0.3);
    g.add(visor);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), M(0x888899));
    ant.position.set(0, 1.78, 0);
    g.add(ant);
    const antTip = ball(0.06, M(0xffe066, { emissive: 0xffae3a, emissiveIntensity: 1 }));
    antTip.position.set(0, 1.95, 0);
    g.add(antTip);
    [-1, 1].forEach((s) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8), M(0x9aa0b0, { metalness: 0.4 }));
      arm.position.set(s * 0.55, 0.65, 0);
      arm.rotation.z = s * 0.3;
      g.add(arm);
    });
    const chest = ball(0.09, M(0xffe066, { emissive: 0xffae3a, emissiveIntensity: 0.8 }));
    chest.position.set(0, 0.7, 0.32);
    g.add(chest);
    return g;
  },
};

// Public builder: returns a fresh THREE.Group for the given avatar key + tint.
// Falls back to the owl if an unknown key is passed (defensive).
export function buildAvatar(key: string, tint: number): THREE.Group {
  const make = builders[key] ?? builders.owl;
  const g = make(tint);
  // Attach the wand and remember its tip position so the game can launch stars from it.
  const wand = buildWand();
  g.add(wand);
  // Approximate world tip of the wand star (local space) — used as the star spawn point.
  g.userData.wandTip = new THREE.Vector3(0.55, 1.0, 0.45);
  return g;
}
