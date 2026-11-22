"""Build a standalone, Netlify-ready copy of index.html.

The artifact version of index.html is a page fragment (the artifact host adds
<!doctype>, <html>, <head> and <body>). This script wraps it into a full HTML
document in site/index.html and zips the folder as netlify-site.zip.

Usage: python3 build_netlify.py
"""
import os
import zipfile

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "index.html")
OUT_DIR = os.path.join(ROOT, "site")
ZIP_PATH = os.path.join(ROOT, "netlify-site.zip")

FAVICON = (
    "data:image/svg+xml,"
    "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
    "%3Crect width='64' height='64' rx='14' fill='%23F3F6FF'/%3E"
    "%3Crect x='10' y='34' width='44' height='14' rx='4' fill='%23FFE45C'/%3E"
    "%3Ctext x='32' y='46' text-anchor='middle' font-family='Georgia,serif' "
    "font-weight='700' font-size='40' fill='%2314213D'%3EP%3C/text%3E%3C/svg%3E"
)

src = open(SRC, encoding="utf-8").read()

# Split the fragment: everything up to </style> belongs in <head>, the rest in <body>.
head_end = src.index("</style>") + len("</style>")
head_part = src[:head_end]
body_part = src[head_end:].lstrip("\n")

# The artifact-only meta tag has no meaning on a normal website.
head_part = head_part.replace(
    '<meta name="claude:viewport-fit-sides" content="cover">\n', ""
)

# Base rules the artifact host normally injects.
base_css = (
    "<style>[hidden]{display:none!important}"
    "img{max-width:100%}</style>\n"
)

doc = (
    "<!doctype html>\n"
    '<html lang="en">\n'
    "<head>\n"
    '<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    '<meta name="theme-color" content="#F3F6FF">\n'
    '<meta property="og:type" content="website">\n'
    '<meta property="og:title" content="Prep Pal | Nobody told me I\'d have to be my own counselor too.">\n'
    '<meta property="og:description" content="For students applying to US universities with no college counselor. '
    'Written by a senior from Ho Chi Minh City who just did it. Book a free 30-min call.">\n'
    '<link rel="icon" href="' + FAVICON + '">\n'
    + base_css
    + head_part
    + "\n</head>\n<body>\n"
    + body_part
    + "\n</body>\n</html>\n"
)

os.makedirs(OUT_DIR, exist_ok=True)
out_html = os.path.join(OUT_DIR, "index.html")
with open(out_html, "w", encoding="utf-8") as f:
    f.write(doc)

with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as z:
    z.write(out_html, "index.html")

print("wrote", out_html, os.path.getsize(out_html), "bytes")
print("wrote", ZIP_PATH, os.path.getsize(ZIP_PATH), "bytes")
