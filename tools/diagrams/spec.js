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

    // 1. 건물 전원 → UPS → 서버룸. A/B 두 계통을 세로로 흘립니다.
    //    상용전원 인입은 하나여도 됩니다 — 티어를 가르는 것은 인입 개수가 아니라,
    //    상용전원이 없을 때 현장 발전설비로 버틸 수 있느냐입니다.
    {
      id: 'power-building',
      layout: 'flow',
      alt: 'one utility intake feeds two transformers; each transfer switch also takes its own generator, and each side runs its own low voltage switchboard, UPS with batteries, UPS output switchboard and server room panelboard, with essential cooling fed from the switchboard ahead of the UPS',
      zones: [
        { title: 'incoming power',
          cols: [
            [
              { kind:'client', title:'fuel system A', sub:'tank + pumps', to:['ga'] },
              { kind:'client', title:'utility intake', sub:'one feed is enough', to:['ta','tb'] },
              { kind:'client', title:'fuel system B', sub:'tank + pumps', to:['gb'] },
            ],
            [
              { kind:'client', id:'ga', title:'generator A', sub:'off until needed', to:['aa'], arrowDash: true },
              { kind:'kernel', id:'ta', title:'transformer A', sub:'steps voltage down', to:['aa'] },
              { kind:'kernel', id:'tb', title:'transformer B', sub:'steps voltage down', to:['ab'] },
              { kind:'client', id:'gb', title:'generator B', sub:'off until needed', to:['ab'], arrowDash: true },
            ],
            [
              { kind:'kernel', id:'aa', title:'transfer switch A', sub:'utility or generator', to:['la'] },
              { kind:'kernel', id:'ab', title:'transfer switch B', sub:'utility or generator', to:['lb'] },
            ],
          ] },
        { title: 'electrical room',
          cols: [
            [
              { kind:'proxy', id:'la', title:'LV switchboard A', sub:'low voltage side', to:['ua','ca'] },
              { kind:'proxy', id:'lb', title:'LV switchboard B', sub:'low voltage side', to:['ub','cb'] },
            ],
            [
              { kind:'server', id:'ca', title:'cooling power A', sub:'not on the UPS', end: true },
              { kind:'proxy', id:'ua', title:'UPS A', sub:'battery A inside', to:['da'] },
              { kind:'proxy', id:'ub', title:'UPS B', sub:'battery B inside', to:['db'] },
              { kind:'server', id:'cb', title:'cooling power B', sub:'not on the UPS', end: true },
            ],
            [
              { kind:'proxy', id:'da', title:'UPS output board A', sub:'clean power only', to:['ra'] },
              { kind:'proxy', id:'db', title:'UPS output board B', sub:'clean power only', to:['rb'] },
            ],
          ] },
        { title: 'server room',
          cols: [
            [
              { kind:'proxy', id:'ra', title:'room panelboard A', sub:'feeds the rack rows', end: true,
                note:'* A alone must carry the whole load' },
              { kind:'proxy', id:'rb', title:'room panelboard B', sub:'feeds the rack rows', end: true },
            ],
          ] },
      ],
    },

    // 2. 서버룸 분전반 → 버스덕트 → 탭박스 → 랙 PDU → 서버 PSU.
    //    A/B 가 랙까지 갈라진 채로 이어지는 것이 핵심입니다.
    {
      id: 'power-rack',
      layout: 'flow',
      alt: 'each room panelboard runs its own busway, tap box, rack PDU and PSU group, and the two PSU groups meet only inside one server',
      zones: [
        { title: 'server room',
          cols: [
            [
              { kind:'proxy', title:'room panelboard A', sub:'feeds the rack rows' },
              { kind:'proxy', title:'room panelboard B', sub:'feeds the rack rows' },
            ],
            [
              { kind:'kernel', title:'busway A', sub:'conductor rail' },
              { kind:'kernel', title:'busway B', sub:'conductor rail' },
            ],
            [
              { kind:'proxy', title:'tap box A', sub:'branch breaker' },
              { kind:'proxy', title:'tap box B', sub:'branch breaker' },
            ],
          ] },
        { title: 'rack',
          cols: [
            [
              { kind:'proxy', title:'rack PDU A', sub:'outlets, feed A' },
              { kind:'proxy', title:'rack PDU B', sub:'outlets, feed B' },
            ],
            [
              { kind:'server', id:'pa', title:'PSU group A', sub:'one or more PSUs', to:['sv'] },
              { kind:'server', id:'pb', title:'PSU group B', sub:'one or more PSUs', to:['sv'] },
            ],
            [{ kind:'server', id:'sv', title:'server power board', sub:'one machine, two cords',
               note:'* group B alone must hold the full load' }],
            [{ kind:'server', title:'CPU / GPU / memory', sub:'the actual work' }],
          ] },
      ],
    },

    // 3. 정전 한 장면 — 평상시 / 정전 직후 / 발전기 인수.
    //    UPS 그림에는 비상발전기를 언제나 같이 넣습니다.
    {
      id: 'ups-generator',
      layout: 'compare',
      alt: 'normally the utility runs through the UPS to the server while the generator is off; the instant the utility drops the battery carries the load and the generator starts; once it is up the generator feeds the UPS and the battery recharges',
      groups: [
        { caption: 'everyday',
          zones: [
            { title: 'who is carrying the load',
              cols: [
                [
                  { kind:'client', title:'utility', sub:'live' },
                  { kind:'client', title:'generator', sub:'shut down', end: true },
                ],
                [{ kind:'proxy', title:'UPS', sub:'battery full, passing through' }],
                [{ kind:'server', title:'server', sub:'running' }],
              ] },
          ] },
        { caption: 'the moment it drops',
          zones: [
            { title: 'who is carrying the load',
              cols: [
                [
                  { kind:'client', title:'utility', sub:'dead', end: true },
                  { kind:'client', title:'generator', sub:'cranking', end: true,
                    note:'* takes tens of seconds' },
                ],
                [{ kind:'proxy', title:'UPS', sub:'battery carries it' }],
                [{ kind:'server', title:'server', sub:'never notices' }],
              ] },
          ] },
        { caption: 'generator up',
          zones: [
            { title: 'who is carrying the load',
              cols: [
                [
                  { kind:'client', title:'utility', sub:'still dead', end: true },
                  { kind:'client', title:'generator', sub:'carrying the load' },
                ],
                [{ kind:'proxy', title:'UPS', sub:'recharging the battery' }],
                [{ kind:'server', title:'server', sub:'running' }],
              ] },
          ] },
      ],
    },

    // 4. 버스덕트 · 탭박스 · 리셉터클 (한 계통만 확대해서 봅니다)
    {
      id: 'busway-tapbox',
      layout: 'cols',
      alt: 'an overhead busway runs above the rack row; a tap box clamps onto it and its receptacle is where the rack power cord plugs in',
      zones: [
        { title: 'above the rack',
          cols: [
            [{ kind:'kernel', title:'busway', sub:'conductor rail' }],
            [{ kind:'proxy', title:'tap box', sub:'taps off one circuit',
               note:'* branch breaker sits in here' }],
            [{ kind:'proxy', title:'receptacle', sub:'the outlet itself' }],
          ] },
        { title: 'in the rack',
          cols: [
            [{ kind:'server', title:'rack PDU', sub:'power cord plugs in here' }],
          ] },
      ],
    },

    // 5. 랙 PDU · 서버 PSU (한 랙 안)
    {
      id: 'psu-redundancy',
      layout: 'cols',
      alt: 'two separate rack PDU feeds each power their own PSU group, and either group alone can keep the server running',
      zones: [
        { title: 'inside the rack',
          cols: [
            [
              { kind:'proxy', title:'rack PDU A', sub:'feed A' },
              { kind:'proxy', title:'rack PDU B', sub:'feed B' },
            ],
            [
              { kind:'server', title:'PSU group A', sub:'AC \u2192 DC' },
              { kind:'server', title:'PSU group B', sub:'AC \u2192 DC' },
            ],
            [{ kind:'server', title:'server board', sub:'either group alone is enough',
               note:'* size each group for the full load' }],
          ] },
      ],
    },
  ],
};
