# fermi.org

The Fermi Foundation website: plain HTML and CSS, no build step.

- `index.html`: the home page, about hosting Fermi Poker tournaments
- `how-to-play/`, `host/`, `sponsor/`, `about/`: the inner pages
- `assets/site.css`: all styles; `assets/site.js`: the mobile menu and the Host sign-up form
- `assets/img/`, `assets/fonts/` (PT Sans and PT Serif, self-hosted), `files/` (the rule sheet PDF)
- The fonts' Latin files (`fermi-*.woff2`) are PT Sans and PT Serif without their kerning around spaces, which made
  the gap after a period narrower than a word space. They were made with fontTools by taking the space and no-break
  space out of the kerning, and renamed (Fermi Sans, Fermi Serif) because the Open Font License reserves the
  original names for unmodified fonts. The `latin-ext` files are unchanged.
- `assets/img/edge-top.svg`, `edge-bottom.svg`: the torn edges of the paper; `enrico-fermi.webp` is the photo,
  `enrico-fermi-paper.svg` the paper cutout behind it
- `play/`: the Play page, which shows the question, hint and answer cards on a phone, tablet or laptop instead of
  printed cards. Its questions are in `play/questions.js` (sample questions for now); its styles and script are
  `assets/play.css` and `assets/play.js`. Its cards use the printed cards' fonts, IBM Plex Sans and IBM Plex Mono
  (`assets/fonts/ibm-plex-*.woff2`, Open Font License, self-hosted as Google Fonts serves them). It isn't in the menu
  yet and is kept out of search engines (`noindex`) while it's being tried out. Its Rules button opens a copy of the
  rule sheet (the PDF's text without its introduction and example), so when the rules change, change it along with
  the PDF and How to play. The ⋯ menu skips a question or goes back to the last one, and while the page is open it
  keeps the screen on. Zooming in is turned off there, as the table is laid out for the whole screen: in the
  viewport tag, with `touch-action` in `play.css`, and for Safari's pinch, which can ignore both, in `play.js`. The deck's cards are thin cream paper with the table's etching showing through them, lined
  up with it: `play.js` knows the etching's size and place on the table (`ETCHING`), so change it along with the
  `.rome` background in `play.css`.

The menu and footer are repeated on every page (except Play, which has neither), so change them on all five.

Link previews (WhatsApp, iMessage, LinkedIn and so on) come from the `og:` tags in each page's `<head>`. Every page
uses the same picture, `assets/img/link-preview.jpg` (1200 × 630): a screenshot of the top of the home page with
the menu hidden and the headline set larger. The tags need absolute URLs, so they name https://fermi.org.

To preview, run `python3 -m http.server` here and open http://localhost:8000.

Page views are counted with Vercel Web Analytics, through the two script tags at the end of each page's `<head>`.
Vercel serves its script only on the deployment, so a local preview shows a harmless 404 for
`/_vercel/insights/script.js`.

The Enrico Fermi photo is a U.S. Department of Energy photo (c. 1943–49) in the public domain.
The Rome behind him is Giovanni Battista Piranesi's etching of the Forum (Veduta di Campo Vaccino, c. 1775),
[public domain at the Met](https://www.metmuseum.org/art/collection/search/363433), cropped and re-inked in warm graphite.
