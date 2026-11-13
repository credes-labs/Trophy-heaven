/**
 * ChairSheet
 * ----------
 * A 3 x 3 technical drawing sheet of one barrel armchair, as a single SVG.
 * Row 1: front, side (left), rear
 * Row 2: top, bottom, side (right)
 * Row 3: three perspective views
 *
 * The chair is a small 3D model (a swept, tapering back band, a seat cushion, two rear
 * posts and two front legs, all in centimetres). Each view projects that model and
 * draws only the visible outlines, so the nine drawings always agree with each other.
 * Dimension lines use the model's real size: 75 wide, 85 deep, 73 high, 42 seat height.
 *
 * Use:   <ChairSheet />
 *        <ChairSheet ink="#161514" paper="#f2f0ee" grid={false} className="w-full" />
 *
 *   ink    line and text colour
 *   paper  fill that hides lines behind other parts. Set it to your section background.
 *   grid   draw the hairline 3 x 3 cell borders
 *
 * No dependencies. Server and client components can both render it.
 */

// ===== ENGINE START (plain TypeScript, no React) =====
type V3 = [number, number, number];
type P2 = [number, number];
/** A rounded box (centre c, size s, yaw), or any convex shape given as corner points. r = corner radius. */
type Prim = { c: V3; s: V3; r: number; yaw?: number; pts?: V3[] };
/** A line drawn on top of a group. Visible where its normal(s) face the camera. */
type Detail = { pts: V3[]; closed: boolean; normals?: V3[]; faceNormal?: V3; needsTop?: boolean };
type Group = { id: string; layer: number; prims: Prim[]; details: Detail[] };
type Cam = { yaw: number; pitch: number };

const D2R = Math.PI / 180;
const W_CM = 75;
const D_CM = 85;
const H_CM = 73;
const SEAT_CM = 42;

const CELL_W = 320;
const CELL_H = 300;
const SHEET_W = CELL_W * 3;
const SHEET_H = CELL_H * 3;
const LW = 1.35; // outline width in px

const r1 = (n: number) => Math.round(n * 10) / 10;

/* ---------- the chair ---------- */

const BAND = { half: 37.5, t: 11, Rc: 20, zEnd: 48 };

/** Centre line of the back band: left end, round the back, right end. */
function makeBandPath() {
  const cx = BAND.half - BAND.t / 2; // 32
  const zb = BAND.t / 2; // 5.5
  const zc = zb + BAND.Rc; // 25.5
  const a = cx - BAND.Rc; // 12
  const side = BAND.zEnd - zc;
  const arc = (Math.PI / 2) * BAND.Rc;
  type Pt = { x: number; z: number; tx: number; tz: number };
  const segs: { len: number; at: (u: number) => Pt }[] = [
    { len: side, at: (u) => ({ x: -cx, z: BAND.zEnd - u * side, tx: 0, tz: -1 }) },
    {
      len: arc,
      at: (u) => {
        const th = Math.PI + (u * Math.PI) / 2;
        return {
          x: -a + BAND.Rc * Math.cos(th),
          z: zc + BAND.Rc * Math.sin(th),
          tx: -Math.sin(th),
          tz: Math.cos(th),
        };
      },
    },
    { len: 2 * a, at: (u) => ({ x: -a + u * 2 * a, z: zb, tx: 1, tz: 0 }) },
    {
      len: arc,
      at: (u) => {
        const th = 1.5 * Math.PI + (u * Math.PI) / 2;
        return {
          x: a + BAND.Rc * Math.cos(th),
          z: zc + BAND.Rc * Math.sin(th),
          tx: -Math.sin(th),
          tz: Math.cos(th),
        };
      },
    },
    { len: side, at: (u) => ({ x: cx, z: zc + u * side, tx: 0, tz: 1 }) },
  ];
  const total = segs.reduce((n, s) => n + s.len, 0);
  const at = (s: number): Pt => {
    let rest = Math.min(Math.max(s, 0), total);
    for (const seg of segs) {
      if (rest <= seg.len) return seg.at(seg.len === 0 ? 0 : rest / seg.len);
      rest -= seg.len;
    }
    return segs[segs.length - 1].at(1);
  };
  return { total, at };
}

