# ssyrc.github.io

Data Center Deep Dive — 컴퓨팅 아키텍처와 데이터센터 인프라를 정리하는 기술 블로그.
→ **https://ssyrc.github.io**

Jekyll 로 만들고 GitHub Pages 가 `main` 브랜치를 그대로 빌드해 배포합니다.
빌드 스크립트나 배포 명령은 따로 없습니다. **커밋하면 1~2분 뒤 반영됩니다.**

## 글 쓰기

→ **[WRITING.md](WRITING.md)** 에 전부 정리해두었습니다.

짧게: `_posts/ko/YYYY-MM-DD-슬러그.md` 파일을 만들고 앞머리를 채우면 끝입니다.
복사해 쓸 템플릿은 `_templates/` 에 있습니다.

## 구조

```
_config.yml           사이트 제목·설명 등 기본 설정
_data/
  categories.yml      주제 목록 (여기만 고치면 홈·목록에 반영)
  ui.yml              화면 문구 (한국어/영어)
_posts/ko/            한국어 글
_posts/en/            영어 글
_drafts/              공개 전 초안 (사이트에 안 나옴)
_templates/           글 템플릿 (사이트에 안 나옴)
_layouts/             페이지 뼈대
_includes/            머리말·꼬리말·슬라이더·카드 등 조각
assets/css/style.scss 스타일 전체 (맨 위 :root 에서 색 팔레트 관리)
assets/js/site.js     최신 글 슬라이더, 주제 필터, Categories 메뉴
assets/images/covers/ 주제별 기본 대표 이미지 (SVG)
```

## 주소 구성

| 주소 | 내용 |
| --- | --- |
| `/` | 한국어 홈 |
| `/en/` | 영어 홈 (영어 글이 있을 때만 링크가 노출됨) |
| `/archive/`, `/en/archive/` | 전체 글 (주제별·연도별) |
| `/about/`, `/en/about/` | 소개 |
| `/ko/2026/09/15/제목/` | 한국어 글 |
| `/en/2026/09/15/title/` | 영어 글 |
| `/feed.xml` | RSS (화면에 링크는 없지만 주소로 접근 가능, 리더에서는 자동 인식) |
| `/sitemap.xml` | 사이트맵 |

## 기능

- 한국어가 기본. 영어판은 **선택**이며 자동 번역은 없습니다 — 직접 써서 `_posts/en/` 에
  넣으면 됩니다. 비어 있으면 상단 English 링크가 숨겨지고, 글을 올리면 다시 나타납니다.
  같은 글의 두 언어판은 앞머리의 `ref` 값으로 서로 연결됩니다.
- 다이어그램(Mermaid)과 수식(KaTeX). 쓰는 글에서만 불러오도록 앞머리로 켭니다.
- 다크 모드는 기기 설정을 따라갑니다.
- 홈 상단에 최신 글 3편이 5초 간격으로 자동 전환되는 슬라이더. 마우스를 올리면 멈춥니다.
- 주제 필터(홈·글 목록)와 Categories 메뉴. 자바스크립트가 꺼져 있어도
  첫 슬라이드와 전체 글 목록은 그대로 보이고, 필터는 글 목록 링크로 동작합니다.
- 모든 글에 대표 이미지. 지정하지 않으면 주제별 기본 그림이 붙습니다.
- RSS, 사이트맵, SEO 메타 태그 자동 생성. RSS 는 화면에 링크를 걸지 않았지만
  `<head>` 의 메타 태그로 피드 리더가 자동 인식합니다.
- 푸시할 때마다 GitHub Actions 의 **Build check** 가 빌드 성공 여부를 확인합니다.

## 나중에 개인 도메인을 붙인다면

1. 저장소 루트에 `CNAME` 파일을 만들고 도메인 한 줄만 적습니다.
2. 도메인 업체에서 DNS 를 GitHub Pages 로 향하게 합니다.
3. Settings → Pages 에서 **Enforce HTTPS** 를 켭니다.

`_config.yml` 의 `url` 도 새 도메인으로 바꿔주세요.
