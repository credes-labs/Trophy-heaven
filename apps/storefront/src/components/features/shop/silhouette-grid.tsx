"use client";

/**
 * SilhouetteGrid  (horizontal, transparent)
 * -----------------------------------------
 * The poster mosaic of thin-lined boxes, stretched into a landscape band. Each box
 * holds a furniture piece, trophy or sculpture that turns a full 360 degrees on a turntable.
 * Models available: bottle, vase1, vase2, table, daybed, chair, bench, console, lamp, stool,
 * armchair, lounger, cart, sofa, lounge (furniture) and fan, figure, rings, oscar, rock, knot
 * (sculptures and trophies). Swap `kind` in CELLS to change any box.
 * The background is clear: only the grid lines and the furniture are drawn, so
 * whatever is behind the component shows through.
 *
 * Install:   npm i three   &&   npm i -D @types/three
 * Use:       <SilhouetteGrid />
 *            <SilhouetteGrid aspect="2.4 / 1" ink="#0a0a0a" />
 *
 * The component fills the width of its parent. Height comes from `aspect`
 * (width / height). The boxes stretch with it and every model re-fits itself.
 *
 * Why it now reads as a full turn:
 *   A flat black outline looks identical at 0 and 180 degrees, so the old version
 *   felt like two half turns. Now the camera sits slightly above the pieces and each
 *   surface is shaded from a fixed light, so the front and back differ and you can
 *   see the piece go all the way round.
 *
 * Why nothing clips:
 *   Each model is fitted using its widest sweep while turning (its radius from the
 *   turntable axis), not its front width.
 *
 * Engine: one <canvas> over the whole grid, one WebGL renderer, one scissored
 * viewport per cell. No assets to load.
 *
 * Layout: area = [colStart, colEnd, rowStart, rowEnd] as CSS grid line numbers
 * (12 columns, 6 rows). fit.h = fraction of the cell height the piece fills,
 * fit.w = fraction of the cell width its turning sweep fills.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ===== ENGINE START (plain TypeScript, no React) =====
type Fit = { w?: number; h?: number };
type Cell = { kind: string; fit: Fit; area: [number, number, number, number]; still?: boolean };
type P3 = [number, number, number];

const COLS = 12;
const ROWS = [93, 99, 130, 88, 39, 126]; // row heights, same proportions as the poster
const PERIOD_MS = 7000; // one full turn
const PITCH = (10 * Math.PI) / 180; // camera looks down 10 degrees

const CELLS: Cell[] = [
  { kind: "bottle", fit: { h: 0.72 }, area: [1, 3, 1, 3], still: true },
  { kind: "vase1", fit: { h: 0.62 }, area: [3, 5, 1, 2], still: true },
  { kind: "vase2", fit: { h: 0.6 }, area: [5, 7, 1, 2], still: true },
  { kind: "table", fit: { h: 0.6 }, area: [3, 7, 2, 3] },
  { kind: "fan", fit: { h: 0.84 }, area: [7, 11, 1, 3] },
  { kind: "figure", fit: { h: 0.9 }, area: [11, 13, 1, 3] },
  { kind: "rings", fit: { h: 0.8 }, area: [1, 4, 3, 4] },
  { kind: "console", fit: { h: 0.62 }, area: [4, 9, 3, 4] },
  { kind: "oscar", fit: { h: 0.9 }, area: [9, 11, 3, 7] },
  { kind: "rock", fit: { h: 0.88 }, area: [11, 13, 3, 5] },
  { kind: "armchair", fit: { h: 0.6 }, area: [1, 5, 4, 6] },
  { kind: "lounger", fit: { h: 0.62 }, area: [5, 9, 4, 6] },
  { kind: "cart", fit: { h: 0.75 }, area: [1, 5, 6, 7] },
  { kind: "sofa", fit: { h: 0.7 }, area: [5, 9, 6, 7] },
  { kind: "knot", fit: { h: 0.8 }, area: [11, 13, 5, 7] },
];

let INK: THREE.ShaderMaterial | null = null;
/** Near-black with a soft top-left light, so turning surfaces read without losing the silhouette. */
function ink(): THREE.ShaderMaterial {
  if (!INK) {
    INK = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      vertexShader: `
        varying vec3 vN;
        void main() {
          vN = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying vec3 vN;
        void main() {
          vec3 n = normalize(vN);
          if (!gl_FrontFacing) n = -n;
          float d = clamp(dot(n, normalize(vec3(-0.55, 0.8, 0.6))), 0.0, 1.0);
          gl_FragColor = vec4(mix(vec3(0.035), vec3(0.26), pow(d, 1.6)), 1.0);
        }`,
    });
  }
  return INK;
}

