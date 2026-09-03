#!/usr/bin/env node
/**
 * Profile poster — a rotating sculpture. Nothing else.
 * node generate.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const W = 1100;
const H = 520;
const CX = 550;
const CY = 248;
const FRAMES = 48;

const DARK = {
  file: "dark.svg",
  bg: "#0d1117",
  fg: "#E8E6E1",
  muted: "#6E7681",
  knot: "#F4F1EA",
  cage: "#454C55",
  grain: 0.045,
};

const LIGHT = {
  file: "light.svg",
  bg: "#ffffff",
  fg: "#1B1F24",
  muted: "#8B939C",
  knot: "#1B1F24",
  cage: "#C8CED5",
  grain: 0.03,
};

const fmt = (n) => (Math.round(n * 10) / 10).toFixed(1);

function rot([x, y, z], ax, ay, az) {
  const cx = Math.cos(ax), sx = Math.sin(ax);
  let y1 = y * cx - z * sx;
  let z1 = y * sx + z * cx;
  y = y1;
  z = z1;
  const cy = Math.cos(ay), sy = Math.sin(ay);
  let x1 = x * cy + z * sy;
  let z2 = -x * sy + z * cy;
  x = x1;
  z = z2;
  const cz = Math.cos(az), sz = Math.sin(az);
  x1 = x * cz - y * sz;
  y1 = x * sz + y * cz;
  return [x1, y1, z];
}

function project([x, y, z], scale) {
  const dist = 5.2;
  const w = dist / (dist + z);
  return [CX + x * scale * w, CY - y * scale * w, z];
}

function trefoil(t) {
  return [
    Math.sin(t) + 2 * Math.sin(2 * t),
    Math.cos(t) - 2 * Math.cos(2 * t),
    -Math.sin(3 * t),
  ];
}

function icosahedron() {
  const p = (1 + Math.sqrt(5)) / 2;
  const raw = [
    [-1, p, 0], [1, p, 0], [-1, -p, 0], [1, -p, 0],
    [0, -1, p], [0, 1, p], [0, -1, -p], [0, 1, -p],
    [p, 0, -1], [p, 0, 1], [-p, 0, -1], [-p, 0, 1],
  ];
  const verts = raw.map((v) => {
    const n = Math.hypot(...v);
    return v.map((c) => c / n);
  });
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const edgeSet = new Set();
  for (const [a, b, c] of faces) {
    for (const [i, j] of [[a, b], [b, c], [c, a]]) {
      edgeSet.add(i < j ? `${i}-${j}` : `${j}-${i}`);
    }
  }
  const edges = [...edgeSet].map((s) => s.split("-").map(Number));
  return { verts, edges };
}

function anim(attr, values, dur) {
  return `<animate attributeName="${attr}" values="${values}" dur="${dur}" repeatCount="indefinite" calcMode="linear"/>`;
}

function series(frames, pick) {
  return frames.map(pick).join(";");
}

function buildLines(segments, color, width, dur) {
  return segments
    .map((seg) => {
      const x1 = series(seg, (s) => s.x1);
      const y1 = series(seg, (s) => s.y1);
      const x2 = series(seg, (s) => s.x2);
      const y2 = series(seg, (s) => s.y2);
      const op = series(seg, (s) => s.o);
      return `<line x1="${seg[0].x1}" y1="${seg[0].y1}" x2="${seg[0].x2}" y2="${seg[0].y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round">${anim("x1", x1, dur)}${anim("y1", y1, dur)}${anim("x2", x2, dur)}${anim("y2", y2, dur)}${anim("stroke-opacity", op, dur)}</line>`;
    })
    .join("");
}

function buildDots(tracks, color, r, dur) {
  return tracks
    .map((tr) => {
      const cx = series(tr, (s) => s.cx);
      const cy = series(tr, (s) => s.cy);
      const op = series(tr, (s) => s.o);
      return `<circle cx="${tr[0].cx}" cy="${tr[0].cy}" r="${r}" fill="${color}">${anim("cx", cx, dur)}${anim("cy", cy, dur)}${anim("fill-opacity", op, dur)}</circle>`;
    })
    .join("");
}

function precompute() {
  const ico = icosahedron();
  const knotCount = 90;
  const knotFrames = [];
  const icoFrames = [];

  for (let f = 0; f < FRAMES; f++) {
    const u = f / FRAMES;
    const knotPts = [];
    for (let i = 0; i < knotCount; i++) {
      const t = (i / knotCount) * Math.PI * 2;
      const p = rot(trefoil(t), 1.12, u * Math.PI * 2 + 0.7, 0.35);
      knotPts.push(project(p, 72));
    }
    knotFrames.push(knotPts);

    const icoPts = ico.verts.map((v) => {
      const p = rot(v, 0.55, -u * Math.PI * 2 * 0.65 + 0.4, 0.2);
      return project(p, 198);
    });
    icoFrames.push(icoPts);
  }

  const knotSegs = [];
  for (let i = 0; i < knotCount; i++) {
    const j = (i + 1) % knotCount;
    knotSegs.push(
      knotFrames.map((pts) => {
        const a = pts[i];
        const b = pts[j];
        const z = (a[2] + b[2]) / 2;
        const o = (0.28 + (1 - (z + 3.4) / 6.8) * 0.72).toFixed(2);
        return { x1: fmt(a[0]), y1: fmt(a[1]), x2: fmt(b[0]), y2: fmt(b[1]), o };
      })
    );
  }

  const icoSegs = ico.edges.map(([i, j]) =>
    icoFrames.map((pts) => {
      const a = pts[i];
      const b = pts[j];
      const z = (a[2] + b[2]) / 2;
      const o = (0.14 + (1 - (z + 1.5) / 3.0) * 0.5).toFixed(2);
      return { x1: fmt(a[0]), y1: fmt(a[1]), x2: fmt(b[0]), y2: fmt(b[1]), o };
    })
  );

  const icoDots = ico.verts.map((_, i) =>
    icoFrames.map((pts) => {
      const p = pts[i];
      const o = (0.2 + (1 - (p[2] + 1.5) / 3.0) * 0.7).toFixed(2);
      return { cx: fmt(p[0]), cy: fmt(p[1]), o };
    })
  );

  return { knotSegs, icoSegs, icoDots };
}

function build(theme, geo) {
  const tick = (ax, ay, bx, by, cx, cy) =>
    `<path d="M${bx} ${ay}H${ax}V${by}M${ax} ${ay}H${cx}" fill="none" stroke="${theme.muted}" stroke-width="1" opacity="0.55"/>`;

  const corners = [
    tick(22, 22, 22, 42, 42, 22),
    tick(W - 22, 22, W - 22, 42, W - 42, 22),
    tick(22, H - 22, 22, H - 42, 42, H - 22),
    tick(W - 22, H - 22, W - 22, H - 42, W - 42, H - 22),
  ].join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Aneesh Krishna">
  <defs>
    <radialGradient id="glow" cx="50%" cy="46%" r="38%">
      <stop offset="0%" stop-color="${theme.fg}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="${theme.grain}"/>
      </feComponentTransfer>
    </filter>
    <style>
      .sig {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.28em;
        fill: ${theme.muted};
      }
    </style>
  </defs>
  <rect width="${W}" height="${H}" fill="${theme.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)"/>
  ${corners}
  <g fill="none">
    ${buildLines(geo.icoSegs, theme.cage, 1.05, "38s")}
    ${buildLines(geo.knotSegs, theme.knot, 1.7, "22s")}
  </g>
  ${buildDots(geo.icoDots, theme.fg, 2.1, "38s")}
  <text class="sig" x="${W / 2}" y="${H - 28}" text-anchor="middle">ANEESH KRISHNA</text>
</svg>
`;
}

const geo = precompute();
for (const theme of [DARK, LIGHT]) {
  fs.writeFileSync(path.join(__dirname, theme.file), build(theme, geo));
  console.log(`wrote ${theme.file}`);
}
