#!/usr/bin/env python3
"""초안 미리보기 한 장 만들기.

_drafts/ 의 글은 GitHub Pages 가 빌드하지 않아 공개 URL 이 없습니다.
그래서 CSS·손글씨 글꼴·표지 이미지를 전부 HTML 안에 넣어 한 장으로 만든 뒤,
아티팩트로 올려 글쓴이에게 링크를 건넵니다.

    jekyll build --drafts -d /tmp/site-drafts
    python3 tools/draft-preview.py /tmp/site-drafts \\
        /tmp/site-drafts/ko/YYYY/MM/DD/<슬러그>/index.html /tmp/draft.html
"""
import base64, pathlib, re, sys

site = pathlib.Path(sys.argv[1])          # 빌드된 사이트 (jekyll build --drafts)
page = pathlib.Path(sys.argv[2])          # 그 안의 index.html
out  = pathlib.Path(sys.argv[3])
draft_name = sys.argv[4] if len(sys.argv) > 4 else page.parent.name

html = page.read_text()
css = (site / "assets/css/style.css").read_text()

# 글꼴을 data URI 로 박아 넣습니다 (다이어그램 손글씨)
for name in ["gaegu-latin-400", "gaegu-korean-400"]:
    f = site / f"assets/fonts/{name}.woff2"
    if not f.exists():
        continue
    uri = "data:font/woff2;base64," + base64.b64encode(f.read_bytes()).decode()
    css = css.replace(f"/assets/fonts/{name}.woff2", uri)

# 표지 이미지도 data URI 로 (글마다 다르므로 HTML 에서 찾아냅니다)
for rel in set(re.findall(r'src="(/assets/images/[^"]+)"', html)):
    f = site / rel.lstrip("/")
    if not f.exists():
        continue
    mime = "image/svg+xml" if f.suffix == ".svg" else f"image/{f.suffix.lstrip('.')}"
    uri = f"data:{mime};base64," + base64.b64encode(f.read_bytes()).decode()
    html = html.replace(rel, uri)

# 외부 CSS 링크를 인라인 <style> 로 바꾸고, JS 는 뺍니다 (글 페이지에선 쓰지 않습니다)
html = re.sub(r'<link[^>]*href="/assets/css/style\.css"[^>]*>',
              "<style>\n" + css + "\n</style>", html)
html = re.sub(r'<script[^>]*src="/assets/js/site\.js"[^>]*>\s*</script>', "", html)

# 사이트 안쪽 링크는 미리보기에서 갈 곳이 없으니 죽입니다
html = re.sub(r'href="/(?!/)[^"]*"', 'href="#"', html)

# 초안이라는 것을 페이지 위에 띄웁니다
banner = ('<div style="position:sticky;top:0;z-index:99;background:#131A2E;color:#fff;'
          'font:600 13px/1.5 ui-sans-serif,system-ui,sans-serif;padding:9px 16px;text-align:center">'
          '초안 미리보기 &middot; 아직 발행되지 않았습니다 &middot; '
          f'<code style="background:#ffffff22;padding:1px 6px;border-radius:4px">{draft_name}</code>'
          '</div>')
html = html.replace("<body", "<body", 1)
html = re.sub(r"(<body[^>]*>)", r"\1" + banner, html, count=1)

out.write_text(html)
print(f"{out}  {len(html):,} bytes")