function box(w: number, h: number, d: number, x: number, y: number, z: number, rx = 0): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ink());
  m.position.set(x, y, z);
  m.rotation.x = rx;
  return m;
}

/** Tapered rod from point a (radius r0) to point b (radius r1). */
function rod(a: P3, b: P3, r0: number, r1: number = r0): THREE.Mesh {
  const A = new THREE.Vector3(a[0], a[1], a[2]);
  const B = new THREE.Vector3(b[0], b[1], b[2]);
  const dir = B.clone().sub(A);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, dir.length(), 12, 1), ink());
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

function cyl(rTop: number, rBot: number, h: number, x: number, y: number, z: number, alongX = false): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 48), ink());
  m.position.set(x, y, z);
  if (alongX) m.rotation.z = Math.PI / 2;
  return m;
}

function lathe(pts: [number, number][]): THREE.Mesh {
  return new THREE.Mesh(new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), 64), ink());
}

/** Mesh from any geometry, placed and rotated. */
function put(geo: THREE.BufferGeometry, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0): THREE.Mesh {
  const m = new THREE.Mesh(geo, ink());
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  return m;
}

/** Smooth curve through points, as vectors. */
function curve(pts: [number, number][], divisions: number): THREE.Vector2[] {
  return new THREE.SplineCurve(pts.map((p) => new THREE.Vector2(p[0], p[1]))).getPoints(divisions);
}

/** Extrude a flat shape and centre it front to back. */
function extrude(shape: THREE.Shape, depth: number, bevel = 0.012): THREE.BufferGeometry {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 48,
  });
  g.computeBoundingBox();
  const bb = g.boundingBox as THREE.Box3;
  g.translate(0, 0, -(bb.min.z + bb.max.z) / 2);
  return g;
}

/** Flat oval band: outer radii (rx, ry), hole radii (hx, hy). */
function ovalRing(rx: number, ry: number, hx: number, hy: number, depth: number): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
  const h = new THREE.Path();
  h.absellipse(0, 0, hx, hy, 0, Math.PI * 2, true, 0);
  s.holes.push(h);
  return extrude(s, depth);
}

const SIGNS = [-1, 1];
const LEG = 0.018; // leg radius, thick enough to stay solid at small sizes

