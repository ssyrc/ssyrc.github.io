# ssyrc.github.io

CS 기초와 데이터센터 인프라를 정리하는 기술 블로그.
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
_includes/            머리말·꼬리말·목록 등 조각
assets/css/style.scss 스타일 전체
```

## 주소 구성

| 주소 | 내용 |
| --- | --- |
| `/` | 한국어 홈 |
| `/en/` | 영어 홈 |
| `/archive/`, `/en/archive/` | 전체 글 (주제별·연도별) |
| `/about/`, `/en/about/` | 소개 |
| `/ko/2026/09/15/제목/` | 한국어 글 |
| `/en/2026/09/15/title/` | 영어 글 |
| `/feed.xml` | RSS |
| `/sitemap.xml` | 사이트맵 |

## 기능

- 한국어·영어 두 언어. 같은 글은 앞머리의 `ref` 값으로 서로 연결됩니다.
- 다이어그램(Mermaid)과 수식(KaTeX). 쓰는 글에서만 불러오도록 앞머리로 켭니다.
- 다크 모드는 기기 설정을 따라갑니다.
- RSS, 사이트맵, SEO 메타 태그 자동 생성.
- 푸시할 때마다 GitHub Actions 의 **Build check** 가 빌드 성공 여부를 확인합니다.

## 나중에 개인 도메인을 붙인다면

1. 저장소 루트에 `CNAME` 파일을 만들고 도메인 한 줄만 적습니다.
2. 도메인 업체에서 DNS 를 GitHub Pages 로 향하게 합니다.
3. Settings → Pages 에서 **Enforce HTTPS** 를 켭니다.

`_config.yml` 의 `url` 도 새 도메인으로 바꿔주세요.
