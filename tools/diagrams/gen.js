const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const rough = require('roughjs/bundled/rough.cjs.js');
const spec = require('./spec.js');

const F_TITLE = 16, F_SUB = 13, F_NOTE = 13, F_ZONE = 13, F_CAPTION = 15;
const PADX = 18;
const H_TWO = 60, H_ONE = 40;
const COL_GAP = 58;              // 같은 존 안 열 간격 (= 화살표 길이)
const ZONE_GAP = 62;             // 존 사이 간격
const ROW_GAP = 26;              // 세로로 쌓인 상자 간격
const Z_PAD_X = 20, Z_PAD_TOP = 30, Z_PAD_BOT = 16;
const NOTE_GAP = 6;              // 상자 아래 - 주석 위. 바로 아래 붙입니다.
const NOTE_H = 16;
const ARROW_GAP = 4;             // 상자 테두리와 화살표 사이
const ARROW = '#131A2E';         // 화살표 색 — 모든 다이어그램에서 검정 하나로 고정합니다
const OUT_PAD = 10;
const CAP_H = 22;                // compare 배치에서 캡션 한 줄이 쓰는 높이
const GROUP_GAP = 28;            // compare 배치에서 행(비교 대상) 사이 간격

const noteExtent = b => (b.note ? NOTE_GAP + NOTE_H : 0);

// ---------- 1. 실제 폰트로 글자 폭 재기 ----------
function collect() {
  const out = new Set();
  const addZone = (z) => {
    out.add(JSON.stringify([z.title, F_ZONE]));
    for (const col of z.cols) for (const b of col) {
      out.add(JSON.stringify([b.title, F_TITLE]));
      if (b.sub) out.add(JSON.stringify([b.sub, F_SUB]));
      if (b.note) out.add(JSON.stringify([b.note, F_NOTE]));
    }
  };
  for (const d of spec.diagrams) {
    if (d.groups) for (const grp of d.groups) for (const z of grp.zones) addZone(z);
    else for (const z of d.zones) addZone(z);
  }
  return [...out].map(JSON.parse);
}

async function measure(pairs) {
  // 저장소 안의 Gaegu 를 그대로 띄워서 잽니다. 잰 폭과 실제로 그려질 폭이 같아집니다.
  const woff = fs.readFileSync(path.join(__dirname, '../../assets/fonts/gaegu-latin-400.woff2'));
  const html = '<!doctype html><meta charset=utf-8><style>@font-face{font-family:Gaegu;' +
    "src:url(data:font/woff2;base64," + woff.toString('base64') + ') format("woff2");font-display:block}' +
    '</style><p style="font-family:Gaegu">measuring</p>';
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const p2 = await b.newPage();
  await p2.setContent(html);
  await p2.evaluate(() => Promise.all([document.fonts.load('400 16px Gaegu'), document.fonts.load('400 13px Gaegu')]));
  const w = await p2.evaluate((ps) => {
    const ctx = document.createElement('canvas').getContext('2d');
    return ps.map(([t, s]) => { ctx.font = '400 ' + s + "px Gaegu, sans-serif"; return ctx.measureText(t).width; });
  }, pairs);
  await b.close();
  const m = {};
  pairs.forEach(([t, s], i) => { m[s + '|' + t] = w[i]; });
  return m;
}

// ---------- 2. 배치 ----------
// 모든 열을 하나의 중심선에 맞춥니다. 그래야 존을 건너는 화살표가 수평이 됩니다.
function sizeZone(z, tw) {
  for (const col of z.cols) for (const b of col) {
    b.w = Math.ceil(Math.max(tw(b.title, F_TITLE), b.sub ? tw(b.sub, F_SUB) : 0)) + PADX * 2;
    b.h = b.sub ? H_TWO : H_ONE;
    b.noteW = b.note ? Math.ceil(tw(b.note, F_NOTE)) : 0;
  }
  // 열 높이는 상자만으로 재고, 주석은 마지막 상자 아래로 흘려보냅니다.
  z.colSpan = z.cols.map(col => col.reduce((a, b, i) =>
    a + b.h + (i ? ROW_GAP + noteExtent(col[i - 1]) : 0), 0));
  z.colBelow = z.cols.map(col => noteExtent(col[col.length - 1]));
  z.colW = z.cols.map(col => Math.max(...col.map(b => b.w)));
  z.colOuter = z.cols.map((col, i) => Math.max(z.colW[i], ...col.map(b => b.noteW)));
}