const MODELS: Record<string, (g: THREE.Group) => void> = {
  bottle: (g) => {
    g.add(lathe([[0, 0], [0.12, 0], [0.15, 0.05], [0.165, 0.35], [0.14, 0.6], [0.055, 0.8], [0.05, 0.96], [0, 0.96]]));
  },
  vase1: (g) => {
    g.add(lathe([[0, 0], [0.15, 0], [0.25, 0.12], [0.27, 0.3], [0.19, 0.52], [0.13, 0.62], [0.14, 0.68], [0, 0.68]]));
  },
  vase2: (g) => {
    g.add(lathe([[0, 0], [0.2, 0], [0.27, 0.1], [0.28, 0.28], [0.24, 0.48], [0.2, 0.52], [0, 0.52]]));
  },
  // Round top on a pedestal made of thin fins
  table: (g) => {
    g.add(cyl(0.55, 0.55, 0.03, 0, 0.485, 0));
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      g.add(rod([Math.cos(a) * 0.21, 0, Math.sin(a) * 0.21], [Math.cos(a) * 0.035, 0.47, Math.sin(a) * 0.035], 0.016, 0.012));
    }
  },
  // Low daybed with a raised arm at one end
  daybed: (g) => {
    g.add(box(1.7, 0.1, 0.8, 0, 0.14, 0));
    g.add(box(1.62, 0.14, 0.72, 0, 0.26, 0.02));
    g.add(box(1.62, 0.3, 0.16, 0, 0.49, -0.34));
    g.add(box(0.14, 0.3, 0.8, -0.78, 0.4, 0));
    for (const sx of SIGNS) for (const sz of SIGNS) g.add(box(0.05, 0.1, 0.05, sx * 0.78, 0.04, sz * 0.34));
  },
  chair: (g) => {
    g.add(box(0.44, 0.04, 0.42, 0, 0.44, 0));
    for (const sx of SIGNS) {
      g.add(rod([sx * 0.19, 0, 0.18], [sx * 0.19, 0.44, 0.18], LEG));
      g.add(rod([sx * 0.19, 0, -0.19], [sx * 0.19, 0.9, -0.19], LEG));
    }
    g.add(box(0.44, 0.12, 0.03, 0, 0.82, -0.19));
    g.add(box(0.4, 0.03, 0.03, 0, 0.62, -0.19));
    g.add(box(0.4, 0.025, 0.025, 0, 0.2, 0.18));
    g.add(box(0.4, 0.025, 0.025, 0, 0.2, -0.19));
  },
  // Low bench on splayed tapered legs
  bench: (g) => {
    g.add(box(1.3, 0.07, 0.4, 0, 0.385, 0));
    for (const sx of SIGNS) for (const sz of SIGNS) g.add(rod([sx * 0.62, 0, sz * 0.2], [sx * 0.46, 0.35, sz * 0.11], 0.016, 0.026));
  },
  console: (g) => {
    g.add(box(1.6, 0.32, 0.42, 0, 0.36, 0));
    g.add(box(1.64, 0.03, 0.44, 0, 0.545, 0));
    for (const sx of SIGNS) for (const sz of SIGNS) g.add(rod([sx * 0.74, 0, sz * 0.17], [sx * 0.74, 0.2, sz * 0.17], LEG));
  },
  // Box shade on a tripod. Three legs only, meeting under the shade.
  lamp: (g) => {
    g.add(box(0.52, 0.3, 0.42, 0, 1.83, 0));
    [90, 210, 330].forEach((deg) => {
      const a = (deg * Math.PI) / 180;
      g.add(rod([Math.cos(a) * 0.34, 0, Math.sin(a) * 0.34], [Math.cos(a) * 0.04, 1.68, Math.sin(a) * 0.04], 0.022, 0.03));
    });
  },
  stool: (g) => {
    g.add(box(0.42, 0.12, 0.4, 0, 0.72, 0));
    for (const sx of SIGNS) for (const sz of SIGNS) g.add(rod([sx * 0.2, 0, sz * 0.18], [sx * 0.18, 0.66, sz * 0.16], LEG));
    g.add(box(0.4, 0.022, 0.022, 0, 0.28, 0.19));
    g.add(box(0.4, 0.022, 0.022, 0, 0.28, -0.19));
    for (const sx of SIGNS) g.add(box(0.022, 0.022, 0.36, sx * 0.2, 0.28, 0));
  },
  armchair: (g) => {
    g.add(box(0.62, 0.14, 0.58, 0, 0.3, 0.02));
    g.add(box(0.62, 0.38, 0.12, 0, 0.55, -0.26));
    for (const sx of SIGNS) g.add(box(0.08, 0.22, 0.6, sx * 0.35, 0.42, 0));
    for (const sx of SIGNS) for (const sz of SIGNS) g.add(rod([sx * 0.3, 0, sz * 0.25], [sx * 0.3, 0.23, sz * 0.25], LEG));
  },
  // Sun lounger: end-on it reads as a small chair, side-on as a long reclined line
  lounger: (g) => {
    g.add(box(0.5, 0.04, 0.8, 0, 0.3, 0.25));
    g.add(box(0.5, 0.04, 0.9, 0, 0.67, -0.41, 0.96));
    for (const sx of SIGNS) {
      g.add(rod([sx * 0.25, 0, 0.58], [sx * 0.25, 0.3, 0.58], LEG));
      g.add(rod([sx * 0.25, 0, -0.1], [sx * 0.25, 0.3, -0.1], LEG));
      g.add(box(0.034, 0.034, 1.0, sx * 0.25, 0.28, 0.1));
      g.add(rod([sx * 0.25, 0.3, -0.1], [sx * 0.25, 0.6, -0.42], 0.015));
    }
  },
  cart: (g) => {
    g.add(box(0.56, 0.03, 0.4, 0, 0.66, 0));
    g.add(box(0.56, 0.02, 0.4, 0, 0.24, 0));
    for (const sx of SIGNS) {
      for (const sz of SIGNS) {
        g.add(rod([sx * 0.26, 0.07, sz * 0.18], [sx * 0.26, 0.66, sz * 0.18], 0.016));
        g.add(cyl(0.065, 0.065, 0.03, sx * 0.29, 0.065, sz * 0.18, true));
      }
      g.add(rod([sx * 0.26, 0.66, -0.18], [sx * 0.26, 0.86, -0.2], 0.014));
    }
    g.add(box(0.54, 0.024, 0.024, 0, 0.86, -0.2));
  },
  sofa: (g) => {
    g.add(box(1.8, 0.22, 0.8, 0, 0.2, 0));
    g.add(box(1.8, 0.36, 0.2, 0, 0.5, -0.3));
    for (const sx of SIGNS) g.add(box(0.16, 0.3, 0.8, sx * 0.82, 0.4, 0));
    for (const sx of SIGNS) for (const sz of SIGNS) g.add(box(0.05, 0.09, 0.05, sx * 0.8, 0.045, sz * 0.34));
  },
  // Lounge chair with slim arms and splayed legs
  lounge: (g) => {
    g.add(box(0.6, 0.12, 0.56, 0, 0.28, 0.02));
    g.add(box(0.6, 0.4, 0.1, 0, 0.52, -0.25, -0.15));
    for (const sx of SIGNS) {
      g.add(rod([sx * 0.32, 0.52, 0.25], [sx * 0.32, 0.52, -0.22], 0.02));
      g.add(rod([sx * 0.32, 0.28, 0.24], [sx * 0.32, 0.52, 0.24], 0.02));
    }
    for (const sx of SIGNS) for (const sz of SIGNS) g.add(rod([sx * 0.34, 0, sz * 0.3], [sx * 0.28, 0.24, sz * 0.24], 0.016, 0.02));
  },
};