/** Band top and bottom heights; the arms slope down toward the front. */
function bandTop(d: number) {
  return H_CM - 11 * Math.pow(d, 1.7);
}
function bandBottom(d: number) {
  return 44 + 3 * Math.pow(d, 1.7);
}

function roundedRing(cx: number, cz: number, hw: number, hd: number, r: number, segs = 8) {
  const out: { x: number; z: number; nx: number; nz: number }[] = [];
  const corners: [number, number, number][] = [
    [hw - r, hd - r, 0],
    [-(hw - r), hd - r, 90],
    [-(hw - r), -(hd - r), 180],
    [hw - r, -(hd - r), 270],
  ];
  for (const [ox, oz, a0] of corners) {
    for (let i = 0; i <= segs; i++) {
      const th = (a0 + (90 * i) / segs) * D2R;
      out.push({
        x: cx + ox + r * Math.cos(th),
        z: cz + oz + r * Math.sin(th),
        nx: Math.cos(th),
        nz: Math.sin(th),
      });
    }
  }
  return out;
}

function buildChair(): Group[] {
  const groups: Group[] = [];

  // back band: many thin slices swept along the path, drawn as one outline
  const path = makeBandPath();
  const N = 48;
  const slices: Prim[] = [];
  for (let i = 0; i < N; i++) {
    // each slice is a quad whose corners follow the true top and bottom of the band
    const rr = i === 0 || i === N - 1 ? 2.4 : 0.7; // rounded arm ends, softly rounded joins
    const sA = i === 0 ? rr : (i / N) * path.total;
    const sB = i === N - 1 ? path.total - rr : ((i + 1) / N) * path.total;
    const pts: V3[] = [];
    for (const sv of [sA, sB]) {
      const p = path.at(sv);
      const d = Math.abs(sv / path.total - 0.5) * 2;
      const nx = p.tz;
      const nz = -p.tx;
      const rad = BAND.t / 2 - rr;
      for (const k of [-1, 1])
        for (const y of [bandBottom(d) + rr, bandTop(d) - rr])
          pts.push([p.x + nx * rad * k, y, p.z + nz * rad * k]);
    }
    slices.push({ c: [0, 0, 0], s: [0, 0, 0], r: rr, pts });
  }

  const bandDetails: Detail[] = [];
  const rim: V3[] = [];
  const inner: V3[] = [];
  const M = 120;
  for (let i = 0; i <= M; i++) {
    const s = (i / M) * path.total;
    const p = path.at(s);
    const d = Math.abs(i / M - 0.5) * 2;
    const nx = p.tz;
    const nz = -p.tx;
    rim.push([p.x + (nx * BAND.t) / 2, bandTop(d), p.z + (nz * BAND.t) / 2]);
    inner.push([p.x - (nx * BAND.t) / 2, bandTop(d), p.z - (nz * BAND.t) / 2]);
  }
  bandDetails.push({ pts: rim.concat(inner.slice().reverse()), closed: true, needsTop: true });

  // the two arm ends are visible from the front
  for (const sEnd of [0, path.total]) {
    const p = path.at(sEnd);
    const top = bandTop(1) - 2.4; // both arm ends sit at d = 1
    const bot = bandBottom(1) + 2.4;
    const nx = p.tz;
    const hw = BAND.t / 2 - 2.4;
    const cap: V3[] = [];
    const corners: [number, number, number][] = [
      [hw, top, 0],
      [-hw, top, 90],
      [-hw, bot, 180],
      [hw, bot, 270],
    ];
    for (const [ox, oy, a0] of corners) {
      for (let i = 0; i <= 5; i++) {
        const th = (a0 + (90 * i) / 5) * D2R;
        const radial = ox + 2.4 * Math.cos(th);
        const yy = oy + 2.4 * Math.sin(th);
        cap.push([p.x + nx * radial, yy, BAND.zEnd]);
      }
    }
    bandDetails.push({ pts: cap, closed: true, faceNormal: [0, 0, 1] });
  }
  groups.push({ id: "band", layer: 3, prims: slices, details: bandDetails });

  // seat cushion with a seam just below the top edge
  const seat: Prim = { c: [0, 34, 45.5], s: [61, 16, 79], r: 6.5 };
  const ring = roundedRing(0, 45.5, 30.5 - 1.38, 39.5 - 1.38, 6.5 - 1.38);
  groups.push({
    id: "seat",
    layer: 2,
    prims: [seat],
    details: [
      {
        pts: ring.map((q) => [q.x, 39.5, q.z] as V3),
        normals: ring.map((q) => [q.nx * 0.79, 0.62, q.nz * 0.79] as V3),
        closed: true,
      },
    ],
  });

  // rear posts and front legs, one group each so side views order correctly
  for (const sx of [-1, 1]) {
    groups.push({
      id: `post${sx}`,
      layer: 1,
      prims: [{ c: [sx * 33, 30, 9.5], s: [9, 60, 11], r: 2 }],
      details: [],
    });
    groups.push({
      id: `leg${sx}`,
      layer: 4,
      prims: [{ c: [sx * 33, 20, 62], s: [9, 40, 9], r: 2 }],
      details: [],
    });
  }
  return groups;
}

