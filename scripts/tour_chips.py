#!/usr/bin/env python3
"""The poker chips in the pictures of the Play page's tour (play/index.html, #tour): drawn here, written into the page.

Each chip is a cylinder seen from a little above: its edge curves at the bottom, with white inserts that bend and
narrow towards the sides, a shading across the stack, and a soft shadow on the table. Two drawings, used as SVG
symbols: three stacks (#tour-chips, on the first slide) and the pot, a loose pile of short stacks and single chips
(#tour-pot, on the betting slide). Change the colours or the piles below, then run it, from anywhere:

    python3 scripts/tour_chips.py

It needs nothing but Python 3. It rewrites the tour's <svg class="tour__defs"> in play/index.html.
"""
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / 'play' / 'index.html'

# A chip's half width and the depth of its ellipse seen from above, and its thickness
RX, RY, T = 30, 10.5, 8.5
COLOURS = {'r': '#9c4a17', 'k': '#1b232a', 'c': '#d9cdb4'}
# Each pile: (centre, where its foot stands, its chips' colours from the bottom up), from the back to the front
STACKS = [(86, 76, 'rrrrrrr'), (38, 86, 'ccccc'), (133, 89, 'kkkk')]
POT = [(118, 58, 'ccrr'), (74, 66, 'rcr'), (160, 70, 'rc'), (40, 80, 'c'), (104, 84, 'r'), (178, 88, 'c')]


def num(v):
    return f'{v:.2f}'.rstrip('0').rstrip('.')


def point(cx, top, height, angle):
    # A point on a chip's front edge: angle 0 is its right side, pi its left, the front in between
    return cx + RX * math.cos(angle), top + height + RY * math.sin(angle)


def band(cx, top, h1, h2, a, b):
    # The front of a chip (or a stack) between two heights, from one angle to another
    x1, y1 = point(cx, top, h1, a)
    x2, y2 = point(cx, top, h1, b)
    x3, y3 = point(cx, top, h2, b)
    x4, y4 = point(cx, top, h2, a)
    return (f'M{num(x1)} {num(y1)}A{RX} {RY} 0 0 1 {num(x2)} {num(y2)}L{num(x3)} {num(y3)}'
            f'A{RX} {RY} 0 0 0 {num(x4)} {num(y4)}Z')


def pile(cx, foot, colours):
    out = []
    for k, c in enumerate(colours):
        top = foot - (k + 1) * T
        out.append(f'<path d="{band(cx, top, 0, T, 0, math.pi)}" fill="{COLOURS[c]}" stroke="rgba(0,0,0,.28)" stroke-width=".7"/>')
        inserts = ''.join(band(cx, top, 1.7, T - 1.7, math.radians(a - 7), math.radians(a + 7)) for a in (15, 45, 75, 105, 135, 165))
        out.append(f'<path d="{inserts}" fill="#fffef8" opacity=".9"/>')
    top = foot - len(colours) * T
    out.append(f'<path d="{band(cx, top, 0, len(colours) * T, 0, math.pi)}" fill="url(#tour-chip-shade)"/>')
    out.append(f'<ellipse cx="{num(cx)}" cy="{num(top)}" rx="{RX}" ry="{RY}" fill="{COLOURS[colours[-1]]}" stroke="rgba(0,0,0,.28)" stroke-width=".7"/>')
    out.append(f'<ellipse cx="{num(cx)}" cy="{num(top)}" rx="18" ry="6.3" fill="none" stroke="#fffef8" stroke-width="1.4" stroke-dasharray="3.4 2.6"/>')
    return ''.join(out)


def drawing(piles):
    # The shadows first, all of them, so that no pile's shadow falls on another pile
    shadows = ''.join(f'<ellipse cx="{cx}" cy="{foot + 2}" rx="{RX + 6}" ry="{RY + 4}" fill="url(#tour-chip-shadow)"/>' for cx, foot, _ in piles)
    return shadows + ''.join(pile(*p) for p in piles)


def main():
    defs = ('<defs><linearGradient id="tour-chip-shade" x1="0" x2="1" y1="0" y2="0">'
            '<stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".32" stop-color="#fff" stop-opacity=".1"/>'
            '<stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>'
            '<radialGradient id="tour-chip-shadow"><stop offset="0" stop-color="#1e1608" stop-opacity=".34"/>'
            '<stop offset=".6" stop-color="#1e1608" stop-opacity=".14"/><stop offset="1" stop-color="#1e1608" stop-opacity="0"/></radialGradient></defs>')
    svg = (f'<svg class="tour__defs" aria-hidden="true">{defs}'
           f'<symbol id="tour-chips" viewBox="0 0 172 106">{drawing(STACKS)}</symbol>'
           f'<symbol id="tour-pot" viewBox="0 4 214 100">{drawing(POT)}</symbol></svg>')
    page = PAGE.read_text(encoding='utf-8')
    page, found = re.subn(r'<svg class="tour__defs" aria-hidden="true">.*?</svg>', lambda _: svg, page, count=1, flags=re.S)
    if not found:
        raise SystemExit('No <svg class="tour__defs"> in play/index.html')
    PAGE.write_text(page, encoding='utf-8')
    print(f'{PAGE.relative_to(ROOT)}: the chips, {len(svg) / 1024:.0f} KB of SVG')


if __name__ == '__main__':
    main()