// Sculptures and trophies. Heights use the same units as the furniture.
Object.assign(MODELS, {
  fan: (g: THREE.Group) => {
    g.add(box(0.62, 0.06, 0.5, 0, 0.03, 0));
    g.add(rod([0, 0.06, 0], [0, 0.36, 0], 0.045, 0.028));
    g.add(put(new THREE.SphereGeometry(0.06, 24, 16), 0, 0.12, 0));
    const cy = 0.83;
    const face = new THREE.RingGeometry(0.004, 0.5, 112, 8);
    const p = face.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      p.setZ(i, 0.035 + 0.03 * Math.cos(28 * Math.atan2(y, x)) * (Math.hypot(x, y) / 0.5));
    }
    face.computeVertexNormals();
    g.add(put(face, 0, cy, 0));
    g.add(put(new THREE.CircleGeometry(0.5, 112), 0, cy, -0.035));
    const edge = new THREE.CylinderGeometry(0.5, 0.5, 0.07, 112, 1, true);
    edge.rotateX(Math.PI / 2);
    g.add(put(edge, 0, cy, 0));
  },

  figure: (g: THREE.Group) => {
    const R: [number, number][] = [[0, 1.0], [0.05, 0.99], [0.07, 0.95], [0.058, 0.905], [0.04, 0.88], [0.085, 0.858], [0.15, 0.825], [0.195, 0.775], [0.2, 0.71], [0.175, 0.64], [0.125, 0.57], [0.1, 0.47], [0.115, 0.37], [0.1, 0.27], [0.075, 0.18], [0.07, 0.12], [0.1, 0.05], [0.115, 0.01]];
    const L: [number, number][] = [[-0.24, 0], [-0.13, 0.06], [-0.078, 0.13], [-0.1, 0.27], [-0.115, 0.37], [-0.1, 0.47], [-0.105, 0.54], [-0.13, 0.61], [-0.19, 0.69], [-0.21, 0.76], [-0.17, 0.82], [-0.1, 0.855], [-0.04, 0.88], [-0.058, 0.905], [-0.07, 0.95], [-0.05, 0.99]];
    const shape = new THREE.Shape(curve(R, 150).concat(curve(L, 150)));
    const hole = new THREE.Path();
    hole.absarc(0, 0.72, 0.085, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    g.add(put(extrude(shape, 0.14), 0, 0.3, 0));
    g.add(put(new THREE.CylinderGeometry(0.19, 0.2, 0.22, 8), 0, 0.19, 0, 0, Math.PI / 8, 0));
    g.add(put(new THREE.CylinderGeometry(0.26, 0.28, 0.08, 8), 0, 0.04, 0, 0, Math.PI / 8, 0));
  },

  rings: (g: THREE.Group) => {
    g.add(cyl(0.34, 0.34, 0.07, 0, 0.035, 0));
    g.add(cyl(0.03, 0.03, 0.12, 0, 0.13, 0));
    const cy = 0.71;
    g.add(put(ovalRing(0.42, 0.52, 0.3, 0.4, 0.07), 0, cy, 0));
    g.add(put(ovalRing(0.3, 0.38, 0.19, 0.27, 0.07), 0, cy + 0.02, 0, 0, (60 * Math.PI) / 180, 0));
    g.add(put(ovalRing(0.26, 0.3, 0.15, 0.2, 0.07), 0, cy - 0.06, 0, 0, (-45 * Math.PI) / 180, 0));
  },

  oscar: (g: THREE.Group) => {
    const prof: [number, number][] = [[0, 0], [0.11, 0], [0.115, 0.025], [0.1, 0.05], [0.065, 0.075], [0.06, 0.2], [0.075, 0.33], [0.095, 0.44], [0.09, 0.52], [0.105, 0.6], [0.15, 0.68], [0.19, 0.76], [0.2, 0.8], [0.15, 0.84], [0.07, 0.865], [0.045, 0.885], [0.055, 0.915], [0.075, 0.945], [0.07, 0.98], [0, 1.0]];
    const body = new THREE.LatheGeometry(prof.map((q) => new THREE.Vector2(q[0], q[1])), 48);
    body.scale(1, 1, 0.55);
    g.add(put(body, 0, 0.84, 0));
    g.add(cyl(0.16, 0.16, 0.25, 0, 0.715, 0));
    g.add(box(0.51, 0.37, 0.51, 0, 0.405, 0));
    g.add(box(0.58, 0.03, 0.58, 0, 0.205, 0));
    g.add(box(0.67, 0.08, 0.67, 0, 0.15, 0));
    g.add(box(0.78, 0.11, 0.78, 0, 0.055, 0));
  },

  rock: (g: THREE.Group) => {
    g.add(box(0.6, 0.06, 0.32, 0, 0.03, 0));
    const loops: [number, number, number, number, number][] = [
      [0, 0.13, 0.13, 0.045, 20],
      [0, 0.28, 0.1, 0.04, -50],
      [0.07, 0.45, 0.15, 0.045, 70],
      [-0.04, 0.62, 0.13, 0.045, 10],
      [0.05, 0.78, 0.12, 0.04, -30],
      [-0.06, 0.92, 0.1, 0.04, 60],
    ];
    for (const [x, y, r, t, a] of loops) g.add(put(new THREE.TorusGeometry(r, t, 16, 48), x, y + 0.06, 0, 0, (a * Math.PI) / 180, 0));
  },

  knot: (g: THREE.Group) => {
    g.add(box(0.9, 0.07, 0.7, 0, 0.035, 0));
    const a = new THREE.TorusGeometry(0.3, 0.15, 32, 72);
    a.scale(1, 1, 0.6);
    const b = new THREE.TorusGeometry(0.26, 0.14, 32, 72);
    b.scale(1, 1, 0.6);
    g.add(put(a, 0, 0.87, 0, -0.17, 0.26, 0));
    g.add(put(b, 0.06, 0.49, 0, 0.35, -0.52, 0));
  },
});

