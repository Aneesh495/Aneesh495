#!/usr/bin/env node
/**
 * Profile lockup — Instrument Serif wordmark, transparent.
 * node generate.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const font = fs.readFileSync(path.join(__dirname, "assets/InstrumentSerif-Regular.ttf")).toString("base64");

const W = 1100;
const H = 460;

const DARK = { file: "dark.svg", fg: "#E6EDF3", muted: "#8B949E" };
const LIGHT = { file: "light.svg", fg: "#1F2328", muted: "#656D76" };

function build(theme) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Aneesh Krishna">
  <defs>
    <style>
      @font-face {
        font-family: "Instrument Serif";
        src: url("data:font/ttf;charset=utf-8;base64,${font}") format("truetype");
        font-weight: 400;
        font-style: normal;
      }
      .name {
        font-family: "Instrument Serif", "Iowan Old Style", Palatino, Georgia, serif;
        font-size: 268px;
        font-weight: 400;
        fill: ${theme.fg};
      }
      .name-line {
        font-family: "Instrument Serif", "Iowan Old Style", Palatino, Georgia, serif;
        font-size: 268px;
        font-weight: 400;
        fill: none;
        stroke: ${theme.fg};
        stroke-width: 1.5;
      }
    </style>
  </defs>
  <text class="name" x="-8" y="214">Aneesh</text>
  <text class="name-line" x="-8" y="428">Krishna</text>
</svg>
`;
}

for (const theme of [DARK, LIGHT]) {
  fs.writeFileSync(path.join(__dirname, theme.file), build(theme));
  console.log(`wrote ${theme.file}`);
}
