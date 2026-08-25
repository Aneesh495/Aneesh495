#!/usr/bin/env node
/**
 * Aneesh495 profile README generator.
 * Builds dark.svg + light.svg (terminal personnel file) and github-jet.svg
 * (arcade contribution grid with a live interceptor sweep).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const USERNAME = process.env.GH_USERNAME || "Aneesh495";
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
/** Inclusive day-counter origin. Regenerated daily by GitHub Actions. */
const STREAK_ORIGIN = "2019-06-20";
const STREAK_TZ = "America/New_York";

const PROFILE = {
  prompt: "aneesh@krishna ~ $ ./profile.sh --live",
  handle: "aneesh@krishna",
  subject: "Aneesh Krishna",
  role: "Systems Developer · Full Stack + ML",
  education: "BS Computer Science @ Purdue",
  status: "Building · Shipping · Scaling",
  signal: "Amazon SysDev · Handshake RLHF",
  signal2: "Caterpillar ML · Founding Engineer",
  lang: "Python, TypeScript, C/C++, Rust, Java",
  systems: "AArch64 NEON · CPU rasterizers",
  frontend: "React, Next.js, Tailwind, Vite",
  backend: "Node.js, FastAPI, Spring Boot",
  ml: "PyTorch, RLHF, LLM pipelines",
  infra: "AWS, Azure, GCP, Docker, Kubernetes",
  linkedin: "linkedin.com/in/aneesh495",
  github: "github.com/Aneesh495",
  email: "aneeshkrishnaparthasarathy@gmail.com",
  portfolio: "tinyurl.com/aneesh495",
};

const DARK = {
  name: "dark",
  bg0: "#070B14",
  bg1: "#0B1220",
  panel: "#0B1120",
  titlebar: "#0B1120",
  key: "#5EEAD4",
  value: "#F8FAFC",
  head: "#F5C542",
  accent: "#C4B5FD",
  dim: "#1E3A4C",
  term: "#A5F3FC",
  scan: "#F87171",
  hire: "#F5C542",
  border0: "#A78BFA",
  border1: "#22D3EE",
  border2: "#F5C542",
  ascii: "#67E8F9",
  ascii2: "#22D3EE",
  scanline: "#7DD3FC",
  cursor: "#F5C542",
  overlay: "#22D3EE",
  photoGlow: "#38BDF8",
};

const LIGHT = {
  name: "light",
  bg0: "#F4F7FB",
  bg1: "#E8EEF7",
  panel: "#FFFFFF",
  titlebar: "#EEF2FF",
  key: "#0F766E",
  value: "#0F172A",
  head: "#B45309",
  accent: "#6D28D9",
  dim: "#CBD5E1",
  term: "#155E75",
  scan: "#B91C1C",
  hire: "#B45309",
  border0: "#7C3AED",
  border1: "#0891B2",
  border2: "#D97706",
  ascii: "#0E7490",
  ascii2: "#1D4ED8",
  scanline: "#0F172A",
  cursor: "#B45309",
  overlay: "#0284C7",
  photoGlow: "#0284C7",
};

const JET = {
  bgStart: "#080C16",
  bgEnd: "#03060F",
  gold: "#FACC15",
  cyan: "#38BDF8",
  rose: "#FB7185",
  empty: "#0F172A",
  emptyStroke: "#1E293B",
  palette: ["#0F172A", "#155E4A", "#0F766E", "#14B8A6", "#5EEAD4"],
};

const COLS = 53;
const ROWS = 7;
const CELL = 13;
const GAP = 4;
const STEP = CELL + GAP;
const WIDTH = 1180;
const HEIGHT = 358;
const GRID_X = 128;
const GRID_Y = 102;
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function civilToday(timeZone = STREAK_TZ) {
  const stamp = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = stamp.split("-").map(Number);
  return { y, m, d, stamp };
}

function daysInclusive(from, to) {
  const a = Date.UTC(from.y, from.m - 1, from.d);
  const b = Date.UTC(to.y, to.m - 1, to.d);
  return Math.floor((b - a) / 86400000) + 1;
}

