// 다이어그램 명세. 좌표는 generator 가 계산합니다.
const C = {
  client: { fill:'#ecfdf5', stroke:'#15803d', text:'#15803d' },
  proxy:  { fill:'#fef2f2', stroke:'#dc2626', text:'#dc2626' },
  server: { fill:'#eff6ff', stroke:'#1d4ed8', text:'#1d4ed8' },
  kernel: { fill:'#ffffff', stroke:'#dc2626', text:'#64748b', dash:[9,6] },
};

module.exports = {
  colors: C,

  diagrams: [
    {
      // 두 방식을 위아래로 비교합니다. 회색 점선 존은 다른 그림과 같은 뜻 —
      // your machine / server side 입니다. "port forwarding" / "proxy" 는
      // 존이 아니라 각 행 위에 붙는 캡션입니다.
      id: 'forwarding-vs-proxy',
      layout: 'compare',
      alt: 'port forwarding relays one connection through a fixed rule to a destination that never changes; a proxy ends that connection and opens a second, separate one that can go to a different destination each time',
      groups: [
        { caption: 'port forwarding',
          zones: [
            { title: 'your machine',
              cols: [[{ kind:'client', title:'client', sub:'(ex) 203.0.113.10:8000', arrow:'①' }]] },
            { title: 'server side',
              cols: [
                [{ kind:'kernel', title:'fixed rule', sub:'(ex) :8000 → 192.168.0.10:8100',
                   note:'* always the same destination', arrow:'①' }],
                [{ kind:'server', title:'server', sub:'(ex) 192.168.0.10:8100' }],
              ] },
          ] },
        { caption: 'proxy',
          zones: [
            { title: 'your machine',
              cols: [[{ kind:'client', title:'client', sub:'(ex) http://my-url', arrow:'①' }]] },
            { title: 'server side',
              cols: [
                [{ kind:'proxy', title:'proxy', sub:'(ex) localhost:9999',
                   note:'* a new destination per request', arrow:'②' }],
                [{ kind:'server', title:'server', sub:'(ex) 192.168.0.10:8100' }],
              ] },
          ] },
      ],
    },

    {
      id: 'nat-port-forwarding',
      layout: 'cols',
      alt: 'the client dials a public address and the firewall rewrites it to a fixed internal address',
      zones: [
        { title: 'your machine',
          cols: [[{ kind:'client', title:'client', sub:'(ex) 203.0.113.10:8000' }]] },
        { title: 'server side',
          cols: [
            [{ kind:'kernel', title:'firewall', sub:'(ex) :8000 → 192.168.0.10:8100',
               note:'* set by the network admin' }],
            [{ kind:'server', title:'server', sub:'(ex) 192.168.0.10:8100' }],
          ] },
      ],
    },

    {
      id: 'socks-proxy',
      layout: 'cols',
      alt: 'ssh -D starts a SOCKS proxy on your machine; the SSH server opens a new connection per request',
      zones: [
        { title: 'your machine',
          cols: [
            [{ kind:'client', title:'client', sub:'(ex) http://my-url' }],
            [{ kind:'proxy', title:'SOCKS proxy', sub:'(ex) localhost:9999',
               note:'* set by you — ssh -D 9999' }],
          ] },
        { title: 'server side',
          cols: [
            [{ kind:'proxy', title:'SSH server', sub:'(ex) 203.0.113.20:22' }],
            [
              { kind:'server', title:'remote server A', sub:'(ex) 10.0.0.11:80' },
              { kind:'server', title:'remote server B', sub:'(ex) 10.0.0.12:80' },
              { kind:'server', title:'remote server C', sub:'(ex) 10.0.0.13:80' },
            ],
          ] },
      ],
    },

    {
      id: 'reverse-proxy',
      layout: 'cols',
      alt: 'the client dials one URL and nginx forwards it to a server behind it',
      zones: [
        { title: 'your machine',
          cols: [[{ kind:'client', title:'client', sub:'(ex) http://my-url' }]] },
        { title: 'server side',
          cols: [
            [{ kind:'proxy', title:'nginx', sub:'(ex) my-url → 10.0.0.21:8100',
               note:'* set by the server operator' }],
            [{ kind:'server', title:'remote server', sub:'(ex) 10.0.0.21:8100' }],
          ] },
      ],
    },

    // -------------------------------------------------------------------
    // 데이터센터 전력 공급 글. 역할 색은 전기가 흐르는 방향에 맞춰 재사용합니다.
    // client(초록)=전기가 시작되는 곳, proxy(빨강)=받아서 다시 내보내는 중개 장비,
    // kernel(빨간 점선)=자동으로, 눈에 안 띄게 동작하는 장치, server(파랑)=최종 목적지.
    // -------------------------------------------------------------------

    // 1. 전력이 지나가는 길 — ATS 에서 두 갈래로 갈립니다.
    //    IT 부하만 UPS 를 타고, 냉각 같은 기계 부하는 UPS 를 타지 않습니다.
    {
      id: 'power-path',
      layout: 'cols',
      alt: 'utility power and a standby generator feed a transfer switch, which splits into the IT load through the UPS and the cooling load that bypasses it',
      zones: [
        { title: 'power source',
          cols: [
            [
              { kind:'client', title:'utility grid', sub:'primary power' },
              { kind:'client', title:'generator', sub:'standby' },
            ],
            [{ kind:'kernel', title:'ATS', sub:'picks the source' }],
          ] },
        { title: 'data center',
          cols: [
            [
              { kind:'proxy', title:'UPS', sub:'battery backup' },
              { kind:'server', title:'cooling', sub:'chillers, fans', end: true,
                note:'* no UPS on this side' },
            ],
            [{ kind:'server', title:'rack', sub:'the IT load' }],
          ] },
      ],
    },

    // 2. 정전에도 서버가 안 꺼지는 이유
    {
      id: 'power-outage-timeline',
      layout: 'cols',
      alt: 'when the grid drops, the UPS battery covers the first seconds until the generator comes online',
      zones: [
        { title: 'power outage timeline',
          cols: [
            [{ kind:'kernel', title:'grid drops', sub:'outage detected' }],
            [{ kind:'proxy', title:'UPS battery', sub:'covers the first seconds',
               note:'* bridges the gap while the generator starts' }],
            [{ kind:'server', title:'generator running', sub:'ATS switches the load over' }],
          ] },
      ],
    },

    // 3. 버스덕트 · TAP BOX · 리셉터클 — 랙까지 전기를 끌어오는 마지막 구간
    {
      id: 'busway-tapbox',
      layout: 'cols',
      alt: 'an overhead busway runs above the rack row; a tap box clamps onto it and its receptacle is where the rack power cord plugs in',
      zones: [
        { title: 'above the rack',
          cols: [
            [{ kind:'kernel', title:'busway', sub:'conductor rail' }],
            [{ kind:'proxy', title:'TAP BOX', sub:'taps off one circuit',
               note:'* breaker sits in here' }],
            [{ kind:'proxy', title:'receptacle', sub:'the outlet itself' }],
          ] },
        { title: 'in the rack',
          cols: [
            [{ kind:'server', title:'rack PDU', sub:'power cord plugs in here' }],
          ] },
      ],
    },

    // 4. 랙 PDU · 서버 PSU — 랙 안에서 서버까지
    {
      id: 'psu-redundancy',
      layout: 'cols',
      alt: 'two separate rack PDU feeds each power their own PSU, and either PSU alone can keep the server running',
      zones: [
        { title: 'inside the rack',
          cols: [
            [
              { kind:'proxy', title:'rack PDU A', sub:'feed A' },
              { kind:'proxy', title:'rack PDU B', sub:'feed B' },
            ],
            [
              { kind:'server', title:'PSU 1', sub:'AC \u2192 DC' },
              { kind:'server', title:'PSU 2', sub:'AC \u2192 DC' },
            ],
            [{ kind:'server', title:'server board', sub:'either PSU alone is enough',
               note:'* N+1 \u2014 one PSU can fail without downtime' }],
          ] },
      ],
    },
  ],
};
