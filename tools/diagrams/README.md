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
  layout: 'cols',             // 'cols' 존을 한 줄로 / 'compare' 여러 시나리오를 위아래로 비교
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
- `arrow` — 그 상자에서 나가는 화살표에 붙는 작은 표시(예: `①`). 두 그림을 비교할 때
  같은 표시가 반복되면 같은 연결이 이어진다는 뜻, 표시가 바뀌면 연결이 끊기고
  새로 열렸다는 뜻으로 씁니다. (`forwarding-vs-proxy.svg` 참고)
- 한 열에 상자를 여러 개 넣으면 세로로 쌓이고, 앞 열에서 화살표가 갈라져 나갑니다.

### `layout: 'compare'` — 시나리오를 위아래로 비교

`zones` 대신 `groups` 를 씁니다. 각 그룹이 캡션 하나 + 그 안의 존들입니다.
같은 자리(예: 두 그룹의 두 번째 존)끼리는 폭을 맞춰서 위아래가 나란히 서게 합니다.

```js
{
  layout: 'compare',
  groups: [
    { caption: 'port forwarding', zones: [ /* your machine, server side */ ] },
    { caption: 'proxy',           zones: [ /* your machine, server side */ ] },
  ],
}
```

캡션은 회색 점선 존이 **아닙니다.** 존은 언제나 `your machine` / `server side` 처럼
어느 망인지를 뜻하고, 캡션은 그 위에 붙는 평범한 텍스트 한 줄입니다. 둘을 섞지 마세요.

## 배치 규칙

- 모든 열은 하나의 **중심선**에 맞춥니다. 그래서 존을 건너는 화살표가 언제나 수평입니다.
- 존의 크기는 그 안의 내용에 맞춥니다. 옆 존이 크다고 따라 커지지 않습니다.
- 글자 폭은 Playwright 로 **실제 Gaegu 글꼴을 띄워 재기** 때문에, 글자가 상자 밖으로 삐져나오지 않습니다.
- 그림은 `viewBox` 로 그려지고 `width:100%` 로 줄어듭니다. 가로 스크롤이 생길 수 없습니다.
- `.diagram` 패널은 본문(`.prose`) 폭을 넘지 않습니다. Mermaid(`.mermaid`)만 양옆으로
  더 넓게 나옵니다 — 둘의 CSS 규칙이 다르니 헷갈리지 마세요.

## 세로로 흐르는 배치 (`layout: 'flow'`)

단계가 대여섯을 넘는 사슬은 가로로 늘어놓으면 폭이 터집니다. `flow` 로 바꾸면
`cols` 가 **단(stage)** 이 되어 위에서 아래로 쌓이고, 한 단 안의 상자는 가로로 늘어섭니다.
존은 위아래로 쌓입니다.

갈래가 많을 때는 상자에 `id` 를 주고 보내는 쪽에서 `to: ['id', ...]` 로 직접 잇습니다.
`to` 를 안 적은 상자는 자리 순서대로 짝지어집니다.

| 필드 | 뜻 |
| --- | --- |
| `id` | 이 상자를 가리킬 이름 |
| `to` | 다음 단에서 이을 상자들의 `id` |
| `end` | 여기서 끝나는 갈래. 나가는 화살표를 그리지 않습니다 |
| `arrowDash` | 평상시엔 흐르지 않고 조건이 맞을 때만 흐르는 길 (점선) |
