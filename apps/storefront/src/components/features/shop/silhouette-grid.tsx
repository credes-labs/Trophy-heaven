"use client";

/**
 * SilhouetteGrid  (horizontal, transparent)
 * -----------------------------------------
 * The poster mosaic of thin-lined boxes, stretched into a landscape band. Each box
 * holds a trophy or award that turns a full 360 degrees on a turntable.
 * Models available: cup, urn, medal, star, plaque, crystal, globe, bowl, figure,
 * oscar. Swap `kind` in CELLS to change any box.
 * The background is clear: only the grid lines and the awards are drawn, so
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
  { kind: "urn", fit: { h: 0.78 }, area: [1, 3, 1, 3], still: true },
  { kind: "medal", fit: { h: 0.7 }, area: [3, 5, 1, 2], still: true },
  { kind: "star", fit: { h: 0.72 }, area: [5, 7, 1, 2], still: true },
  { kind: "bowl", fit: { h: 0.6 }, area: [3, 7, 2, 3] },
  { kind: "crystal", fit: { h: 0.84 }, area: [7, 11, 1, 3] },
  { kind: "figure", fit: { h: 0.9 }, area: [11, 13, 1, 3] },
  { kind: "globe", fit: { h: 0.8 }, area: [1, 4, 3, 4] },
  { kind: "plaque", fit: { h: 0.72 }, area: [4, 9, 3, 4] },
  { kind: "oscar", fit: { h: 0.9 }, area: [9, 11, 3, 7] },
  { kind: "star", fit: { h: 0.88 }, area: [11, 13, 3, 5] },
  { kind: "cup", fit: { h: 0.72 }, area: [1, 5, 4, 6] },
  { kind: "urn", fit: { h: 0.72 }, area: [5, 9, 4, 6] },
  { kind: "medal", fit: { h: 0.75 }, area: [1, 5, 6, 7] },
  { kind: "plaque", fit: { h: 0.7 }, area: [5, 9, 6, 7] },
  { kind: "cup", fit: { h: 0.8 }, area: [11, 13, 5, 7] },
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

const SIGNS = [-1, 1];

/** Five-point star outline, centred on the origin. */
function starShape(outer: number, inner: number): THREE.Shape {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    if (i === 0) s.moveTo(r * Math.cos(a), r * Math.sin(a));
    else s.lineTo(r * Math.cos(a), r * Math.sin(a));
  }
  s.closePath();
  return s;
}

/** Half-ring handle on one side of a cup; side = -1 left, 1 right. */
function handle(side: number, x: number, y: number, r: number): THREE.Mesh {
  return put(new THREE.TorusGeometry(r, 0.018, 12, 32, Math.PI), x, y, 0, 0, 0, -side * (Math.PI / 2));
}

/** Square stepped plinth, the common foot of most of the awards below. */
function plinth(g: THREE.Group, w: number, h: number) {
  g.add(box(w, h, w, 0, h / 2, 0));
  g.add(box(w * 0.82, h * 0.35, w * 0.82, 0, h + h * 0.175, 0));
}

// Trophies and awards only. Heights are roughly one unit; each model is
// re-centred and fitted to its box, so absolute scale does not matter.
const MODELS: Record<string, (g: THREE.Group) => void> = {
  // Two-handled loving cup on a turned stem
  cup: (g) => {
    plinth(g, 0.42, 0.1);
    g.add(lathe([[0, 0.135], [0.13, 0.135], [0.06, 0.18], [0.04, 0.33], [0.075, 0.37], [0.04, 0.41], [0.06, 0.45], [0.2, 0.55], [0.26, 0.72], [0.28, 0.9], [0.3, 0.92], [0, 0.92]]));
    for (const sx of SIGNS) g.add(handle(sx, sx * 0.27, 0.72, 0.1));
  },
  // Tall lidded cup with a finial
  urn: (g) => {
    plinth(g, 0.36, 0.09);
    g.add(lathe([[0, 0.12], [0.11, 0.12], [0.045, 0.16], [0.035, 0.36], [0.07, 0.4], [0.17, 0.5], [0.2, 0.66], [0.19, 0.8], [0.2, 0.82], [0.12, 0.88], [0.03, 0.93], [0.04, 0.97], [0, 1.0]]));
    for (const sx of SIGNS) g.add(handle(sx, sx * 0.19, 0.66, 0.08));
  },
  // Medal on a cradle stand, face toward the viewer
  medal: (g) => {
    g.add(box(0.5, 0.05, 0.22, 0, 0.025, 0));
    for (const sx of SIGNS) g.add(rod([sx * 0.16, 0.05, 0], [sx * 0.12, 0.34, 0], 0.016));
    g.add(put(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 72), 0, 0.6, 0, Math.PI / 2, 0, 0));
    g.add(put(new THREE.TorusGeometry(0.21, 0.014, 10, 72), 0, 0.6, 0.028));
  },
  // Star on a column
  star: (g) => {
    plinth(g, 0.34, 0.09);
    g.add(cyl(0.05, 0.065, 0.42, 0, 0.33, 0));
    g.add(put(extrude(starShape(0.24, 0.1), 0.07), 0, 0.78, 0));
  },
  // Arched wall plaque on a desk foot
  plaque: (g) => {
    const s = new THREE.Shape();
    s.moveTo(-0.32, 0);
    s.lineTo(0.32, 0);
    s.lineTo(0.32, 0.55);
    s.absarc(0, 0.55, 0.32, 0, Math.PI, false);
    s.lineTo(-0.32, 0);
    g.add(put(extrude(s, 0.06), 0, 0.08, 0));
    g.add(box(0.5, 0.08, 0.24, 0, 0.04, 0));
    g.add(box(0.34, 0.18, 0.02, 0, 0.42, 0.04));
  },
  // Crystal flame on a block base
  crystal: (g) => {
    const s = new THREE.Shape(curve([[0, 0], [0.22, 0.12], [0.24, 0.42], [0.12, 0.72], [0, 0.95]], 80).concat(curve([[-0.06, 0.8], [-0.18, 0.55], [-0.24, 0.3], [-0.2, 0.08], [0, 0]], 80)));
    g.add(put(extrude(s, 0.12), 0, 0.16, 0));
    g.add(box(0.46, 0.16, 0.24, 0, 0.08, 0));
  },
  // Classic column trophy topped with a globe
  globe: (g) => {
    plinth(g, 0.4, 0.1);
    g.add(cyl(0.07, 0.07, 0.44, 0, 0.36, 0));
    for (const y of [0.15, 0.58]) g.add(cyl(0.1, 0.1, 0.03, 0, y, 0));
    g.add(put(new THREE.SphereGeometry(0.16, 32, 24), 0, 0.76, 0));
    g.add(put(new THREE.TorusGeometry(0.2, 0.012, 8, 64), 0, 0.76, 0, Math.PI / 2.4, 0, 0));
  },
  // Broad presentation bowl (rose bowl) on a low foot
  bowl: (g) => {
    g.add(lathe([[0, 0], [0.22, 0], [0.12, 0.06], [0.1, 0.1], [0.3, 0.2], [0.42, 0.34], [0.44, 0.38], [0, 0.38]]));
    for (const sx of SIGNS) g.add(handle(sx, sx * 0.43, 0.3, 0.07));
  },
  figure: (g) => {
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

  oscar: (g) => {
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

};

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
      aria-label="Trophy and award silhouettes turning on a turntable"
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
