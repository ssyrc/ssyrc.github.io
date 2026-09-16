// 글 대표 이미지(커버) 생성기 — 1200x675 아이소메트릭 SVG.
// 실행: node gen.js ../../assets/images/covers
const fs = require('fs');
const path = require('path');
const { line, tile, box, facePanel } = require('./iso.js');
const T = require('./parts.js');

const W = 1200, H = 675;

// 그려진 좌표를 전부 훑어 장면의 실제 크기를 재고, 캔버스에 꽉 차게 맞춥니다.
// 장면을 고칠 때마다 scale/translate 를 손으로 맞추지 않아도 됩니다.
function bbox(body) {
  const pts = [];
  for (const m of body.matchAll(/points="([^"]+)"/g))
    for (const pair of m[1].trim().split(/\s+/)) {
      const [x, y] = pair.split(',').map(Number);
      if (isFinite(x) && isFinite(y)) pts.push([x, y]);
    }
  for (const m of body.matchAll(/\bd="M([-\d.]+) ([-\d.]+) L([-\d.]+) ([-\d.]+)"/g))
    pts.push([+m[1], +m[2]], [+m[3], +m[4]]);
  for (const m of body.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)"/g))
    pts.push([+m[1], +m[2]]);
  // 글자는 폭을 어림해서 잡습니다 (굵은 대문자 + 자간)
  for (const m of body.matchAll(/<text x="([-\d.]+)" y="([-\d.]+)"[^>]*font-size="([\d.]+)"[^>]*>([^<]*)</g)) {
    const x = +m[1], y = +m[2], size = +m[3], w = m[4].length * size * 0.72;
    pts.push([x - w / 2, y - size], [x + w / 2, y + size * 0.3]);
  }
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

// 좌우 여백을 넉넉히 둡니다 — 히어로 자리는 16:10 틀에 16:9 그림을 object-fit:cover 로
// 채우기 때문에 좌우가 6% 쯤 잘립니다. 잘려도 라벨이 살아 있어야 합니다.
function frame(id, grad, body, { marginX = 96, marginY = 50 } = {}) {
  const b = bbox(body);
  const bw = b.x1 - b.x0, bh = b.y1 - b.y0;
  const scale = Math.min((W - marginX * 2) / bw, (H - marginY * 2) / bh);
  const cx = W / 2 - (b.x0 + bw / 2) * scale;
  const cy = H / 2 - (b.y0 + bh / 2) * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${id}">
  <defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1">
      ${grad}
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg${id})"/>
  <circle cx="1050" cy="110" r="220" fill="#ffffff" opacity="0.06"/>
  <circle cx="140" cy="600" r="180" fill="#ffffff" opacity="0.05"/>
  <g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${scale.toFixed(3)})" font-family="ui-sans-serif, system-ui, sans-serif">
${body}
  </g>
