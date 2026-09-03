#!/usr/bin/env node
/**
 * Profile lockup. Three rings, one orbit, a name.
 * node generate.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const W = 1100;
const H = 400;
const GX = 820;
const GY = 200;

const DARK = {
  file: "dark.svg",
  bg: "#0d1117",
  fg: "#E8E6E1",
  muted: "#8B949E",
  ring: "#C9C4BA",
  ringDim: "#3D444D",
};

const LIGHT = {
  file: "light.svg",
  bg: "#ffffff",
  fg: "#1F2328",
  muted: "#656D76",
  ring: "#1F2328",
  ringDim: "#D0D7DE",
};

function ring(tilt, dur, stroke, width) {
  return `<g transform="rotate(${tilt})">
      <g>
        <ellipse cx="0" cy="0" rx="148" ry="52" fill="none" stroke="${stroke}" stroke-width="${width}"/>
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${dur}" repeatCount="indefinite"/>
      </g>
    </g>`;
}

function build(theme) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Aneesh Krishna">
  <style>
    .name {
      font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif;
      font-size: 58px;
      font-weight: 400;
      fill: ${theme.fg};
    }
    .loc {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.32em;
      fill: ${theme.muted};
    }
  </style>
  <rect width="${W}" height="${H}" fill="${theme.bg}"/>
  <text class="loc" x="56" y="86">NEW YORK</text>
  <text class="name" x="56" y="200">Aneesh</text>
  <text class="name" x="56" y="268">Krishna</text>
  <g transform="translate(${GX} ${GY})" fill="none">
    <circle cx="0" cy="0" r="6" fill="${theme.fg}"/>
    ${ring(0, "26s", theme.ring, 1.35)}
    ${ring(60, "34s", theme.ringDim, 1.1)}
    ${ring(120, "21s", theme.ring, 1.2)}
    <g>
      <circle cx="148" cy="0" r="4" fill="${theme.fg}"/>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="26s" repeatCount="indefinite"/>
    </g>
  </g>
</svg>
`;
}

for (const theme of [DARK, LIGHT]) {
  fs.writeFileSync(path.join(__dirname, theme.file), build(theme));
  console.log(`wrote ${theme.file}`);
}
