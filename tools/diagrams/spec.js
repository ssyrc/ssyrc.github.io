// 다이어그램 명세. 좌표는 generator 가 계산합니다.
const C = {
  client: { fill:'#ecfdf5', stroke:'#15803d', text:'#15803d' },
  proxy:  { fill:'#fef2f2', stroke:'#dc2626', text:'#dc2626' },
  server: { fill:'#eff6ff', stroke:'#1d4ed8', text:'#1d4ed8' },
  kernel: { fill:'#ffffff', stroke:'#dc2626', text:'#64748b', dash:[9,6] },
  // 전기를 바꾸거나 고르거나 실어 나르는 설비. 평상시에도 반드시 지나는 길이라
  // 실선으로 그립니다. 전력 그림에서 점선은 '조건부 경로' 하나만 뜻해야 합니다.
  gear:   { fill:'#fffbeb', stroke:'#b45309', text:'#b45309' },
  // 지금은 전기를 안 내보내는 쪽. 색은 client 와 같고 선만 점선입니다 —
  // 같은 장비가 상태에 따라 실선/점선을 오갑니다 (발전기: 정지 → 기동 → 인수).
  standby:{ fill:'#ecfdf5', stroke:'#15803d', text:'#15803d', dash:[9,6] },
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
    // client(초록)=전기가 시작되는 곳, gear(주황)=전기를 바꾸거나 고르거나 실어 나르는 설비,
    // proxy(빨강)=받아서 여러 갈래로 나누는 반, server(파랑)=최종 목적지.
    // 전력 그림에서 상자는 전부 실선입니다. 점선은 화살표에만 쓰고, 뜻은 하나 —
    // '평상시엔 안 흐르고 조건이 맞을 때만 흐르는 길'. 상자를 점선으로 그리면
    // 없어도 되는 장비처럼 읽힙니다 (변압기·절체설비를 그렇게 그렸다가 반려됐습니다).
    // -------------------------------------------------------------------

    // 1. 건물 인입 → 전기실 → 서버룸. 한 줄짜리 개념도입니다.
    //    A/B 이중화는 글 마지막 절에서 따로 다루므로 여기서는 일부러 한 계통만 그립니다.
    {
      id: 'power-building',
      layout: 'flow',
      alt: 'utility power comes in through a transformer to a transfer switch that can also take the standby generator; the low voltage switchboard splits cooling power off and feeds the UPS, and the UPS output board feeds the server room panelboard',
      zones: [
        { title: 'incoming power',
          cols: [
            [{ kind:'client', title:'utility intake', sub:'from the grid', to:['tr'] }],
            [
              { kind:'gear', id:'tr', title:'transformer', sub:'steps voltage down', to:['ts'] },
              { kind:'standby', id:'gn', title:'generator', sub:'off until needed', to:['ts'], arrowDash: true },
            ],
            [{ kind:'gear', id:'ts', title:'transfer switch', sub:'utility or generator',
               note:'* the dashed line only flows when the utility is gone' }],
          ] },
        { title: 'electrical room',
          cols: [
            [{ kind:'proxy', id:'lv', title:'LV switchboard', sub:'low voltage side', to:['cl','up'] }],
            [
              { kind:'server', id:'cl', title:'cooling power', sub:'not on the UPS', end: true },
              { kind:'proxy', id:'up', title:'UPS', sub:'battery inside', to:['ob'] },
            ],
            [{ kind:'proxy', id:'ob', title:'UPS output board', sub:'clean power only' }],
          ] },
        { title: 'server room',
          cols: [
            [{ kind:'proxy', title:'room panelboard', sub:'feeds the rack rows', end: true,
               note:'* one circuit per rack row' }],
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
              { kind:'gear', title:'busway A', sub:'conductor rail' },
              { kind:'gear', title:'busway B', sub:'conductor rail' },
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
                  { kind:'standby', title:'generator', sub:'shut down', end: true },
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
                  { kind:'standby', title:'utility', sub:'dead', end: true },
                  { kind:'standby', title:'generator', sub:'cranking', end: true,
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
                  { kind:'standby', title:'utility', sub:'still dead', end: true },
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
            [{ kind:'gear', title:'busway', sub:'conductor rail' }],
            [{ kind:'proxy', title:'tap box', sub:'taps off one circuit',
               note:'* branch breaker sits in here' }],
            [{ kind:'gear', title:'receptacle', sub:'the outlet itself' }],
          ] },
        { title: 'in the rack',
          cols: [
            [{ kind:'proxy', title:'rack PDU', sub:'power cord plugs in here' }],
          ] },
      ],
    },

    // 6. 이중화 예시 — 랙 PDU 는 2N, 서버 PSU 는 N+2 로 짰을 때의 결선.
    //    N=2 (두 개면 full load), 설치 4개, A 에 둘 B 에 둘.
    {
      id: 'redundancy-2n-n2',
      layout: 'flow',
      alt: 'two rack PDUs each sized for the whole rack feed four power supplies, two on each side, and the server needs any two of the four to run',
      zones: [
        { title: 'rack',
          cols: [
            [
              { kind:'proxy', id:'pa', title:'rack PDU A', sub:'100% of the rack', to:['s1','s2'],
                note:'* 2N — either side alone runs the rack' },
              { kind:'proxy', id:'pb', title:'rack PDU B', sub:'100% of the rack', to:['s3','s4'] },
            ],
            [
              { kind:'server', id:'s1', title:'PSU 1', sub:'feed A', to:['bd'] },
              { kind:'server', id:'s2', title:'PSU 2', sub:'feed A', to:['bd'] },
              { kind:'server', id:'s3', title:'PSU 3', sub:'feed B', to:['bd'] },
              { kind:'server', id:'s4', title:'PSU 4', sub:'feed B', to:['bd'] },
            ],
            [{ kind:'server', id:'bd', title:'server board', sub:'any 2 of the 4 carry it',
               note:'* N+2 — N is 2, so two spare PSUs' }],
          ] },
      ],
    },

    // 5. 랙 PDU · 서버 PSU — 리셉터클에서 CPU 까지 한 줄로만 봅니다.
    {
      id: 'rack-pdu-psu',
      layout: 'cols',
      alt: 'the receptacle feeds the rack PDU, one of its outlets feeds a server PSU, and the PSU turns AC into the DC the board uses',
      zones: [
        { title: 'inside the rack',
          cols: [
            [{ kind:'gear', title:'receptacle', sub:'from the tap box' }],
            [{ kind:'proxy', title:'rack PDU', sub:'splits into outlets' }],
            [{ kind:'server', title:'server PSU', sub:'AC \u2192 DC' }],
            [{ kind:'server', title:'server board', sub:'CPU / GPU / memory' }],
          ] },
      ],
    },
  ],
};