type Live = {
  el: HTMLElement;
  def: Cell;
  scene: THREE.Scene;
  pivot: THREE.Group;
  cam: THREE.OrthographicCamera;
  mh: number; // model height
  R: number; // widest sweep from the turntable axis
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Draws every cell into one canvas. Returns a cleanup function. */
function mountSilhouettes(
  wrap: HTMLElement,
  canvas: HTMLCanvasElement,
  cellEls: HTMLElement[],
  defs: Cell[],
  reduced: boolean
): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;

  const cp = Math.cos(PITCH);
  const sp = Math.sin(PITCH);
  const tmp = new THREE.Vector3();

  const cells: Live[] = defs.map((def, i) => {
    const model = new THREE.Group();
    MODELS[def.kind](model);
    // stand on y = 0, centred over the turntable axis
    const bb = new THREE.Box3().setFromObject(model);
    const c = bb.getCenter(new THREE.Vector3());
    model.position.set(-c.x, -bb.min.y, -c.z);
    const pivot = new THREE.Group();
    pivot.add(model);
    pivot.updateMatrixWorld(true);

    // widest sweep: the farthest any vertex gets from the turning axis
    let R = 0;
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const pos = m.geometry.attributes.position;
      for (let k = 0; k < pos.count; k++) {
        tmp.fromBufferAttribute(pos, k).applyMatrix4(m.matrixWorld);
        R = Math.max(R, Math.hypot(tmp.x, tmp.z));
      }
    });

    const scene = new THREE.Scene();
    scene.add(pivot);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    cam.position.set(0, sp * 20, cp * 20);
    cam.lookAt(0, 0, 0);
    return { el: cellEls[i], def, scene, pivot, cam, mh: bb.max.y - bb.min.y, R, x: 0, y: 0, w: 1, h: 1 };
  });

  let W = 1;
  let H = 1;
  let visible = true;
  let raf = 0;
  const t0 = performance.now();

  function layout() {
    const wr = wrap.getBoundingClientRect();
    W = Math.max(1, wr.width);
    H = Math.max(1, wr.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);
    for (const c of cells) {
      const r = c.el.getBoundingClientRect();
      c.x = r.left - wr.left;
      c.y = r.top - wr.top;
      c.w = Math.max(1, r.width);
      c.h = Math.max(1, r.height);
      const f = c.def.fit;
      const hv = c.mh * cp + 2 * c.R * sp; // vertical extent including the footprint ellipse
      // pixels per world unit
      let s = f.w !== undefined ? (f.w * c.w) / (2 * c.R) : ((f.h || 0.6) * c.h) / c.mh;
      s = Math.min(s, (0.94 * c.w) / (2 * c.R), (0.9 * c.h) / hv); // never clip while turning
      const pad = 3 / s; // small gap above the bottom line
      c.cam.left = -c.w / (2 * s);
      c.cam.right = c.w / (2 * s);
      c.cam.bottom = -c.R * sp - pad;
      c.cam.top = c.cam.bottom + c.h / s;
      c.cam.updateProjectionMatrix();
    }
  }

  function draw(now: number) {
    const angle = reduced ? 0.6 : (((now - t0) % PERIOD_MS) / PERIOD_MS) * Math.PI * 2;
    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);
    for (const c of cells) {
      c.pivot.rotation.y = c.def.still ? 0 : angle;
      const vy = H - c.y - c.h;
      renderer.setViewport(c.x, vy, c.w, c.h);
      renderer.setScissor(c.x, vy, c.w, c.h);
      renderer.render(c.scene, c.cam);
    }
  }

  function frame(now: number) {
    if (visible) draw(now);
    raf = requestAnimationFrame(frame);
  }

  layout();
  draw(t0);
  if (!reduced) raf = requestAnimationFrame(frame);

  const ro = new ResizeObserver(() => {
    layout();
    draw(performance.now());
  });
  ro.observe(wrap);
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
  });
  io.observe(wrap);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    cells.forEach((c) =>
      c.scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      })
    );
    renderer.dispose();
  };
}
// ===== ENGINE END =====