function originStreak() {
  const [oy, om, od] = STREAK_ORIGIN.split("-").map(Number);
  const origin = { y: oy, m: om, d: od };
  const today = civilToday();
  const total = Math.max(1, daysInclusive(origin, today));
  let years = 0;
  while (
    Date.UTC(oy + years + 1, om - 1, od) <= Date.UTC(today.y, today.m - 1, today.d)
  ) {
    years += 1;
  }
  const extra = daysInclusive({ y: oy + years, m: om, d: od }, today) - 1;
  return { total, years, extra, origin: STREAK_ORIGIN, today: today.stamp };
}

function kvLine(y, key, value, valueClass = "value") {
  return `<tspan x="528" y="${y}" class="key">${esc(key)}</tspan><tspan x="636" y="${y}" class="cc">:</tspan><tspan x="652" y="${y}" class="${valueClass}">${esc(value)}</tspan>`;
}

function continuation(y, value) {
  return `<tspan x="652" y="${y}" class="value">${esc(value)}</tspan>`;
}

function portraitDataUri() {
  const p = path.join(__dirname, "assets", "portrait.jpg");
  const b64 = fs.readFileSync(p).toString("base64");
  return `data:image/jpeg;base64,${b64}`;
}

function buildProfile(theme, stats) {
  const rows = [];
  let y = 40;
  const lh = 19.8;

  const push = (html) => {
    rows.push({ y: Number(y.toFixed(1)), html });
    y += lh;
  };

  const streakLabel = `${stats.streak.toLocaleString("en-US")} days`;
  const uptimeLabel = `${stats.streakYears}y ${stats.streakExtra}d`;

  push(`<tspan x="528" y="${y.toFixed(1)}" class="head">${esc(PROFILE.handle)}</tspan>`);
  push(kvLine(y.toFixed(1), "Subject", PROFILE.subject));
  push(kvLine(y.toFixed(1), "Role", PROFILE.role));
  push(kvLine(y.toFixed(1), "Education", PROFILE.education));
  push(kvLine(y.toFixed(1), "Status", PROFILE.status));
  push(`<tspan x="528" y="${y.toFixed(1)}" class="cc"> </tspan>`);
  push(kvLine(y.toFixed(1), "Signal", PROFILE.signal));
  push(continuation(y.toFixed(1), PROFILE.signal2));
  push(kvLine(y.toFixed(1), "Core.Lang", PROFILE.lang));
  push(kvLine(y.toFixed(1), "Core.Systems", PROFILE.systems));
  push(kvLine(y.toFixed(1), "Core.Frontend", PROFILE.frontend));
  push(kvLine(y.toFixed(1), "Core.Backend", PROFILE.backend));
  push(kvLine(y.toFixed(1), "Core.ML", PROFILE.ml));
  push(kvLine(y.toFixed(1), "Core.Infra", PROFILE.infra));
  push(`<tspan x="528" y="${y.toFixed(1)}" class="cc"> </tspan>`);
  push(`<tspan x="528" y="${y.toFixed(1)}" class="accent">- Contact</tspan>`);
  push(kvLine(y.toFixed(1), "Portfolio", PROFILE.portfolio));
  push(kvLine(y.toFixed(1), "LinkedIn", PROFILE.linkedin));
  push(kvLine(y.toFixed(1), "GitHub", PROFILE.github));
  push(kvLine(y.toFixed(1), "Email", PROFILE.email));
  push(`<tspan x="528" y="${y.toFixed(1)}" class="cc"> </tspan>`);
  push(`<tspan x="528" y="${y.toFixed(1)}" class="accent">- Live Stats</tspan>`);
  push(kvLine(y.toFixed(1), "Streak", streakLabel, "streak"));
  push(kvLine(y.toFixed(1), "Uptime", uptimeLabel, "streak"));
  push(kvLine(y.toFixed(1), "Contribs", `${stats.total.toLocaleString("en-US")} last 12 months`));

  const info = rows.map((r) => `<text x="520" y="0">${r.html}</text>`).join("\n  ");
  const photo = portraitDataUri();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1180" height="586" viewBox="0 0 1180 586" role="img" aria-label="Aneesh Krishna GitHub profile">
<defs>
  <linearGradient id="asciiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="${theme.ascii}">
      <animate attributeName="stop-color" values="${theme.ascii};${theme.ascii2};${theme.accent};${theme.ascii}" dur="8s" repeatCount="indefinite"/>
    </stop>
    <stop offset="100%" stop-color="${theme.ascii2}">
      <animate attributeName="stop-color" values="${theme.ascii2};${theme.accent};${theme.ascii};${theme.ascii2}" dur="8s" repeatCount="indefinite"/>
    </stop>
  </linearGradient>
  <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="${theme.border0}"/>
    <stop offset="50%" stop-color="${theme.border1}"/>
    <stop offset="100%" stop-color="${theme.border2}"/>
  </linearGradient>
  <radialGradient id="bgGlow" cx="28%" cy="18%" r="80%">
    <stop offset="0%" stop-color="${theme.bg1}"/>
    <stop offset="100%" stop-color="${theme.bg0}"/>
  </radialGradient>
  <linearGradient id="scanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="${theme.border1}" stop-opacity="0"/>
    <stop offset="45%" stop-color="${theme.border1}" stop-opacity="0.05"/>
    <stop offset="50%" stop-color="${theme.head}" stop-opacity="0.45"/>
    <stop offset="55%" stop-color="${theme.border1}" stop-opacity="0.05"/>
    <stop offset="100%" stop-color="${theme.border0}" stop-opacity="0"/>
  </linearGradient>
  <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
    <rect width="4" height="1" fill="${theme.scanline}" opacity="0.06"/>
  </pattern>
  <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="3.5" result="blur"/>
    <feMerge>
      <feMergeNode in="blur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
  <clipPath id="portraitClip">
    <rect x="40" y="48" width="436" height="436" rx="12"/>
  </clipPath>
  <linearGradient id="photoVeil" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${theme.overlay}" stop-opacity="0.03"/>
    <stop offset="78%" stop-color="${theme.overlay}" stop-opacity="0"/>
    <stop offset="100%" stop-color="${theme.bg0}" stop-opacity="0.18"/>
  </linearGradient>
  <style>
    .key    { font-family: 'Courier New', Consolas, monospace; font-size: 14px; fill: ${theme.key}; font-weight: bold; }
    .value  { font-family: 'Courier New', Consolas, monospace; font-size: 14px; fill: ${theme.value}; font-weight: 500; }
    .cc     { font-family: 'Courier New', Consolas, monospace; font-size: 14px; fill: ${theme.dim}; }
    .head   { font-family: 'Courier New', Consolas, monospace; font-size: 16px; fill: ${theme.head}; font-weight: bold; }
    .accent { font-family: 'Courier New', Consolas, monospace; font-size: 14px; fill: ${theme.accent}; font-weight: bold; }
    .streak { font-family: 'Courier New', Consolas, monospace; font-size: 14px; fill: ${theme.head}; font-weight: bold; }
    text, tspan { white-space: pre; }
    .term-label { font-family: 'Courier New', Consolas, monospace; font-size: 12px; fill: ${theme.term}; letter-spacing: 0.5px; opacity: 0.9; }
    .scan-label { font-family: 'Courier New', Consolas, monospace; font-size: 10px; fill: ${theme.hire}; letter-spacing: 1.4px; font-weight: bold; }
    .panel-title-blue { font-family: 'Courier New', Consolas, monospace; font-size: 11px; fill: ${theme.ascii}; letter-spacing: 2px; opacity: 0.9; }
    .panel-title { font-family: 'Courier New', Consolas, monospace; font-size: 11px; fill: ${theme.head}; letter-spacing: 2px; opacity: 0.9; }
    .hud-meta { font-family: 'Courier New', Consolas, monospace; font-size: 11px; fill: ${theme.term}; letter-spacing: 1.2px; }
    .hud-tiny { font-family: 'Courier New', Consolas, monospace; font-size: 10px; fill: ${theme.value}; letter-spacing: 1.6px; opacity: 0.85; }
    .cursor-blink { fill: ${theme.cursor}; }
  </style>
</defs>

<rect width="1180" height="586" rx="18" fill="url(#bgGlow)"/>
<rect width="1180" height="586" rx="18" fill="url(#scanlines)"/>

<g id="titlebar">
  <rect x="3" y="3" width="1174" height="34" rx="16" fill="${theme.titlebar}" fill-opacity="0.88"/>
  <circle cx="24" cy="20" r="5" fill="#EF4444"><animate attributeName="opacity" values="1;0.55;1" dur="4s" repeatCount="indefinite"/></circle>
  <circle cx="42" cy="20" r="5" fill="#F59E0B"><animate attributeName="opacity" values="1;0.55;1" dur="4s" begin="0.3s" repeatCount="indefinite"/></circle>
  <circle cx="60" cy="20" r="5" fill="#10B981"><animate attributeName="opacity" values="1;0.55;1" dur="4s" begin="0.6s" repeatCount="indefinite"/></circle>
  <text x="590" y="25" text-anchor="middle" class="term-label">${esc(PROFILE.prompt)}</text>
  <circle cx="1056" cy="20" r="4" fill="${theme.hire}">
    <animate attributeName="opacity" values="1;0.18;1" dur="1.15s" repeatCount="indefinite"/>
  </circle>
  <text x="1066" y="24" class="scan-label">HIREABLE</text>
</g>

<g transform="translate(0,44)">
  <rect x="14" y="18" width="488" height="500" rx="14" fill="${theme.panel}" fill-opacity="0.38" stroke="url(#borderGrad)" stroke-width="1" opacity="0.55"/>
  <rect x="508" y="8" width="658" height="518" rx="14" fill="${theme.panel}" fill-opacity="0.38" stroke="url(#borderGrad)" stroke-width="1" opacity="0.55"/>
  <text x="30" y="14" class="panel-title-blue">VISUAL.MAP // BIOMETRIC</text>
  <text x="524" y="6" class="panel-title">SYSTEM.INFO</text>

  <image x="52" y="60" width="412" height="412" href="${photo}" xlink:href="${photo}" preserveAspectRatio="xMidYMid meet" clip-path="url(#portraitClip)"/>
  <rect x="40" y="48" width="436" height="22" fill="${theme.bg0}" opacity="0.42"/>
  <text x="52" y="63" class="hud-tiny">CAM.01  ·  LOCK  ·  0xA495</text>
  <rect x="40" y="462" width="436" height="22" fill="${theme.bg0}" opacity="0.48"/>
  <text x="52" y="477" class="hud-tiny">ANEESH KRISHNA  ·  SYS.DEV  ·  PURDUE</text>

  <g fill="none" stroke="${theme.photoGlow}" stroke-width="1.6" filter="url(#softGlow)">
    <path d="M40 76 V48 H68"/>
    <path d="M448 48 H476 V76"/>
    <path d="M40 456 V484 H68"/>
    <path d="M448 484 H476 V456"/>
  </g>

  <text x="40" y="508" class="hud-meta">ID.LOCK CONFIRMED  ·  AMAZON  ·  HANDSHAKE  ·  CATERPILLAR</text>

  ${info}

  <rect x="522" y="${(rows[rows.length - 1].y + 6).toFixed(1)}" width="9" height="16" class="cursor-blink" opacity="0">
    <animate attributeName="opacity" values="0;1;0;1;0;1;0" dur="1.4s" begin="0.4s" repeatCount="indefinite"/>
  </rect>
</g>

<rect x="0" y="-70" width="1180" height="70" fill="url(#scanGrad)" opacity="0.55">
  <animateTransform attributeName="transform" type="translate" from="0 -70" to="0 640" dur="5.4s" repeatCount="indefinite"/>
</rect>

<rect x="3" y="3" width="1174" height="580" rx="16" fill="none" stroke="url(#borderGrad)" stroke-width="2" opacity="0.85">
  <animate attributeName="opacity" values="0.45;0.95;0.45" dur="3.4s" repeatCount="indefinite"/>
</rect>
</svg>
`;
}

function colorForCount(count, max) {
  if (!count) return JET.palette[0];
  const t = Math.min(1, Math.log2(count + 1) / Math.log2((max || 1) + 1));
  if (t < 0.28) return JET.palette[1];
  if (t < 0.5) return JET.palette[2];
  if (t < 0.72) return JET.palette[3];
  return JET.palette[4];
}

function buildCells(weeks) {
  const recent = weeks.slice(-COLS);
  const pad = COLS - recent.length;
  const padded = Array.from({ length: Math.max(0, pad) }, () => ({
    contributionDays: Array.from({ length: ROWS }, () => ({ contributionCount: 0, date: null })),
  })).concat(recent);

  const max = Math.max(
    1,
    ...padded.flatMap((w) => (w.contributionDays || []).map((d) => Number(d.contributionCount) || 0))
  );

  const cells = [];
  padded.forEach((week, col) => {
    const days = week.contributionDays || [];
    for (let row = 0; row < ROWS; row++) {
      const day = days[row] || { contributionCount: 0, date: null };
      const count = Number(day.contributionCount) || 0;
      cells.push({
        col,
        row,
        x: GRID_X + col * STEP,
        y: GRID_Y + row * STEP,
        count,
        date: day.date || "",
        color: colorForCount(count, max),
      });
    }
  });
  return cells;
}

function computeStats(weeks) {
  let total = 0;
  let active = 0;
  let maxDay = 0;
  for (const week of weeks) {
    for (const day of week.contributionDays || []) {
      const c = Number(day.contributionCount) || 0;
      total += c;
      if (c > 0) active += 1;
      if (c > maxDay) maxDay = c;
    }
  }
  const live = originStreak();
  return {
    total,
    active,
    maxDay,
    streak: live.total,
    streakYears: live.years,
    streakExtra: live.extra,
    streakOrigin: live.origin,
  };
}

function selectTargets(cells) {
  const byCol = new Map();
  for (const c of cells) {
    if (c.count <= 0) continue;
    const prev = byCol.get(c.col);
    if (!prev || prev.count < c.count) byCol.set(c.col, c);
  }
  const candidates = [...byCol.values()].sort((a, b) => b.count - a.count || a.col - b.col);
  const picked = [];
  for (const cand of candidates) {
    if (picked.length >= 8) break;
    if (picked.some((p) => Math.abs(p.col - cand.col) < 4)) continue;
    picked.push(cand);
  }
  return picked.sort((a, b) => a.col - b.col);
}

function buildMonthLabels(cells) {
  let last = -1;
  let lastCol = -8;
  const labels = [];
  for (let col = 0; col < COLS; col++) {
    const hit = cells.find((c) => c.col === col && c.date);
    if (!hit) continue;
    const d = new Date(hit.date);
    if (Number.isNaN(d.getTime())) continue;
    const m = d.getUTCMonth();
    if (m !== last && col - lastCol >= 3) {
      labels.push({ col, label: MONTHS[m] });
      lastCol = col;
      last = m;
    }
  }
  return labels
    .map(
      ({ col, label }) =>
        `<text x="${GRID_X + col * STEP}" y="${GRID_Y - 14}" class="axis-label">${label}</text>`
    )
    .join("\n");
}

function buildDayLabels() {
  return [
    { label: "MON", row: 1 },
    { label: "WED", row: 3 },
    { label: "FRI", row: 5 },
  ]
    .map(
      ({ label, row }) =>
        `<text x="${GRID_X - 14}" y="${GRID_Y + row * STEP + 10}" text-anchor="end" class="axis-label">${label}</text>`
    )
    .join("\n");
}

function buildGrid(cells, targets) {
  const targetKeys = new Set(targets.map((t) => `${t.col},${t.row}`));
  return cells
    .map((c) => {
      const isEmpty = c.color === JET.palette[0];
      const stroke = isEmpty
        ? `stroke="${JET.emptyStroke}" stroke-width="0.75"`
        : `stroke="#5EEAD4" stroke-width="0.3"`;
      const title = `${c.count} on ${c.date || "untracked"}`;
      if (targetKeys.has(`${c.col},${c.row}`)) {
        return `<rect x="${c.x}" y="${c.y}" width="${CELL}" height="${CELL}" rx="2.5" fill="${c.color}" ${stroke}><title>${esc(title)}</title>
          <animate attributeName="fill" values="${c.color};#FFFFFF;${JET.cyan};${c.color}" dur="16s" repeatCount="indefinite" keyTimes="0;0.08;0.12;1"/></rect>`;
      }
      return `<rect x="${c.x}" y="${c.y}" width="${CELL}" height="${CELL}" rx="2.5" fill="${c.color}" ${stroke}><title>${esc(title)}</title></rect>`;
    })
    .join("\n");
}

function buildShieldBar(pct = 100) {
  const blocks = 10;
  const filled = Math.round((pct / 100) * blocks);
  let svg = "";
  for (let i = 0; i < blocks; i++) {
    svg += `<rect x="${i * 10}" y="0" width="8" height="10" rx="1.5" fill="${i < filled ? "#22D3EE" : "#0F172A"}" opacity="${i < filled ? 0.95 : 0.3}"/>`;
  }
  return svg;
}