/* ---------- projection ---------- */

function project(p: V3, cam: Cam): [number, number, number] {
  const cy = Math.cos(cam.yaw);
  const sy = Math.sin(cam.yaw);
  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  const xp = p[0] * cy + p[2] * sy;
  const zp = -p[0] * sy + p[2] * cy;
  const up = p[1] * cp - zp * sp;
  return [xp, -up, -(p[1] * sp + zp * cp)]; // screen x, screen y (down), depth (bigger = farther)
}

function camDir(cam: Cam): V3 {
  return [
    -Math.sin(cam.yaw) * Math.cos(cam.pitch),
    Math.sin(cam.pitch),
    Math.cos(cam.yaw) * Math.cos(cam.pitch),
  ];
}

function primPoints(pr: Prim): V3[] {
  if (pr.pts) return pr.pts;
  const h = pr.s.map((v) => Math.max(0.01, v / 2 - pr.r));
  const a = pr.yaw || 0;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const out: V3[] = [];
  for (const kx of [-1, 1])
    for (const ky of [-1, 1])
      for (const kz of [-1, 1]) {
        const x = kx * h[0];
        const y = ky * h[1];
        const z = kz * h[2];
        out.push([pr.c[0] + x * ca + z * sa, pr.c[1] + y, pr.c[2] - x * sa + z * ca]);
      }
  return out;
}