function sizeZoneOuter(z, tw) {
  z.innerW = z.colOuter.reduce((a, b) => a + b, 0) + COL_GAP * (z.cols.length - 1);
  z.w = Math.max(z.innerW, Math.ceil(tw(z.title, F_ZONE)) + 24) + Z_PAD_X * 2;
  z.up = Math.max(...z.colSpan.map(s => s / 2)) + Z_PAD_TOP;
  z.down = Math.max(...z.colSpan.map((s, i) => s / 2 + z.colBelow[i])) + Z_PAD_BOT;
}

// 존을 가로로 늘어놓고 하나의 중심선(cy)을 공유하게 합니다. originX 부터 시작합니다.
function placeRow(zones, originX, originY) {
  const up = Math.max(...zones.map(z => z.up)), down = Math.max(...zones.map(z => z.down));
  const cy = originY + up;
  let x = originX;
  for (const z of zones) { z.cy = cy; z.y = cy - z.up; z.h = z.up + z.down; z.x = x; x += z.w + ZONE_GAP; }
  return { w: x - ZONE_GAP - originX, h: up + down };
}

function placeBoxesInZone(z) {
  let x = z.x + (z.w - z.innerW) / 2;
  z.cols.forEach((col, ci) => {
    const cw = z.colOuter[ci];
    let ty = z.cy - z.colSpan[ci] / 2;
    col.forEach((b) => {
      b.x = Math.round(x + (cw - b.w) / 2);
      b.y = Math.round(ty);
      b.cx = b.x + b.w / 2; b.cy = b.y + b.h / 2;
      ty += b.h + ROW_GAP + noteExtent(b);
    });
    x += cw + COL_GAP;
  });
}

// 앞 열에서 뒤 열로 화살표를 잇습니다.
// 앞 열이 상자 하나면 뒤 열 전부로 갈라지고, 여럿이면 같은 자리끼리 짝지어집니다.
// `end: true` 인 상자는 거기서 끝나는 갈래라, 나가는 화살표를 그리지 않습니다.
// 상자의 `arrow` 는 그 상자에서 나가는 화살표에 붙일 표시입니다 (같은 표시 = 같은 연결).
// `arrowDash: true` 면 점선 화살표가 됩니다 — 평상시에는 흐르지 않고
// 어떤 조건에서만 흐르는 길(예: 정전 때만 쓰는 UPS 라인)에 씁니다.
function connect(from, to) {
  const arrows = [];
  const push = (a, b) => {
    if (a.end) return;
    arrows.push({ x1: a.x + a.w + ARROW_GAP, y1: a.cy, x2: b.x - ARROW_GAP, y2: b.cy,
                  label: a.arrow, dash: a.arrowDash ? [7, 5] : null });
  };
  if (from.length === 1) for (const t of to) push(from[0], t);
  else from.forEach((f, k) => push(f, to[Math.min(k, to.length - 1)]));
  return arrows;
}

function arrowsWithinZone(z) {
  const arrows = [];
  for (let i = 0; i < z.cols.length - 1; i++) arrows.push(...connect(z.cols[i], z.cols[i + 1]));
  return arrows;
}

function arrowsBetweenZones(za, zb) {
  return connect(za.cols[za.cols.length - 1], zb.cols[0]);
}