</svg>
`;
}

// 바닥 타일 — 장면이 허공에 뜨지 않게 받쳐줍니다.
function floor(cols, rows, { hx0 = -160, depth0 = -26, step = 24 } = {}) {
  const out = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    out.push(tile(hx0 + i * step, depth0 + j * step, step * 0.94, step * 0.94, '#ffffff', 0.055));
  }
  return out.join('\n');
}

// x 축을 따라 i 번째 자리 — 화면에서 오른쪽아래로 줄지어 갑니다 (데이터센터 랙 줄과 같은 방향).
const row = (hx, depth, step) => (i) => [hx + (i * step) / 2, depth + (i * step) / 2];
// z 축으로 한 줄 밀기 — 화면에서 왼쪽아래로.
const back = (hx, depth, gap) => [hx - gap / 2, depth + gap / 2];

const scenes = {
  // 데이터센터 전력 경로: 수전·발전·UPS·PDU 한 줄과, 버스덕트가 걸린 랙 두 줄.
  power: () => {
    const o = [];
    o.push(floor(8, 5, { hx0: -122, depth0: -52, step: 30 }));

    // 전력 설비 한 줄 — 본문 1절의 순서 그대로 (한전 → 발전기 → ATS → UPS)
    const E = row(-130, -55, 30);
    o.push(T.transformer(...E(0)));
    o.push(T.generator(...E(1)));
    o.push(T.cabinet(...E(2), { w: 16, h: 34, badge: '#FBBF24' }));
    o.push(T.cabinet(...E(3), { w: 17, h: 38, badge: '#38BDF8' }));
    o.push(T.battery(...E(3.85)));
    o.push(T.label(...E(0), 20, 'UTILITY', { dy: -26, size: 9, dx: -14 }));
    o.push(T.label(...E(1), 26, 'GENERATOR', { dy: -54, size: 9, dx: 16 }));
    o.push(T.label(...E(2), 36, 'ATS', { dy: -28, size: 9 }));
    o.push(T.label(...E(3), 40, 'UPS', { dy: -50, size: 9 }));

    // 랙 뒷줄 + 버스덕트
    const R1 = row(2, -30, 30);
    for (let i = 0; i < 5; i++) o.push(T.rack(...R1(i), { slots: 8 }));
    o.push(T.busway(...R1(2), 60, 128, { taps: [-48, -18, 12, 42] }));
    o.push(T.label(...R1(0), 62, 'BUSWAY', { dy: -28, size: 9 }));

    // 랙 앞줄
    const R2 = row(...back(2, -30, 62), 30);
    for (let i = 0; i < 5; i++) o.push(T.rack(...R2(i), { slots: 8 }));
    o.push(T.label(...R2(4), 30, 'RACK', { dy: 6, size: 9, dx: 46, anchor: 'start' }));

    // 전기가 흐르는 길
    const p = [[...E(0), 18], [...E(1), 24], [...E(2), 34], [...E(3), 38], [...R2(0), 50]];
    for (let i = 0; i < p.length - 1; i++)
      o.push(line([p[i][0], p[i][1], p[i][2]], [p[i + 1][0], p[i + 1][1], p[i + 1][2]], '#FBBF24', { sw: 2.2 }));

    return frame('power', `<stop offset="0%" stop-color="#3B32B0"/><stop offset="55%" stop-color="#6D5DF6"/><stop offset="100%" stop-color="#38BDF8"/>`, o.join('\n'));
  },

  // 프록시: 내 컴퓨터 → 중개자 → 서버 쪽 랙 줄
  proxy: () => {
    const o = [];
    o.push(floor(7, 5, { hx0: -104, depth0: -40, step: 30 }));

    const C = [-112, -36];
    o.push(T.laptop(...C));
    o.push(T.label(...C, 14, 'CLIENT', { dy: -30, size: 9 }));

    const X = [-54, -8];
    o.push(T.cabinet(...X, { w: 20, d: 20, h: 26, color: '#E8788C', panel: '#FCE3E8', badge: '#FBBF24' }));
    o.push(T.label(...X, 28, 'PROXY', { dy: -30, size: 9 }));

    const S1 = row(26, -30, 30);
    for (let i = 0; i < 4; i++) o.push(T.rack(...S1(i), { slots: 8 }));
    o.push(T.label(...S1(0), 56, 'SERVERS', { dy: -30, size: 9 }));

    const S2 = row(...back(26, -30, 60), 30);
    for (let i = 0; i < 4; i++) o.push(T.rack(...S2(i), { slots: 8 }));

    o.push(line([...C, 15], [...X, 22], '#F8FAFF', { sw: 2.2, opacity: 0.9 }));
    o.push(line([...X, 26], [...S2(0), 48], '#F8FAFF', { sw: 2.2, opacity: 0.9 }));
    return frame('proxy', `<stop offset="0%" stop-color="#4F46E5"/><stop offset="55%" stop-color="#7C6BF7"/><stop offset="100%" stop-color="#A855F7"/>`, o.join('\n'));
  },

  // ----- 주제별 기본 커버 (글에 cover 를 지정하지 않았을 때 쓰입니다) -----

  // CS 기초 — 층층이 쌓인 추상화 계층
  'topic-cs': () => {
    const o = [];
    o.push(floor(6, 5, { hx0: -70, depth0: -30, step: 30 }));
    o.push(T.slabs(0, 0, { n: 4, w0: 52, step: 10, h: 8, gap: 5,
      colors: ['#7C86B8', '#8E9BC8', '#A9B3DC', '#D7DEF6'] }));
    return frame('topiccs', `<stop offset="0%" stop-color="#3F3BC4"/><stop offset="60%" stop-color="#6D5DF6"/><stop offset="100%" stop-color="#38BDF8"/>`, o.join('\n'));
  },

  // 서버·네트워크 — 스위치 한 대와 랙 두 줄
  'topic-server-network': () => {
    const o = [];
    o.push(floor(7, 5, { hx0: -96, depth0: -46, step: 30 }));
    const SW = [-70, -18];
    o.push(T.cabinet(...SW, { w: 22, d: 20, h: 16, color: '#8FD6F2', panel: '#E4F6FD', badge: '#FBBF24' }));
    const A = row(16, -34, 30), B = row(...back(16, -34, 60), 30);
    for (let i = 0; i < 4; i++) { o.push(T.rack(...A(i), { slots: 8 })); }
    for (let i = 0; i < 4; i++) { o.push(T.rack(...B(i), { slots: 8 })); }
    for (let i = 0; i < 3; i++) o.push(line([...SW, 16], [...B(i), 50], '#F8FAFF', { sw: 1.6, opacity: 0.75 }));
    return frame('topicsn', `<stop offset="0%" stop-color="#3B44C8"/><stop offset="55%" stop-color="#5B6CF9"/><stop offset="100%" stop-color="#38BDF8"/>`, o.join('\n'));
  },

  // HPC 인프라 — 전력과 냉각이 붙은 랙 줄
  'topic-hpc': () => {
    const o = [];
    o.push(floor(8, 5, { hx0: -112, depth0: -48, step: 30 }));
    o.push(T.generator(-96, -34));
    o.push(T.cabinet(-58, -14, { w: 17, h: 34, badge: '#38BDF8' }));
    o.push(T.battery(-40, -2));
    o.push(T.chiller(-92, 26));
    const A = row(16, -30, 30), B = row(...back(16, -30, 60), 30);
    for (let i = 0; i < 4; i++) o.push(T.rack(...A(i), { slots: 9 }));
    o.push(T.busway(...A(1.5), 58, 96, { taps: [-34, -6, 22] }));
    for (let i = 0; i < 4; i++) o.push(T.rack(...B(i), { slots: 9 }));
    return frame('topichpc', `<stop offset="0%" stop-color="#3B32B0"/><stop offset="55%" stop-color="#6D5DF6"/><stop offset="100%" stop-color="#38BDF8"/>`, o.join('\n'));
  },

  // AI — GPU 랙 세 줄과 그 사이를 잇는 링크
  'topic-ai': () => {
    const o = [];
    o.push(floor(8, 6, { hx0: -104, depth0: -50, step: 30 }));
    const rows = [row(-20, -38, 28), row(...back(-20, -38, 56), 28), row(...back(-20, -38, 112), 28)];
    rows.forEach((R, j) => {
      for (let i = 0; i < 4; i++) o.push(T.rack(...R(i), { slots: 9, led: j === 1 ? '#8B5CF6' : '#38BDF8' }));
    });
    for (let i = 0; i < 4; i++) {
      o.push(line([...rows[0](i), 56], [...rows[1](i), 56], '#C4B5FD', { sw: 1.5, opacity: 0.8 }));
      o.push(line([...rows[1](i), 56], [...rows[2](i), 56], '#C4B5FD', { sw: 1.5, opacity: 0.8 }));
    }
    return frame('topicai', `<stop offset="0%" stop-color="#4C1D95"/><stop offset="55%" stop-color="#7C3AED"/><stop offset="100%" stop-color="#A855F7"/>`, o.join('\n'));
  },
};

const outDir = process.argv[2] || '.';
fs.mkdirSync(outDir, { recursive: true });
for (const [name, fn] of Object.entries(scenes)) {
  const svg = fn();
  fs.writeFileSync(path.join(outDir, name + '.svg'), svg);
  console.log(name + '.svg  ' + svg.length + ' bytes');
}