function hull(pts: P2[]): P2[] {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o: P2, a: P2, b: P2) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: P2[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: P2[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  up.pop();
  lo.pop();
  return lo.concat(up);
}

/* ---------- one view ---------- */

type ViewDef = { title: string; yaw: number; pitch: number; scale: number; dims: string };

const VIEWS: ViewDef[] = [
  { title: "FRONT", yaw: 0, pitch: 0, scale: 2.35, dims: "H-left W-below" },
  { title: "SIDE (LEFT)", yaw: 90, pitch: 0, scale: 2.35, dims: "D-above S-right" },
  { title: "REAR", yaw: 180, pitch: 0, scale: 2.35, dims: "W-below" },
  { title: "TOP", yaw: 0, pitch: 90, scale: 2.35, dims: "D-left W-below" },
  { title: "BOTTOM", yaw: 180, pitch: -90, scale: 2.35, dims: "D-left W-below" },
  { title: "SIDE (RIGHT)", yaw: -90, pitch: 0, scale: 2.35, dims: "D-above S-left" },
  { title: "PERSPECTIVE", yaw: 35, pitch: 22, scale: 2.05, dims: "" },
  { title: "PERSPECTIVE (RIGHT)", yaw: -35, pitch: 22, scale: 2.05, dims: "" },
  { title: "PERSPECTIVE (REAR)", yaw: 215, pitch: 22, scale: 2.05, dims: "" },
];

function dimLine(x1: number, y1: number, x2: number, y2: number, label: string): string {
  const horiz = Math.abs(y2 - y1) < 0.01;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const gap = 5.4 * label.length + 7;
  const tick = 4.5;
  let out = "";
  if (horiz) {
    out += `<path d="M${r1(x1)} ${r1(y1)}H${r1(mx - gap / 2)}M${r1(mx + gap / 2)} ${r1(y1)}H${r1(x2)}M${r1(x1)} ${r1(y1 - tick)}V${r1(y1 + tick)}M${r1(x2)} ${r1(y1 - tick)}V${r1(y1 + tick)}" class="cs-dim-line"/>`;
  } else {
    out += `<path d="M${r1(x1)} ${r1(y1)}V${r1(my - 7)}M${r1(x1)} ${r1(my + 7)}V${r1(y2)}M${r1(x1 - tick)} ${r1(y1)}H${r1(x1 + tick)}M${r1(x1 - tick)} ${r1(y2)}H${r1(x1 + tick)}" class="cs-dim-line"/>`;
  }
  out += `<text x="${r1(horiz ? mx : x1)}" y="${r1(horiz ? y1 + 3.4 : my + 3.4)}" text-anchor="middle" class="cs-dim">${label}</text>`;
  return out;
}

function drawView(groups: Group[], v: ViewDef, col: number, row: number): string {
  const cam: Cam = { yaw: v.yaw * D2R, pitch: v.pitch * D2R };
  const dir = camDir(cam);
  const k = v.scale;

  const items = groups.map((g) => {
    const polys: { pts: P2[]; r: number }[] = [];
    let depthSum = 0;
    let depthN = 0;
    for (const pr of g.prims) {
      const pr3 = primPoints(pr).map((p) => project(p, cam));
      pr3.forEach((q) => {
        depthSum += q[2];
        depthN++;
      });
      polys.push({ pts: hull(pr3.map((q) => [q[0] * k, q[1] * k] as P2)), r: pr.r * k });
    }
    return { g, polys, depth: depthSum / depthN };
  });

  // far to near; equal depths fall back to a fixed layer order
  items.sort((a, b) => Math.round(b.depth) - Math.round(a.depth) || a.g.layer - b.g.layer);

  // centre the drawing in its cell
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const it of items)
    for (const p of it.polys)
      for (const q of p.pts) {
        minX = Math.min(minX, q[0] - p.r - LW);
        maxX = Math.max(maxX, q[0] + p.r + LW);
        minY = Math.min(minY, q[1] - p.r - LW);
        maxY = Math.max(maxY, q[1] + p.r + LW);
      }
  const ox = CELL_W / 2 - (minX + maxX) / 2;
  const oy = (v.dims ? 160 : 168) - (minY + maxY) / 2;
  const bx0 = minX + ox;
  const bx1 = maxX + ox;
  const by0 = minY + oy;
  const by1 = maxY + oy;
  const pt = (q: P2) => `${r1(q[0] + ox)},${r1(q[1] + oy)}`;

  let svg = `<g transform="translate(${col * CELL_W} ${row * CELL_H})">`;
  svg += `<text x="${CELL_W / 2}" y="28" text-anchor="middle" class="cs-title">${v.title}</text>`;

  for (const it of items) {
    svg += `<g class="cs-ink">${it.polys.map((p) => `<polygon points="${p.pts.map(pt).join(" ")}" stroke-width="${r1(2 * p.r + 2 * LW)}"/>`).join("")}</g>`;
    svg += `<g class="cs-paper">${it.polys.map((p) => `<polygon points="${p.pts.map(pt).join(" ")}" stroke-width="${r1(2 * p.r)}"/>`).join("")}</g>`;

    for (const dt of it.g.details) {
      const proj = dt.pts.map((p) => {
        const q = project(p, cam);
        return [q[0] * k, q[1] * k] as P2;
      });
      let vis: boolean[];
      if (dt.needsTop) vis = dt.pts.map(() => dir[1] > 0.08);
      else if (dt.faceNormal) {
        const f =
          dt.faceNormal[0] * dir[0] + dt.faceNormal[1] * dir[1] + dt.faceNormal[2] * dir[2] >
          0.12;
        vis = dt.pts.map(() => f);
      } else
        vis = dt.pts.map((_, i) => {
          const n = dt.normals![i];
          return n[0] * dir[0] + n[1] * dir[1] + n[2] * dir[2] > 0.06;
        });
      // split into runs of visible points (rotate closed loops to start on a hidden point)
      let start = 0;
      if (dt.closed && vis.some((b) => !b)) start = vis.findIndex((b) => !b);
      const n = proj.length;
      let run: P2[] = [];
      const flush = () => {
        if (run.length > 1) svg += `<polyline points="${run.map(pt).join(" ")}" class="cs-line"/>`;
        run = [];
      };
      for (let j = 0; j <= n; j++) {
        const idx = (start + j) % n;
        if (j === n && !dt.closed) break;
        if (vis[idx]) run.push(proj[idx]);
        else flush();
      }
      flush();
      // a closed loop that is fully visible needs its closing segment
      if (dt.closed && vis.every(Boolean))
        svg += `<polyline points="${[...proj, proj[0]].map(pt).join(" ")}" class="cs-line"/>`;
    }
  }

  // dimension lines, measured from the drawn extents
  const pad = 16;
  for (const d of v.dims.split(" ").filter(Boolean)) {
    if (d === "W-below")
      svg += dimLine(bx0 + LW, by1 + pad, bx1 - LW, by1 + pad, String(W_CM));
    if (d === "H-left") svg += dimLine(bx0 - pad, by0 + LW, bx0 - pad, by1 - LW, String(H_CM));
    if (d === "D-above") svg += dimLine(bx0 + LW, by0 - pad, bx1 - LW, by0 - pad, String(D_CM));
    if (d === "D-left") svg += dimLine(bx0 - pad, by0 + LW, bx0 - pad, by1 - LW, String(D_CM));
    if (d === "S-right" || d === "S-left") {
      const seatY = by1 - LW - SEAT_CM * k;
      const x = d === "S-right" ? bx1 + pad : bx0 - pad;
      svg += dimLine(x, seatY, x, by1 - LW, String(SEAT_CM));
    }
  }
  svg += "</g>";
  return svg;
}

