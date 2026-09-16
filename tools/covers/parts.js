// 장면을 이루는 부품들. 전부 iso.js 의 상자/판으로만 만듭니다.
const { box, facePanel, line, screen } = require('./iso.js');

const WHITE = '#F3F5FD';
const GRAY = '#C9D0E8';
const DARK = '#3B4468';
const AMBER = '#FBBF24';

// 서버 랙 — 앞면에 서버 슬롯이 줄줄이 보입니다.
function rack(hx, depth, { w = 22, d = 26, h = 54, slots = 7, color = DARK, led = '#38BDF8' } = {}) {
  const out = [box(hx, depth, 0, w, d, h, color, { stroke: 'none' })];
  const pad = 3, slotH = (h - pad * 2) / slots;
  for (let i = 0; i < slots; i++) {
    const y = pad + i * slotH;
    out.push(facePanel(hx, depth, y + slotH * 0.18, w, d, w - 6, slotH * 0.62, '#E8EDFB', { opacity: 0.9 }));
    out.push(facePanel(hx, depth, y + slotH * 0.3, w, d, 1.6, slotH * 0.3, led, { dx: -(w - 6) / 2 + 2.2 }));
  }
  return out.join('\n');
}

// 캐비닛 — UPS·PDU·스위치기어처럼 문이 달린 함. 앞면에 문 한 장과 표시창.
function cabinet(hx, depth, { w = 20, d = 24, h = 38, color = WHITE, panel = '#8E9BC8', badge } = {}) {
  const out = [box(hx, depth, 0, w, d, h, color, { stroke: 'none' })];
  out.push(facePanel(hx, depth, 3, w, d, w - 5, h - 8, panel, { opacity: 0.5 }));
  if (badge) out.push(facePanel(hx, depth, h - 11, w, d, w - 11, 5, badge));
  return out.join('\n');
}

// 배터리 캐비닛 — UPS 옆에 세우는 배터리 랙. 칸칸이 배터리가 보입니다.
function battery(hx, depth, { w = 18, d = 24, h = 30, color = WHITE } = {}) {
  const out = [box(hx, depth, 0, w, d, h, color, { stroke: 'none' })];
  for (let i = 0; i < 3; i++) {
    out.push(facePanel(hx, depth, 4 + i * 8.5, w, d, w - 6, 5.5, '#64D2A8', { opacity: 0.85 }));
  }
  return out.join('\n');
}

// 발전기 — 옆으로 긴 함체에 환기 루버와 배기관.
function generator(hx, depth, { w = 34, d = 24, h = 24, color = '#7C86B8' } = {}) {
  const out = [box(hx, depth, 0, w, d, h, color, { stroke: 'none' })];
  for (let i = 0; i < 6; i++) {
    out.push(facePanel(hx, depth, 5 + i * 2.6, w, d, w - 10, 1.4, '#E8EDFB', { opacity: 0.55 }));
  }
  // 배기관
  out.push(box(hx + w * 0.34, depth - 2, h, 3.5, 3.5, 12, '#9AA4D0', { stroke: 'none' }));
  return out.join('\n');
}

// 변압기 — 위에 애자 세 개가 올라간 함체.
function transformer(hx, depth, { w = 22, d = 22, h = 18, color = '#8E9BC8' } = {}) {
  const out = [box(hx, depth, 0, w, d, h, color, { stroke: 'none' })];
  for (let i = -1; i <= 1; i++) {
    out.push(box(hx + i * 6, depth - i * 2, h, 2.6, 2.6, 9, '#D7DEF6', { stroke: 'none' }));
  }
  return out.join('\n');
}

// 버스덕트 — 랙 줄 위를 따라가는 긴 레일. x 축을 따라 놓이므로 랙 줄과 나란합니다.
// taps 는 중심에서 x 방향으로 얼마나 떨어진 자리에 TAP BOX 를 달지입니다.
function busway(hx, depth, y, lenX, { taps = [], color = '#A9B3DC' } = {}) {
  const out = [box(hx, depth, y, lenX, 5, 4, color, { stroke: 'none' })];
  for (const t of taps) {
    const th = hx + t / 2, td = depth + t / 2;
    out.push(box(th, td, y - 6, 5, 6, 6, '#FBBF24', { stroke: 'none' }));
    out.push(line([th, td, y - 6], [th, td, y - 13], '#FBBF24', { sw: 1.8 }));
  }
  return out.join('\n');
}

// 노트북 — 클라이언트 자리.
function laptop(hx, depth, { w = 20, d = 14, color = WHITE } = {}) {
  const out = [box(hx, depth, 0, w, d, 1.6, color, { stroke: 'none' })];
  out.push(box(hx, depth - d * 0.52, 1.6, w, 1.6, 13, '#DCE3F8', { stroke: 'none' }));
  out.push(facePanel(hx, depth - d * 0.52, 3.4, w, 1.6, w - 4, 9.5, '#5B6CF9', { opacity: 0.75 }));
  return out.join('\n');
}

// 냉동기 — 위에 팬이 달린 실외기. HPC 인프라 장면에 씁니다.
function chiller(hx, depth, { w = 26, d = 18, h = 12, color = '#9AA4D0' } = {}) {
  const out = [box(hx, depth, 0, w, d, h, color, { stroke: 'none' })];
  const { P } = require('./iso.js');
  for (let i = -1; i <= 1; i++) {
    const cx2 = hx + i * 7, cz = depth + i * 7;
    out.push(box(cx2, cz, h, 5, 5, 1.2, '#E8EDFB', { stroke: 'none' }));
  }
  return out.join('\n');
}

// 층층이 쌓은 판 — 계층 구조(메모리 계층, 추상화 계층)를 나타냅니다.
function slabs(hx, depth, { n = 4, w0 = 46, step = 9, h = 7, gap = 4, colors = [] } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const w = w0 - i * step;
    out.push(box(hx, depth, i * (h + gap), w, w, h, colors[i] || '#8E9BC8', { stroke: 'none' }));
  }
  return out.join('\n');
}

// 라벨 — 부품에서 짧은 선을 뽑아 글씨를 붙입니다. 참고 도표들의 콜아웃과 같은 방식입니다.
function label(hx, depth, y, text, { dx = 0, dy = -26, anchor = 'middle', size = 27 } = {}) {
  const [sx, sy] = screen(hx, depth, y);
  const tx = sx + dx, ty = sy + dy;
  return [
    `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} L${tx.toFixed(1)} ${(ty + 7).toFixed(1)}" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.4" fill="none"/>`,
    `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="2.4" fill="#ffffff" fill-opacity="0.85"/>`,
    `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${anchor}" font-size="${size}" font-weight="700" letter-spacing="1.6" fill="#ffffff" fill-opacity="0.95">${text}</text>`,
  ].join('\n');
}

module.exports = { rack, cabinet, battery, generator, transformer, busway, laptop, chiller, slabs, label, WHITE, GRAY, DARK, AMBER };