function buildInterceptor() {
  const start = GRID_X - 10;
  const end = GRID_X + (COLS - 1) * STEP + 8;
  const y = GRID_Y + ROWS * STEP + 28;
  return `
  <g transform="translate(0 ${y})">
    <g>
      <animateTransform attributeName="transform" type="translate" values="${start} 0; ${end} 0; ${start} 0" dur="16s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" keyTimes="0;0.5;1"/>
      <!-- reticle -->
      <g fill="none" stroke="#FACC15" stroke-width="1.15" opacity="0.9">
        <circle r="16" cx="0" cy="-92">
          <animate attributeName="r" values="14;17;14" dur="1.6s" repeatCount="indefinite"/>
        </circle>
        <circle r="7" cx="0" cy="-92" stroke="#22D3EE"/>
        <path d="M0 -110 V-102 M0 -82 V-74 M-18 -92 H-10 M10 -92 H18"/>
      </g>
      <line x1="0" y1="-8" x2="0" y2="-74" stroke="#22D3EE" stroke-width="1" stroke-dasharray="3 4" opacity="0.7">
        <animate attributeName="opacity" values="0.25;0.9;0.25" dur="0.9s" repeatCount="indefinite"/>
      </line>
      <!-- thruster -->
      <ellipse cx="-30" cy="0" rx="16" ry="4.5" fill="#22D3EE" opacity="0.55">
        <animate attributeName="rx" values="12;20;12" dur="0.28s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.35;0.8;0.35" dur="0.28s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="-24" cy="0" rx="8" ry="2.4" fill="#F8FAFC" opacity="0.85"/>
      <!-- wings -->
      <polygon points="-6,0 -16,-15 -8,-16 10,-3 12,0" fill="#64748B"/>
      <polygon points="-6,0 -16,15 -8,16 10,3 12,0" fill="#475569"/>
      <polygon points="-8,-15 -18,-22 -10,-16 -4,-4" fill="#F5C542"/>
      <polygon points="-8,15 -18,22 -10,16 -4,4" fill="#F5C542"/>
      <!-- fuselage -->
      <polygon points="30,0 14,-5 -18,-3.4 -26,0 -18,3.4 14,5" fill="#CBD5E1"/>
      <polygon points="30,0 16,-2.2 -10,-1.4 -10,1.4 16,2.2" fill="#22D3EE"/>
      <polygon points="30,0 22,-1.6 18,0 22,1.6" fill="#F5C542"/>
      <circle cx="8" cy="0" r="1.6" fill="#0F172A"/>
    </g>
  </g>`;
}