/** The whole sheet as SVG markup (style block + nine cells). */
function buildSheet(): string {
  const groups = buildChair();
  let out = `<style>
.cs-ink polygon{fill:var(--cs-ink);stroke:var(--cs-ink);stroke-linejoin:round}
.cs-paper polygon{fill:var(--cs-paper);stroke:var(--cs-paper);stroke-linejoin:round}
.cs-line{fill:none;stroke:var(--cs-ink);stroke-width:.9;stroke-linejoin:round;stroke-linecap:round}
.cs-dim-line{fill:none;stroke:var(--cs-ink);stroke-width:.8;opacity:.75}
.cs-dim{fill:var(--cs-ink);font:400 10.5px/1 inherit;font-family:inherit;font-variant-numeric:tabular-nums}
.cs-title{fill:var(--cs-ink);font-family:inherit;font-weight:700;font-size:11.5px;letter-spacing:.09em}
.cs-grid{stroke:var(--cs-grid);stroke-width:1;fill:none}
</style>`;
  VIEWS.forEach((v, i) => {
    out += drawView(groups, v, i % 3, Math.floor(i / 3));
  });
  let gl = "";
  for (let i = 0; i <= 3; i++) {
    gl += `M${i * CELL_W} 0V${SHEET_H}M0 ${i * CELL_H}H${SHEET_W}`;
  }
  out += `<path d="${gl}" class="cs-grid"/>`;
  return out;
}
// ===== ENGINE END =====

/* ------------------------------------------------------------------ */
/* React component                                                     */
/* ------------------------------------------------------------------ */

import type { CSSProperties } from "react";

const MARKUP = buildSheet(); // built once; the sheet is static

export default function ChairSheet({
  ink = "#0a0a0a",
  paper = "#f2f0ee",
  grid = true,
  className = "",
}: {
  ink?: string;
  /** hides lines behind other parts; match your section background */
  paper?: string;
  grid?: boolean;
  className?: string;
}) {
  const vars = {
    "--cs-ink": ink,
    "--cs-paper": paper,
    "--cs-grid": grid ? "rgba(10,10,10,0.18)" : "transparent",
    display: "block",
    width: "100%",
    height: "auto",
  } as CSSProperties;

  return (
    <svg
      viewBox={`0 0 ${SHEET_W} ${SHEET_H}`}
      role="img"
      aria-label="Technical drawing sheet of a barrel armchair: front, side, rear, top, bottom and perspective views, 75 by 85 by 73 centimetres"
      className={className}
      style={vars}
      dangerouslySetInnerHTML={{ __html: MARKUP }}
    />
  );
}
