// 아이소메트릭 그리기 도구.
// 좌표계: hx = 화면 가로(오른쪽 +), depth = 화면 세로(아래 +), y = 높이(위 +).
// 내부적으로는 x/z 축을 쓰는 표준 아이소메트릭이지만, 장면을 짤 때는
// "화면에서 어디에 놓을지"로 생각하는 편이 훨씬 편해서 hx/depth 로 감쌌습니다.
const COS30 = Math.cos(Math.PI / 6);

// (x, y, z) → 화면 좌표
const prj = (x, y, z) => [
  ((x - z) * COS30).toFixed(2),
  ((x + z) * 0.5 - y).toFixed(2),
];
const P = (x, y, z) => prj(x, y, z).join(',');

// hx/depth → x/z
const ax = (hx, depth) => depth + hx;
const az = (hx, depth) => depth - hx;

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map(v => Math.max(0, Math.min(255, Math.round(v + amt))));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

// 상자 하나. w = 가로, d = 깊이, h = 높이.
// 윗면이 가장 밝고, 오른쪽 면이 가장 어둡습니다 — 참고한 아이소메트릭 도표들과 같은 음영입니다.
function box(hx, depth, y, w, d, h, color, o = {}) {
  const x = ax(hx, depth) - w / 2, z = az(hx, depth) - d / 2;
  const top = shade(color, o.topShade != null ? o.topShade : 20);
  const south = color;
  const east = shade(color, o.eastShade != null ? o.eastShade : -26);
  const st = o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 1}" stroke-linejoin="round"` : '';
  return [
    `<polygon points="${P(x, y + h, z)} ${P(x + w, y + h, z)} ${P(x + w, y + h, z + d)} ${P(x, y + h, z + d)}" fill="${top}"${st}/>`,
    `<polygon points="${P(x, y, z + d)} ${P(x, y + h, z + d)} ${P(x + w, y + h, z + d)} ${P(x + w, y, z + d)}" fill="${south}"${st}/>`,
    `<polygon points="${P(x + w, y, z)} ${P(x + w, y + h, z)} ${P(x + w, y + h, z + d)} ${P(x + w, y, z + d)}" fill="${east}"${st}/>`,
  ].join('\n');
}

// 상자의 앞면(남쪽 면) 위에 얹는 납작한 판 — 서버 슬롯, 환기구, 문 같은 디테일용.
function facePanel(hx, depth, y, w, d, pw, ph, fill, o = {}) {
  const x = ax(hx, depth) - w / 2, z = az(hx, depth) - d / 2 + d + 0.35;
  const x0 = x + (w - pw) / 2 + (o.dx || 0);
  const extra = o.rx ? ` rx="${o.rx}"` : '';
  return `<polygon points="${P(x0, y, z)} ${P(x0 + pw, y, z)} ${P(x0 + pw, y + ph, z)} ${P(x0, y + ph, z)}" fill="${fill}"${o.opacity ? ` opacity="${o.opacity}"` : ''}${extra}/>`;
}

// 바닥 타일 한 장
function tile(hx, depth, w, d, fill, opacity) {
  const x = ax(hx, depth) - w / 2, z = az(hx, depth) - d / 2;
  return `<polygon points="${P(x, 0, z)} ${P(x + w, 0, z)} ${P(x + w, 0, z + d)} ${P(x, 0, z + d)}" fill="${fill}" opacity="${opacity}"/>`;
}

// 두 점을 잇는 선 (전력선, 케이블)
function line(a, b, stroke, o = {}) {
  const p1 = prj(ax(a[0], a[1]), a[2], az(a[0], a[1]));
  const p2 = prj(ax(b[0], b[1]), b[2], az(b[0], b[1]));
  return `<path d="M${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]}" stroke="${stroke}" stroke-width="${o.sw || 2}" fill="none" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.opacity ? ` opacity="${o.opacity}"` : ''}/>`;
}

// 화면 좌표를 그대로 돌려줍니다 (라벨 위치를 잡을 때 씁니다)
const screen = (hx, depth, y) => prj(ax(hx, depth), y, az(hx, depth)).map(Number);

module.exports = { prj, P, ax, az, shade, box, facePanel, tile, line, screen, COS30 };