function layout(d, M) {
  const tw = (t, s) => M[s + '|' + t] || 0;

  // 비교 그림 — 존을 두 개 이상의 "행"(예: port forwarding / proxy)으로 나눠
  // 위아래로 쌓습니다. 각 행은 자체적으로 your machine / server side 존을 가집니다.
  if (d.layout === 'compare') {
    for (const grp of d.groups) for (const z of grp.zones) { sizeZone(z, tw); sizeZoneOuter(z, tw); }

    // 같은 자리(예: 두 행의 "server side")끼리 폭을 맞춰서 위아래가 나란히 서게 합니다.
    const n = d.groups[0].zones.length;
    for (let i = 0; i < n; i++) {
      const w = Math.max(...d.groups.map(g => g.zones[i].w));
      for (const g of d.groups) g.zones[i].w = w;
      const cols = d.groups[0].zones[i].cols.length;
      for (let c = 0; c < cols; c++) {
        const cw = Math.max(...d.groups.map(g => g.zones[i].colOuter[c]));
        for (const g of d.groups) g.zones[i].colOuter[c] = cw;
      }
      for (const g of d.groups) {
        const z = g.zones[i];
        z.innerW = z.colOuter.reduce((a, b) => a + b, 0) + COL_GAP * (z.cols.length - 1);
      }
    }

    let y = OUT_PAD, W = 0;
    for (const grp of d.groups) {
      grp._capTop = y;
      y += CAP_H;
      const row = placeRow(grp.zones, 0, y);
      grp._w = row.w;
      W = Math.max(W, row.w);
      y += row.h + GROUP_GAP;
    }
    const H = y - GROUP_GAP + OUT_PAD;

    const allZones = [], allArrows = [];
    for (const grp of d.groups) {
      const xOff = OUT_PAD + (W - grp._w) / 2;
      for (const z of grp.zones) z.x += xOff;
      grp._capX = xOff;
      for (const z of grp.zones) placeBoxesInZone(z);
      for (const z of grp.zones) allArrows.push(...arrowsWithinZone(z));
      for (let i = 0; i < grp.zones.length - 1; i++) allArrows.push(...arrowsBetweenZones(grp.zones[i], grp.zones[i + 1]));
      allZones.push(...grp.zones);
    }
    d.zones = allZones;
    d.arrows = allArrows;
    d.W = Math.ceil(W + OUT_PAD * 2);
    d.H = Math.ceil(H);
    return d;
  }

  // 가로로 한 줄 — 존을 나란히 놓고 사이사이를 화살표로 잇습니다.
  for (const z of d.zones) { sizeZone(z, tw); sizeZoneOuter(z, tw); }
  const row = placeRow(d.zones, OUT_PAD, OUT_PAD);
  for (const z of d.zones) placeBoxesInZone(z);
  const arrows = [];
  for (const z of d.zones) arrows.push(...arrowsWithinZone(z));
  for (let i = 0; i < d.zones.length - 1; i++) arrows.push(...arrowsBetweenZones(d.zones[i], d.zones[i + 1]));
  d.arrows = arrows;
  d.W = Math.ceil(row.w + OUT_PAD * 2);
  d.H = Math.ceil(row.h + OUT_PAD * 2);
  return d;
}

// ---------- 3. 손그림 SVG ----------
const g = rough.generator();
let seed = 11;
const nextSeed = () => (seed = (seed * 37 + 17) % 9973);

