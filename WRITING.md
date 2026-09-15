# 글 쓰는 법

30초 버전: **`_posts/ko/` 에 `2026-09-15-제목.md` 파일 하나 만들고, 앞머리 6줄 채우고, 커밋.**
1~2분 뒤에 https://ssyrc.github.io 에 올라옵니다.

---

## 1. 새 글 하나 올리기

파일 이름은 반드시 `YYYY-MM-DD-영문-슬러그.md` 형식입니다. 날짜가 없으면 글로 인식되지 않습니다.

```
_posts/ko/2026-09-15-rack-power-budget.md
```

파일 맨 위에 앞머리(front matter)를 넣습니다.

```yaml
---
title: "랙 하나의 전력 예산"
date: 2026-09-15
category: power-cooling
tags: [rack, power]
---
```

그 아래부터는 그냥 마크다운으로 쓰면 됩니다.
`_templates/` 안에 복사해서 쓸 수 있는 템플릿 세 개가 들어 있습니다
(`post-ko.md`, `post-en.md`, `til.md`).

가장 빠른 방법은 GitHub 웹에서 바로 만드는 것입니다:
저장소 → `_posts/ko` → **Add file** → **Create new file**.
휴대폰으로도 됩니다.

## 2. 앞머리에 넣을 수 있는 것

| 항목 | 필수 | 설명 |
| --- | --- | --- |
| `title` | ✅ | 글 제목 |
| `date` | ✅ | `2026-09-15` 형식 |
| `category` | 권장 | `cs` `server` `network` `power-cooling` `til` 중 하나 |
| `tags` | | `[rack, power]` 처럼 목록으로 |
| `ref` | | 한국어판·영어판을 잇는 열쇠말. 두 글에 같은 값을 넣으면 서로 링크됩니다 |
| `mermaid` | | `true` 면 다이어그램 기능을 불러옵니다 |
| `math` | | `true` 면 수식 기능을 불러옵니다 |
| `updated` | | 나중에 크게 고쳤을 때 `2026-10-01` 처럼 |

`lang` 은 적지 않아도 됩니다. `_posts/ko/` 에 있으면 한국어, `_posts/en/` 에 있으면 영어로 자동 처리됩니다.

## 3. 요약문

본문 중간에 `<!--more-->` 를 한 번 넣으면, 그 앞부분이 목록과 RSS 의 요약으로 쓰입니다.
안 넣으면 첫 문단이 요약이 됩니다.

## 4. 다이어그램

앞머리에 `mermaid: true` 를 넣고, 본문에 이렇게 씁니다.

````
```mermaid
graph LR
    A[클라이언트] --> B[ToR 스위치]
    B --> C[스파인]
```
````

## 5. 수식

앞머리에 `math: true` 를 넣으면 `$...$`(줄 안), `$$...$$`(별도 줄) 가 수식으로 보입니다.

## 6. 그림

`assets/images/` 에 파일을 올리고 이렇게 씁니다.

```markdown
![설명](/assets/images/rack-diagram.png)
```

## 7. 영어판 같이 올리기

같은 글의 두 언어판은 `ref` 값으로 묶습니다.

- `_posts/ko/2026-09-15-rack-power-budget.md` → `ref: rack-power-budget`
- `_posts/en/2026-09-15-rack-power-budget.md` → `ref: rack-power-budget`

두 글 사이에 서로 가는 링크가 자동으로 생깁니다.
영어판은 안 써도 됩니다. 한국어 글만 있어도 사이트는 정상입니다.

## 8. 아직 공개하기 싫은 초안

`_drafts/` 에 넣어두면 사이트에 나오지 않습니다. 파일 이름에 날짜를 붙이지 않아도 됩니다.
다 쓰면 `_posts/ko/` 로 옮기면서 날짜를 붙이세요.

## 9. 주제 추가·수정

`_data/categories.yml` 을 고치면 홈과 글 목록에 바로 반영됩니다.
색을 다르게 주고 싶으면 `assets/css/style.scss` 의 `.cat-...` 규칙에 한 줄 추가하면 됩니다.

## 10. 로컬에서 미리 보기 (선택)

안 해도 됩니다. 커밋하면 GitHub 이 알아서 빌드합니다. 그래도 미리 보고 싶다면:

```bash
bundle install
bundle exec jekyll serve --drafts
# http://localhost:4000
```

커밋 전에 빌드가 깨지는지만 확인하고 싶다면 푸시 후 Actions 탭의
**Build check** 결과를 보면 됩니다. 초록색이면 사이트도 정상입니다.
