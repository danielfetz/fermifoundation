#!/usr/bin/env python3
"""The etching as it shows through the deck's thin paper on the Play page: assets/img/forum-piranesi-deck.webp.

The deck's cards are cream paper with the table's etching (forum-piranesi.webp) faintly showing through them
(.back::before in assets/play.css): the etching in grey, its contrast raised by 30%, multiplied into the card at 15%.
Done by the browser, with a filter and an opacity, that was slow for phones to draw, and Chrome drew the cards again on
every frame while they moved. So it's done here, once: this image is that grey, already raised and faded, which the
card multiplies in at full strength, giving the same colours.

Run it after changing the etching, from anywhere:

    python3 scripts/deck_etching.py

It needs Pillow, with WebP.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'assets' / 'img' / 'forum-piranesi.webp'
OUT = ROOT / 'assets' / 'img' / 'forum-piranesi-deck.webp'

# As CSS has them: grayscale(1) takes the luminance (with these weights), contrast(1.3) spreads it from the middle grey,
# and the card shows 15% of it, multiplied in
LUMINANCE = (0.2126, 0.7152, 0.0722, 0)
CONTRAST = 1.3
STRENGTH = 0.15


def through_paper(level):
    grey = min(1.0, max(0.0, (level / 255 - 0.5) * CONTRAST + 0.5))
    return round(255 * (1 - STRENGTH * (1 - grey)))


def main():
    grey = Image.open(SOURCE).convert('RGB').convert('L', LUMINANCE)
    deck = grey.point([through_paper(level) for level in range(256)])
    # (Saved as RGB: WebP has no grey. Quality 80 differs from the browser's own by about a level on average.)
    deck.convert('RGB').save(OUT, 'WEBP', quality=80, method=6)
    print(f'{OUT.relative_to(ROOT)}: {deck.width} × {deck.height}, {OUT.stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main()
