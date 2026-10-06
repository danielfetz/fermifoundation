# fermi.org

The Fermi Foundation website: plain HTML and CSS, no build step.

- `index.html`: the home page, about hosting Fermi Poker tournaments
- `how-to-play/`, `organize/`, `about/`: the inner pages
- `assets/site.css`: all styles; `assets/site.js`: the mobile menu
- `assets/img/`, `assets/fonts/` (PT Sans and PT Serif, self-hosted), `files/` (the PDFs)

The menu and footer are repeated on every page, so change them on all four.

To preview, run `python3 -m http.server` here and open http://localhost:8000.

The Enrico Fermi photo is a U.S. Department of Energy photo (c. 1943–49) in the public domain.
The pencil drawing of Rome behind him is made from [Roma-vista11.jpg](https://commons.wikimedia.org/wiki/File:Roma-vista11.jpg)
by Mac, CC BY-SA 2.5; the home page footer credits it.