/* ------------------------------------------------------------------ */
/* React component                                                     */
/* ------------------------------------------------------------------ */

export default function SilhouetteGrid({
  aspect = "2 / 1",
  ink: lineColor = "#0a0a0a",
  className = "",
}: {
  /** width / height of the whole band, as a CSS aspect-ratio value */
  aspect?: string;
  /** grid line colour */
  ink?: string;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!wrap.current || !canvas.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return mountSilhouettes(
      wrap.current,
      canvas.current,
      cellRefs.current.filter((el): el is HTMLDivElement => el != null),
      CELLS,
      reduced
    );
  }, []);

  const line = `1.5px solid ${lineColor}`;

  return (
    <div
      ref={wrap}
      role="img"
      aria-label="Furniture, trophy and sculpture silhouettes turning on a turntable"
      className={`relative w-full ${className}`}
      style={{ borderTop: line, borderLeft: line }} // no background: the page shows through
    >
      {/* every box draws its right and bottom edge; the wrapper draws the top and left */}
      <div
        className="grid w-full"
        style={{
          aspectRatio: aspect,
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: ROWS.map((r) => `${r}fr`).join(" "),
        }}
      >
        {CELLS.map((c, i) => (
          <div
            key={c.kind}
            ref={(el) => {
              cellRefs.current[i] = el;
            }}
            className="min-h-0 min-w-0"
            style={{
              borderRight: line,
              borderBottom: line,
              gridColumn: `${c.area[0]} / ${c.area[1]}`,
              gridRow: `${c.area[2]} / ${c.area[3]}`,
            }}
          />
        ))}
      </div>
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block h-full w-full"
      />
    </div>
  );
}