function buildJetSvg(weeks, username) {
  const cells = buildCells(weeks);
  const stats = computeStats(weeks);
  const targets = selectTargets(cells);
  const score = `${(stats.total * 1000).toLocaleString("en-US")} PTS`;
  const level = Math.max(1, Math.round(stats.total / 100));
  const combo = stats.streak.toLocaleString("en-US");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="GitHub contribution interceptor grid">
<defs>
  <linearGradient id="jetBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${JET.bgStart}"/>
    <stop offset="100%" stop-color="${JET.bgEnd}"/>
  </linearGradient>
  <linearGradient id="jetBorder" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#22C55E"/>
    <stop offset="50%" stop-color="#22D3EE"/>
    <stop offset="100%" stop-color="#F5C542"/>
  </linearGradient>
  <pattern id="jetScan" width="4" height="4" patternUnits="userSpaceOnUse">
    <rect width="4" height="1" fill="#7DD3FC" opacity="0.05"/>
  </pattern>
  <filter id="jetGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="2.2" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <style>
    .hud-label-gold { font-family: 'Courier New', Consolas, monospace; font-size: 13px; fill: #FACC15; font-weight: bold; letter-spacing: 0.5px; }
    .hud-val-gold { font-family: 'Courier New', Consolas, monospace; font-size: 13px; fill: #FEF08A; font-weight: bold; }
    .hud-label-cyan { font-family: 'Courier New', Consolas, monospace; font-size: 12px; fill: #38BDF8; font-weight: bold; letter-spacing: 0.5px; }
    .hud-val-cyan { font-family: 'Courier New', Consolas, monospace; font-size: 12px; fill: #E0F2FE; font-weight: bold; }
    .hud-label-rose { font-family: 'Courier New', Consolas, monospace; font-size: 12px; fill: #FB7185; font-weight: bold; letter-spacing: 0.5px; }
    .hud-val-rose { font-family: 'Courier New', Consolas, monospace; font-size: 12px; fill: #FECDD3; font-weight: bold; }
    .axis-label { font-family: 'Courier New', Consolas, monospace; font-size: 10px; fill: #64748B; font-weight: bold; }
    .legend-text { font-family: 'Courier New', Consolas, monospace; font-size: 9px; fill: #64748B; font-weight: bold; letter-spacing: 0.5px; }
    .hud-meta { font-family: 'Courier New', Consolas, monospace; font-size: 10px; fill: #475569; letter-spacing: 1px; font-weight: bold; }
    text { white-space: pre; }
  </style>
</defs>

<rect width="${WIDTH}" height="${HEIGHT}" rx="16" fill="url(#jetBg)"/>
<rect width="${WIDTH}" height="${HEIGHT}" rx="16" fill="url(#jetScan)"/>
<rect x="3" y="3" width="${WIDTH - 6}" height="${HEIGHT - 6}" rx="14" fill="none" stroke="url(#jetBorder)" stroke-width="1.8" opacity="0.85">
  <animate attributeName="opacity" values="0.5;0.95;0.5" dur="3.2s" repeatCount="indefinite"/>
</rect>

<!-- HUD -->
<g transform="translate(28,24)">
  <text class="hud-label-gold">SCORE:</text>
  <text x="78" class="hud-val-gold">${esc(score)}</text>
</g>
<g transform="translate(340,24)">
  <text class="hud-label-cyan">RANK:</text>
  <text x="62" class="hud-val-cyan">LVL ${level} · SYSTEMS DEV</text>
</g>
<g transform="translate(720,20)">
  <text x="0" y="4" class="hud-label-cyan">SHIELDS: 100%</text>
  <g transform="translate(128, -6)">${buildShieldBar(100)}</g>
</g>
<g transform="translate(28,48)">
  <text class="hud-label-rose">COMBO:</text>
  <text x="72" class="hud-val-rose">x${combo} STREAK</text>
</g>

${buildMonthLabels(cells)}
${buildDayLabels()}
${buildGrid(cells, targets)}

<g class="legend-text" transform="translate(128, ${HEIGHT - 22})">
  <text>POWER NODES: LOW</text>
  ${JET.palette.map((c, i) => `<rect x="${108 + i * 14}" y="-9" width="10" height="10" rx="2" fill="${c}" stroke="${c === JET.palette[0] ? JET.emptyStroke : "none"}"/>`).join("")}
  <text x="182">OVERDRIVE</text>
</g>
<text x="${WIDTH - 28}" y="${HEIGHT - 16}" text-anchor="end" class="hud-meta">[VECTOR GRID // SECTOR: ${esc(username.toUpperCase())}]</text>

${buildInterceptor()}
</svg>
`;
}

function daysToWeeks(days) {
  const maxCol = Math.max(0, ...days.map((d) => d.col));
  const weeks = [];
  for (let c = 0; c <= maxCol; c++) {
    const contributionDays = [];
    for (let r = 0; r < ROWS; r++) {
      const d = days.find((x) => x.col === c && x.row === r);
      contributionDays.push({
        contributionCount: d ? d.count : 0,
        date: d ? d.date : null,
      });
    }
    weeks.push({ contributionDays });
  }
  return weeks;
}

async function fetchFromHtml(username) {
  const url = `https://github.com/users/${username}/contributions`;
  const res = await fetch(url, { headers: { "User-Agent": "Aneesh495-readme-generator" } });
  if (!res.ok) throw new Error(`contributions HTML HTTP ${res.status}`);
  const raw = await res.text();
  const tips = new Map();
  for (const m of raw.matchAll(/for="(contribution-day-component-\d+-\d+)"[^>]*>\s*([^<]+)/g)) {
    tips.set(m[1], m[2].trim());
  }
  const days = [];
  for (const m of raw.matchAll(/<td\b([^>]*contribution-day-component[^>]*)>/gi)) {
    const attrs = m[1];
    const id = attrs.match(/id="(contribution-day-component-(\d+)-(\d+))"/);
    const date = attrs.match(/data-date="([^"]+)"/);
    if (!id || !date) continue;
    const text = tips.get(id[1]) || "";
    const count = /^no /i.test(text) ? 0 : Number((text.match(/(\d+)/) || [0, 0])[1]);
    days.push({ row: Number(id[2]), col: Number(id[3]), date: date[1], count });
  }
  if (!days.length) throw new Error("no contribution days parsed");
  return daysToWeeks(days);
}

async function fetchFromGraphQL(username, token) {
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: username } }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data.user.contributionsCollection.contributionCalendar.weeks;
}

async function fetchWeeks(username, token) {
  if (token) {
    try {
      const weeks = await fetchFromGraphQL(username, token);
      console.log(`GraphQL: ${weeks.length} weeks`);
      return weeks;
    } catch (err) {
      console.warn(`GraphQL failed (${err.message}); falling back to HTML`);
    }
  }
  const weeks = await fetchFromHtml(username);
  console.log(`HTML: ${weeks.length} weeks`);
  return weeks;
}

async function main() {
  const weeks = await fetchWeeks(USERNAME, TOKEN);
  const stats = computeStats(weeks);
  console.log(`stats total=${stats.total} streak=${stats.streak} (${stats.streakYears}y ${stats.streakExtra}d since ${stats.streakOrigin}) max=${stats.maxDay}`);

  const dark = buildProfile(DARK, stats);
  const light = buildProfile(LIGHT, stats);
  const jet = buildJetSvg(weeks, USERNAME);

  fs.writeFileSync(path.join(__dirname, "dark.svg"), dark);
  fs.writeFileSync(path.join(__dirname, "light.svg"), light);
  fs.writeFileSync(path.join(__dirname, "github-jet.svg"), jet);
  console.log("wrote dark.svg, light.svg, github-jet.svg");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
