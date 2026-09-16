# 다이어그램 생성기

본문에 들어가는 손그림 다이어그램을 SVG 로 만들어 `_includes/diagrams/` 에 넣습니다.
Mermaid 를 쓰지 않는 이유는 [CLAUDE.md](../../CLAUDE.md) 에 적어두었습니다.
한 줄로 줄이면, **주석을 상자 바로 아래에 붙이는 배치를 Mermaid 로는 만들 수 없기 때문**입니다.

## 쓰는 법

1. `spec.js` 에 그림을 적습니다. 좌표는 적지 않습니다. 존과 열, 상자만 적으면 됩니다.
2. `npm install` 후 `npm run build`.
3. 본문에서 이렇게 불러옵니다.

   ```liquid
   <div class="diagram">{% include diagrams/이름.svg %}</div>
   ```

## spec.js 한 눈에

```js
{
  id: 'socks-proxy',          // 파일 이름이 됩니다
  layout: 'cols',             // 'cols' 가로 배치 / 'rows' 위아래 비교
  alt: '...',                 // 스크린리더용 한 줄 설명 (영어)
  zones: [                    // 점선으로 묶는 망
    { title: 'your machine',
      cols: [                 // 왼쪽부터 한 열씩
        [ { kind:'client', title:'client', sub:'(ex) http://my-url' } ],
        [ { kind:'proxy', title:'SOCKS proxy', sub:'(ex) localhost:9999',
            note:'* set by you — ssh -D 9999' } ],   // 상자 바로 아래에 붙습니다
      ] },
  ],
}
```

- `kind` — `client` 초록 / `proxy` 빨강 / `server` 파랑 / `kernel` 빨간 점선
- `sub` — 상자 안 둘째 줄. 실제로 어떻게 접속하는지를 `(ex)` 를 붙여 **한 줄만** 적습니다.
- `note` — 누가 설정하는지. **상자 밖 바로 아래**에 붙습니다.
- 한 열에 상자를 여러 개 넣으면 세로로 쌓이고, 앞 열에서 화살표가 갈라져 나갑니다.

## 배치 규칙

- 모든 열은 하나의 **중심선**에 맞춥니다. 그래서 존을 건너는 화살표가 언제나 수평입니다.
- 존의 크기는 그 안의 내용에 맞춥니다. 옆 존이 크다고 따라 커지지 않습니다.
- 글자 폭은 Playwright 로 **실제 Gaegu 글꼴을 띄워 재기** 때문에, 글자가 상자 밖으로 삐져나오지 않습니다.
- 그림은 `viewBox` 로 그려지고 `width:100%` 로 줄어듭니다. 가로 스크롤이 생길 수 없습니다.
