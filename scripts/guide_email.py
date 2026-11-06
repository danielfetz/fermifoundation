#!/usr/bin/env python3
"""The guide (how-to-play/index.html) as it goes into the email with the guide, which api/guide.js sends.

Reads the page and writes api/_guide-email.js: the guide's title, who wrote it, and its text, in simple HTML with the
styles on each element (as email apps want them) and as plain text. Run it after changing the guide, from anywhere:

    python3 scripts/guide_email.py

It needs nothing but Python 3. What's hidden on the page (the sample question) stays out; the parts that fold open
(the variations) are open; footnote numbers stay as [1] and the notes come at the end. Links to the site are written
with {{site}} in place of the address, which api/guide.js fills in.
"""
import json
import re
from html import escape
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / 'how-to-play' / 'index.html'
OUT = ROOT / 'api' / '_guide-email.js'

INK = '#2b251f'
SOFT = '#6b6158'
LINE = '#e6dfd3'
SANS = "Arial, 'Helvetica Neue', Helvetica, sans-serif"
SERIF = "Georgia, 'Times New Roman', serif"
P = f'margin:0 0 12px;font-family:{SANS};font-size:16px;line-height:1.55;color:{INK}'
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}


class Node:
    def __init__(self, tag, attrs, parent):
        self.tag = tag
        self.attrs = dict(attrs)
        self.children = []
        self.parent = parent

    def has(self, name):
        return name in (self.attrs.get('class') or '').split()

    @property
    def hidden(self):
        return 'hidden' in self.attrs

    def elements(self):
        return [c for c in self.children if isinstance(c, Node)]

    def find(self, test):
        for c in self.elements():
            if test(c):
                return c
            found = c.find(test)
            if found:
                return found
        return None

    def find_all(self, test, out=None):
        out = [] if out is None else out
        for c in self.elements():
            if test(c):
                out.append(c)
            c.find_all(test, out)
        return out

    def text(self):
        return ''.join(c if isinstance(c, str) else c.text() for c in self.children)


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('#root', [], None)
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.cur)
        self.cur.children.append(node)
        if tag not in VOID:
            self.cur = node

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        node = self.cur
        while node is not self.root and node.tag != tag:
            node = node.parent
        if node is not self.root:
            self.cur = node.parent

    def handle_data(self, data):
        self.cur.children.append(data)


def squeeze(text):
    # Runs of spaces and line breaks as one space; the page's no-break spaces stay
    return re.sub(r'[ \t\n\r\f]+', ' ', text)


def url(href):
    if href.startswith('#'):
        return '{{site}}/how-to-play/' + href
    if href.startswith('/'):
        return '{{site}}' + href
    return href


def inline(node, link_color=INK):
    """A paragraph's words, links and marks: (HTML, text)."""
    h, t = '', ''
    for c in node.children:
        if isinstance(c, str):
            s = squeeze(c)
            h += escape(s, quote=False)
            t += s
            continue
        if c.hidden or c.tag in ('svg', 'script') or c.has('fn-back') or c.has('sr-only'):
            continue
        if c.tag == 'sup' and c.has('fn-ref'):
            n = re.sub(r'\D', '', c.text())
            h += f'<sup style="font-size:11px;color:{SOFT}">[{n}]</sup>'
            t += f'[{n}]'
            continue
        ih, it = inline(c, link_color)
        if c.tag == 'a':
            u = url(c.attrs.get('href', ''))
            h += f'<a href="{escape(u)}" style="color:{link_color};text-decoration:underline">{ih}</a>'
            # In the text, the address after the words, unless the words are the address
            shown = u.replace('{{site}}', 'https://fermi.org')
            t += it if u.startswith('mailto:') or it.strip() in shown else f'{it} ({u})'
        elif c.tag in ('b', 'strong'):
            h += f'<b>{ih}</b>'
            t += it
        elif c.tag == 'sup':
            h += f'<sup>{ih}</sup>'
            t += '^' + it
        elif c.has('section__aside'):
            h += f'<br><span style="font-family:{SANS};font-size:14px;color:{SOFT}">{ih.strip()}</span>'
            t += ' ' + it.strip()
        else:
            h += ih
            t += it
    return h, t


def block_or_inline(node):
    if any(c.tag in ('p', 'ul', 'ol', 'div') for c in node.elements()):
        h, t = blocks(node)
        return ''.join(h), '\n'.join(t)
    h, t = inline(node)
    return h.strip(), t.strip()


