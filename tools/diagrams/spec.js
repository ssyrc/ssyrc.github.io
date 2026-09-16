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
      arrowColor: '#131A2E',
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
  ],
};
