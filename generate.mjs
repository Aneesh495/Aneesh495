#!/usr/bin/env node
/**
 * Profile poster. Clifford attractor, static. No animation.
 * node generate.mjs
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const W = 2200;
const H = 840;
const N = 3_200_000;

const A = -1.4;
const B = 1.6;
const C = 1.0;
const D = 0.7;

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return png;
}

function attractor() {
  const xs = new Float32Array(N);
  const ys = new Float32Array(N);
  let x = 0.1;
  let y = 0.1;
  let xmin = Infinity;
  let xmax = -Infinity;
  let ymin = Infinity;
  let ymax = -Infinity;
  for (let i = 0; i < N; i++) {
    const nx = Math.sin(A * y) + C * Math.cos(A * x);
    const ny = Math.sin(B * x) + D * Math.cos(B * y);
    x = nx;
    y = ny;
    xs[i] = x;
    ys[i] = y;
    if (x < xmin) xmin = x;
    if (x > xmax) xmax = x;
    if (y < ymin) ymin = y;
    if (y > ymax) ymax = y;
  }
  const pad = 0.08;
  const bw = xmax - xmin || 1;
  const bh = ymax - ymin || 1;
  xmin -= bw * pad;
  xmax += bw * pad;
  ymin -= bh * pad;
  ymax += bh * pad;
  return { xs, ys, xmin, xmax, ymin, ymax };
}

function raster({ xs, ys, xmin, xmax, ymin, ymax }) {
  const hist = new Float64Array(W * H);
  const sx = (W - 1) / (xmax - xmin);
  const sy = (H - 1) / (ymax - ymin);
  for (let i = 0; i < N; i++) {
    const px = (xs[i] - xmin) * sx;
    const py = (ys[i] - ymin) * sy;
    const x0 = px | 0;
    const y0 = py | 0;
    if (x0 < 0 || y0 < 0 || x0 >= W - 1 || y0 >= H - 1) continue;
    const fx = px - x0;
    const fy = py - y0;
    const i0 = y0 * W + x0;
    hist[i0] += (1 - fx) * (1 - fy);
    hist[i0 + 1] += fx * (1 - fy);
    hist[i0 + W] += (1 - fx) * fy;
    hist[i0 + W + 1] += fx * fy;
  }
  let max = 0;
  for (let i = 0; i < hist.length; i++) if (hist[i] > max) max = hist[i];
  const logMax = Math.log(1 + max);
  return { hist, logMax };
}

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function paint(hist, logMax, bgHex, fgHex) {
  const bg = hexToRgb(bgHex);
  const fg = hexToRgb(fgHex);
  const rgba = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const t = Math.pow(Math.log(1 + hist[i]) / logMax, 0.72);
    const y = (i / W) | 0;
    const x = i % W;
    const vx = (x / (W - 1)) * 2 - 1;
    const vy = (y / (H - 1)) * 2 - 1;
    const vig = 1 - Math.pow(Math.min(1, Math.hypot(vx * 0.7, vy * 1.05)), 2) * 0.22;
    const k = t * vig;
    const o = i * 4;
    rgba[o] = bg[0] + (fg[0] - bg[0]) * k;
    rgba[o + 1] = bg[1] + (fg[1] - bg[1]) * k;
    rgba[o + 2] = bg[2] + (fg[2] - bg[2]) * k;
    rgba[o + 3] = 255;
  }
  return rgba;
}

console.log("sampling");
const pts = attractor();
console.log("raster");
const { hist, logMax } = raster(pts);

const dark = encodePNG(W, H, paint(hist, logMax, "#07080a", "#efece4"));
const light = encodePNG(W, H, paint(hist, logMax, "#f6f4ef", "#161513"));

fs.writeFileSync(path.join(__dirname, "dark.png"), dark);
fs.writeFileSync(path.join(__dirname, "light.png"), light);
console.log(`wrote dark.png (${(dark.length / 1024).toFixed(0)}kb) light.png (${(light.length / 1024).toFixed(0)}kb)`);
