#!/usr/bin/env python3
"""index.html で使っている文字だけを含むフォント（woff2）を Google Fonts から取得する。

スライドの文言を変えたら、リポジトリ直下で次を実行して作り直す：
    python3 scripts/build-fonts.py
"""

import re
import string
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML_PATH = ROOT / "index.html"
FONT_DIR = ROOT / "assets" / "fonts"
CSS_PATH = ROOT / "css" / "fonts.css"

FONTS = [
    ("Shippori Mincho B1", 700, "shippori-mincho-b1-700"),
    ("Zen Kaku Gothic New", 400, "zen-kaku-gothic-new-400"),
    ("Zen Kaku Gothic New", 500, "zen-kaku-gothic-new-500"),
]

# woff2 を返してもらうため、最新ブラウザの User-Agent を名乗る
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)


class TextCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.chars = set()
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self._skip_depth += 1
        for name, value in attrs:
            if name in ("alt", "aria-label") and value:
                self.chars.update(value)

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self._skip_depth:
            self._skip_depth -= 1

    def handle_data(self, data):
        if not self._skip_depth:
            self.chars.update(data)


def collect_text() -> str:
    collector = TextCollector()
    collector.feed(HTML_PATH.read_text(encoding="utf-8"))
    chars = collector.chars | set(string.ascii_letters + string.digits + string.punctuation)
    return "".join(sorted(c for c in chars if not c.isspace()))


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request) as response:
        return response.read()


def build_font(family: str, weight: int, filename: str, text: str) -> str:
    query = urllib.parse.urlencode({
        "family": f"{family}:wght@{weight}",
        "text": text,
        "display": "swap",
    })
    css = fetch(f"https://fonts.googleapis.com/css2?{query}").decode("utf-8")
    match = re.search(r"url\((https://[^)]+)\)", css)
    if not match:
        raise RuntimeError(f"フォントのURLが見つかりません: {family} {weight}")

    path = FONT_DIR / f"{filename}.woff2"
    path.write_bytes(fetch(match.group(1)))
    print(f"{path.relative_to(ROOT)}  {path.stat().st_size / 1024:.0f} KB")

    return (
        "@font-face {\n"
        f'  font-family: "{family}";\n'
        "  font-style: normal;\n"
        f"  font-weight: {weight};\n"
        "  font-display: swap;\n"
        f'  src: url("../assets/fonts/{filename}.woff2") format("woff2");\n'
        "}\n"
    )


def main():
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    text = collect_text()
    rules = [build_font(family, weight, filename, text) for family, weight, filename in FONTS]
    header = "/* scripts/build-fonts.py で生成。index.html で使う文字だけを含むサブセット */\n\n"
    CSS_PATH.write_text(header + "\n".join(rules), encoding="utf-8")
    print(f"{CSS_PATH.relative_to(ROOT)} を更新しました（{len(text)}文字）")


if __name__ == "__main__":
    main()
