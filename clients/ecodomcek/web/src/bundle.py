#!/usr/bin/env python3
"""Bundle the whole built site into ONE self-contained HTML file.

    python3 src/build.py && python3 src/bundle.py   →  dist/ecodomcek.html

Every page's <main> travels as a <template>; the router swaps templates
instead of fetching documents and uses the hash for history, so the file
works from file:// with no server. All assets are inlined as data URIs.
"""
import base64
import mimetypes
import pathlib
import re

ROOT = pathlib.Path(__file__).parent.parent
DIST = ROOT / "dist"
ASSETS = DIST / "assets"
OUT = DIST / "ecodomcek.html"


def data_uri(name: str) -> str:
    p = ASSETS / name
    mime = mimetypes.guess_type(name)[0] or "application/octet-stream"
    if name.endswith(".webp"):
        mime = "image/webp"
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode("ascii")


def inline_assets(text: str) -> str:
    return re.sub(r'assets/([A-Za-z0-9_.\-]+\.(?:jpg|jpeg|png|webp|svg))',
                  lambda m: data_uri(m.group(1)), text)


def main() -> None:
    pages = sorted(p for p in DIST.glob("*.html") if p.name not in ("artifact-index.html", OUT.name))
    index = (DIST / "index.html").read_text(encoding="utf-8")
    css = (ASSETS / "site.css").read_text(encoding="utf-8")
    js = (ASSETS / "site.js").read_text(encoding="utf-8")
    gsap = (ASSETS / "gsap.min.js").read_text(encoding="utf-8")
    st = (ASSETS / "ScrollTrigger.min.js").read_text(encoding="utf-8")

    # router in bundle mode: templates instead of fetch, hash instead of pushState
    js = js.replace("  var cache = {}, busy = false;", """  var cache = {}, busy = false;
  var BUNDLE = !!document.querySelector('template[data-file]');
  function fromTemplate(url) {
    var file = url.pathname.split('/').pop() || 'index.html';
    if (url.hash && /^#p\\//.test(url.hash)) file = url.hash.slice(3);
    var t = document.querySelector('template[data-file="' + file + '"]');
    if (!t) return null;
    var doc = document.implementation.createHTMLDocument(t.dataset.title || '');
    var d = doc.createElement('meta'); d.setAttribute('name', 'description');
    d.setAttribute('content', t.dataset.desc || ''); doc.head.appendChild(d);
    doc.body.appendChild(t.content.cloneNode(true));
    return doc;
  }""")
    js = js.replace("""  function fetchPage(url) {
    var key = url.pathname;
    if (cache[key]) return Promise.resolve(cache[key]);""", """  function fetchPage(url) {
    if (BUNDLE) { var td = fromTemplate(url); return td ? Promise.resolve(td) : Promise.reject(new Error('no page')); }
    var key = url.pathname;
    if (cache[key]) return Promise.resolve(cache[key]);""")
    js = js.replace("    if (push) history.pushState({}, '', url.href);",
                    "    if (push) { if (BUNDLE) { var f = (url.hash && /^#p\\//.test(url.hash)) ? url.hash.slice(3) : 'index.html'; "
                    "try { history.pushState({}, '', '#p/' + f); } catch (e) { location.hash = '#p/' + f; } } "
                    "else history.pushState({}, '', url.href); }")
    js = js.replace("""    if (url.hash) {
      var t = document.querySelector(url.hash);
      if (t) t.scrollIntoView();
    }""", """    if (url.hash && !/^#p\\//.test(url.hash)) {
      try { var t = document.querySelector(url.hash); if (t) t.scrollIntoView(); } catch (e) {}
    }""")
    js = js.replace("    var page = url.pathname.split('/').pop() || 'index.html';\n    document.querySelectorAll('header nav a')",
                    "    var page = url.pathname.split('/').pop() || 'index.html';\n    if (BUNDLE && url.hash && /^#p\\//.test(url.hash)) page = url.hash.slice(3);\n    document.querySelectorAll('header nav a')")
    js = js.replace("""  function internal(a) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
    var href = a.getAttribute('href');""", """  function internal(a) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
    var href = a.getAttribute('href');
    if (BUNDLE && href && /\\.html(#.*)?$/.test(href) && !/^[a-z]+:/i.test(href)) {
      var u = new URL(location.href); u.hash = '#p/' + href.split('#')[0]; return u;
    }""")
    js = js.replace("""  function samePage(url) {
    return url.pathname === location.pathname;
  }""", """  function samePage(url) {
    if (BUNDLE) return (url.hash || '#p/index.html') === (location.hash || '#p/index.html');
    return url.pathname === location.pathname;
  }""")
    js = js.replace("""  addEventListener('popstate', function () {
    go(new URL(location.href), false);
  });""", """  addEventListener('popstate', function () {
    go(new URL(location.href), false);
  });
  if (BUNDLE && /^#p\\//.test(location.hash) && location.hash !== '#p/index.html') {
    var first = fromTemplate(new URL(location.href));
    if (first) swap(first, new URL(location.href), false);
  }""")
    # the in-page anchor rule must not swallow hash-routed pages
    js = js.replace("    if (samePage(url) && url.hash) return;          // anchors scroll normally",
                    "    if (!BUNDLE && samePage(url) && url.hash) return;   // anchors scroll normally")

    templates = ""
    for p in pages:
        html = p.read_text(encoding="utf-8")
        title = re.search(r"<title>(.*?)</title>", html, re.S).group(1)
        desc = re.search(r'<meta name="description" content="(.*?)">', html).group(1)
        mainm = re.search(r"(<main id=\"main\".*?</main>)", html, re.S).group(1)
        templates += (f'<template data-file="{p.name}" data-title="{title}" data-desc="{desc}">'
                      f"{mainm}</template>\n")

    out = index
    out = out.replace('<link rel="stylesheet" href="assets/site.css">', f"<style>{inline_assets(css)}</style>")
    out = out.replace('<script src="assets/gsap.min.js"></script>', f"<script>{gsap}</script>")
    out = out.replace('<script src="assets/ScrollTrigger.min.js"></script>', f"<script>{st}</script>")
    out = out.replace('<script src="assets/site.js"></script>', f"<script>{js}</script>")
    out = out.replace('<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">',
                      f'<link rel="icon" href="{data_uri("favicon.svg")}" type="image/svg+xml">')
    out = out.replace("</main>", "</main>\n" + templates, 1)
    out = inline_assets(out)
    OUT.write_text(out, encoding="utf-8")
    print(f"{OUT.name}: {OUT.stat().st_size / 1024 / 1024:.1f} MB, {len(pages)} pages bundled")


if __name__ == "__main__":
    main()
