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

    // 1. 전력이 지나가는 길 — 전력실 PDU 와 랙 PDU 는 서로 다른 장비입니다.
    //    부하는 평상시에도 UPS 를 통과합니다. 평소에 정말로 꺼져 있는 것은 발전기뿐입니다.
    {
      id: 'power-path',
      layout: 'cols',
      alt: 'the utility feeds a transfer switch, then the UPS and the room PDU in the electrical room, then the rack PDU and the server PSU; the generator stays shut down until the utility drops',
      zones: [
        { title: 'power source',
          cols: [
            [
              { kind:'client', title:'utility grid', sub:'everyday source' },
              { kind:'client', title:'generator', sub:'off until needed', arrowDash: true,
                note:'* starts only on an outage' },
            ],
            [{ kind:'kernel', title:'ATS', sub:'picks the source' }],
          ] },
        { title: 'electrical room',
          cols: [
            [{ kind:'proxy', title:'UPS', sub:'batteries inside',
               note:'* the load runs through it' }],
            [{ kind:'proxy', title:'PDU', sub:'branch circuits' }],
          ] },
        { title: 'rack',
          cols: [
            [{ kind:'proxy', title:'rack PDU', sub:'rack outlets' }],
            [{ kind:'server', title:'server PSU', sub:'AC \u2192 DC' }],
          ] },
      ],
    },

    // 1-b. UPS 두 방식 — 부하가 UPS 를 통과하느냐, 아니면 UPS 가 비켜 있다가 끼어드느냐.
    {
      id: 'ups-topology',
      layout: 'compare',
      alt: 'in a double conversion UPS the load always runs through the UPS, so there is no gap; in a standby UPS the feed passes straight to the load and the UPS only takes over when it drops',
      groups: [
        { caption: 'double conversion (online)',
          zones: [
            { title: 'everyday path',
              cols: [
                [{ kind:'client', title:'utility grid', sub:'incoming feed' }],
                [{ kind:'proxy', title:'UPS', sub:'always in the path',
                   note:'* converts AC \u2192 DC \u2192 AC all day' }],
                [{ kind:'server', title:'server', sub:'never sees a gap' }],
              ] },
          ] },
        { caption: 'standby / line-interactive',
          zones: [
            { title: 'everyday path',
              cols: [
                [{ kind:'client', title:'utility grid', sub:'incoming feed' }],
                [
                  { kind:'kernel', title:'transfer switch', sub:'passes it straight through' },
                  { kind:'proxy', title:'UPS', sub:'waits on battery', arrowDash: true,
                    note:'* takes over when the feed drops' },
                ],
                [{ kind:'server', title:'server', sub:'brief gap on transfer' }],
              ] },
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

    // 5. 이중화 — 2N. 인입부터 랙 PDU 까지 두 벌이 각각 서버의 PSU 한 쪽씩을 먹입니다.
    {
      id: 'redundancy-2n',
      layout: 'cols',
      alt: 'in a 2N design two fully independent feeds each run their own UPS and rack PDU into one of the two power supplies of the same dual corded server',
      zones: [
        { title: '2N \u2014 two independent paths',
          cols: [
            [
              { kind:'client', title:'feed A', sub:'utility + generator' },
              { kind:'client', title:'feed B', sub:'utility + generator' },
            ],
            [
              { kind:'proxy', title:'UPS A', sub:'own batteries' },
              { kind:'proxy', title:'UPS B', sub:'own batteries' },
            ],
            [
              { kind:'proxy', title:'rack PDU A', sub:'own breaker' },
              { kind:'proxy', title:'rack PDU B', sub:'own breaker' },
            ],
            [
              { kind:'server', title:'PSU 1', sub:'AC \u2192 DC' },
              { kind:'server', title:'PSU 2', sub:'AC \u2192 DC' },
            ],
            [{ kind:'server', title:'server', sub:'dual corded',
               note:'* a whole path can die and nothing stops' }],
          ] },
      ],
    },
  ],
};