// roughjs 의 toPaths 는 점선 정보를 넘겨주지 않습니다. 직접 붙입니다.
function paths(drawable, dash) {
  return g.toPaths(drawable).map(p => {
    const a = ['d="' + p.d + '"'];
    a.push('fill="' + (p.fill && p.fill !== 'none' ? p.fill : 'none') + '"');
    if (p.stroke && p.stroke !== 'none') {
      a.push('stroke="' + p.stroke + '"', 'stroke-width="' + p.strokeWidth + '"',
             'stroke-linecap="round"', 'stroke-linejoin="round"');
      if (dash) a.push('stroke-dasharray="' + dash.join(' ') + '"');
    }
    return '  <path ' + a.join(' ') + '/>';
  }).join('\n');
}

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = (x, y, s, size, fill, anchor) =>
  '  <text x="' + x + '" y="' + y + '" font-size="' + size + '" fill="' + fill + '"' +
  (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + esc(s) + '</text>';

function arrow(a, color) {
  // 몸통만 점선으로 하고 화살촉은 실선으로 둡니다 — 점선이면 촉이 끊겨 보입니다.
  const out = [paths(g.line(a.x1, a.y1, a.x2, a.y2,
    { seed: nextSeed(), roughness: 0.7, bowing: 0.3, stroke: color, strokeWidth: 1.7 }), a.dash)];
  const ang = Math.atan2(a.y2 - a.y1, a.x2 - a.x1), L = 9, S = 0.42;
  for (const s of [1, -1]) {
    const t = ang + Math.PI + s * S;
    out.push(paths(g.line(a.x2, a.y2, a.x2 + Math.cos(t) * L, a.y2 + Math.sin(t) * L,
      { seed: nextSeed(), roughness: 0.5, bowing: 0.2, stroke: color, strokeWidth: 1.7 })));
  }
  return out.join('\n');
}

function render(d) {
  const o = [];
  if (d.groups) for (const grp of d.groups) {
    o.push(text(grp._capX, grp._capTop + 16, grp.caption, F_CAPTION, '#475569', 'start'));
  }
  for (const z of d.zones) {
    o.push(paths(g.rectangle(z.x, z.y, z.w, z.h, {
      seed: nextSeed(), roughness: 0.9, bowing: 0.6, stroke: '#94a3b8', strokeWidth: 1.3 }), [9, 7]));
    o.push(text(z.x + z.w / 2, z.y + 20, z.title, F_ZONE, '#64748b'));
  }
  for (const z of d.zones) for (const col of z.cols) for (const b of col) {
    const c = spec.colors[b.kind];
    o.push(paths(g.rectangle(b.x, b.y, b.w, b.h, {
      seed: nextSeed(), roughness: 1.0, bowing: 0.8, stroke: c.stroke, strokeWidth: 1.9,
      fill: c.fill, fillStyle: 'solid' }), c.dash));
    if (b.sub) {
      o.push(text(b.cx, b.cy - 3, b.title, F_TITLE, c.text));
      o.push(text(b.cx, b.cy + 16, b.sub, F_SUB, '#64748b'));
    } else {
      o.push(text(b.cx, b.cy + 6, b.title, F_TITLE, c.text));
    }
    if (b.note) o.push(text(b.cx, b.y + b.h + NOTE_GAP + 12, b.note, F_NOTE, '#64748b'));
  }
  // 화살표는 언제나 검정입니다. 상자 색(빨강 proxy 등)과 섞이면 흐름이 안 보입니다.
  for (const a of d.arrows) o.push(arrow(a, ARROW));
  // 화살표 표시(예: ①②) — 같은 연결이 이어지는지, 새 연결이 열리는지 보여줍니다.
  for (const a of d.arrows) if (a.label) o.push(text((a.x1 + a.x2) / 2, Math.min(a.y1, a.y2) - 9, a.label, F_NOTE, '#475569'));

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + d.W + ' ' + d.H +
    '" width="' + d.W + '" height="' + d.H + '" role="img" aria-label="' + esc(d.alt) +
    '" font-family="Gaegu, ui-rounded, sans-serif" text-anchor="middle"' +
    ' preserveAspectRatio="xMidYMid meet">\n' + o.join('\n') + '\n</svg>\n';
}

(async () => {
  const M = await measure(collect());
  const outDir = process.argv[2] || '.';
  fs.mkdirSync(outDir, { recursive: true });
  for (const d of spec.diagrams) {
    layout(d, M);
    fs.writeFileSync(path.join(outDir, d.id + '.svg'), render(d));
    console.log(d.id + '  ' + d.W + ' x ' + d.H);
  }
})();
