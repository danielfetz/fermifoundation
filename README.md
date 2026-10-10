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

The menu and footer are repeated on every page, so change them on all five.

To preview, run `python3 -m http.server` here and open http://localhost:8000.

Page views are counted with Vercel Web Analytics, through the two script tags at the end of each page's `<head>`.
Vercel serves its script only on the deployment, so a local preview shows a harmless 404 for
`/_vercel/insights/script.js`.

The Enrico Fermi photo is a U.S. Department of Energy photo (c. 1943–49) in the public domain.
The Rome behind him is Giovanni Battista Piranesi's etching of the Forum (Veduta di Campo Vaccino, c. 1775),
[public domain at the Met](https://www.metmuseum.org/art/collection/search/363433), cropped and re-inked in warm graphite.