def blocks(node, h=None, t=None):
    """The parts of the page, one after another: (HTML pieces, text lines)."""
    h = [] if h is None else h
    t = [] if t is None else t
    for c in node.elements():
        if c.hidden or c.has('sr-only'):
            continue
        if c.tag == 'h2':
            ih, it = inline(c)
            h.append(f'<h2 style="margin:36px 0 12px;font-family:{SERIF};font-size:26px;font-weight:normal;line-height:1.2;color:{INK}">{ih.strip()}</h2>')
            t.append(f'\n{it.strip().upper()}\n')
        elif c.tag == 'h3' and c.has('section__step'):
            ih, it = inline(c)
            h.append(f'<h3 style="margin:26px 0 8px;font-family:{SERIF};font-size:20px;font-weight:normal;line-height:1.3;color:{INK}">{ih.strip()}</h3>')
            t.append(f'\n{it.strip()}\n')
        elif c.tag == 'p':
            ih, it = inline(c)
            h.append(f'<p style="{P}">{ih.strip()}</p>')
            t.append(it.strip() + '\n')
        elif c.tag in ('ul', 'ol'):
            items = [block_or_inline(li) for li in c.elements() if li.tag == 'li']
            h.append(f'<{c.tag} style="margin:0 0 12px;padding-left:22px;font-family:{SANS};font-size:16px;line-height:1.55;color:{INK}">'
                     + ''.join(f'<li style="margin:0 0 6px">{ih}</li>' for ih, _ in items) + f'</{c.tag}>')
            t.extend(f'{f"{i}." if c.tag == "ol" else "-"} {it}' for i, (_, it) in enumerate(items, 1))
            t.append('')
        elif c.has('sticky-note'):
            ih, it = blocks(c)
            h.append(f'<div style="margin:16px 0 20px;padding:16px 18px 6px;background:#f4efe6;border-radius:10px">{"".join(ih)}</div>')
            t.extend(it)
        elif c.has('box--quote'):
            ih, it = blocks(c.find(lambda n: n.has('box__body')))
            h.append(f'<div style="margin:10px 0 18px;padding:16px 18px 6px;background:#f8f5ef;border-left:3px solid #d6ccbb">{"".join(ih)}</div>')
            t.extend('  ' + line if line else line for line in it)
        elif c.tag == 'details' and c.has('box--fold'):
            sh, st = inline(c.find(lambda n: n.tag in ('h3', 'h4')))
            ih, it = blocks(c.find(lambda n: n.has('box__body')))
            h.append(f'<div style="margin:10px 0 14px;padding:14px 16px 4px;border:1px solid {LINE};border-radius:8px">'
                     f'<p style="{P};font-weight:bold">{sh.strip()}</p>{"".join(ih)}</div>')
            t.extend([f'* {st.strip()}', *it, ''])
        elif c.has('table-box'):
            rows = [[squeeze(cell.text()).strip() for cell in row.elements()] for row in c.find_all(lambda n: n.tag == 'tr')]
            h.append(f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;border-collapse:collapse;font-family:{SANS};font-size:15px;color:{INK}">'
                     + ''.join('<tr>' + ''.join(f'<td style="padding:6px 28px 6px 0;border-bottom:1px solid {INK if i == 0 else LINE};{"font-weight:bold" if i == 0 else ""}">{escape(v, quote=False)}</td>' for v in row) + '</tr>'
                               for i, row in enumerate(rows)) + '</table>')
            t.extend([*(': '.join(row) for row in rows), ''])
        elif c.tag == 'section' and c.has('footnotes'):
            notes = [inline(li, SOFT) for li in c.find_all(lambda n: n.tag == 'li')]
            h.append(f'<p style="margin:32px 0 8px;padding-top:16px;border-top:1px solid {LINE};font-family:{SANS};font-size:14px;font-weight:bold;color:{SOFT}">Footnotes</p>'
                     f'<ol style="margin:0;padding-left:22px;font-family:{SANS};font-size:14px;line-height:1.5;color:{SOFT}">'
                     + ''.join(f'<li style="margin:0 0 8px">{ih.strip()}</li>' for ih, _ in notes) + '</ol>')
            t.extend(['\nFOOTNOTES\n', *(f'[{i}] {it.strip()}' for i, (_, it) in enumerate(notes, 1))])
        else:
            blocks(c, h, t)
    return h, t


def main():
    tree = Tree()
    tree.feed(PAGE.read_text(encoding='utf-8'))
    root = tree.root
    hero = root.find(lambda n: n.has('page-hero'))
    title = squeeze(hero.find(lambda n: n.tag == 'h1').text()).strip()
    byline_html, byline_text = inline(hero.find(lambda n: n.has('page-hero__byline')))
    page = root.find(lambda n: n.has('doc')).find(lambda n: n.has('page'))
    h, t = blocks(page)
    text = re.sub(r'\n{3,}', '\n\n', '\n'.join(t)).strip() + '\n'
    data = {
        'title': title,
        'bylineHtml': byline_html.strip(),
        'bylineText': byline_text.strip(),
        'html': '\n'.join(h),
        'text': text,
    }
    OUT.write_text(
        '// The guide (how-to-play/index.html) for the email with the guide (api/guide.js), made by\n'
        '// scripts/guide_email.py: don\'t change it here; change the guide, then run `python3 scripts/guide_email.py`.\n'
        '// {{site}} stands for the site\'s address, which api/guide.js fills in.\n'
        f'module.exports = {json.dumps(data, ensure_ascii=False, indent=2)}\n',
        encoding='utf-8',
    )
    print(f'{OUT.relative_to(ROOT)}: {len(data["html"]):,} characters of HTML, {len(text.split()):,} words')


if __name__ == '__main__':
    main()
