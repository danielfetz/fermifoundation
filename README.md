# fermi.org

The Fermi Foundation website: plain HTML and CSS, no build step.

- `index.html`: the home page, about hosting Fermi Poker tournaments
- `how-to-play/`, `host/`, `sponsor/`, `about/`, `updates/`: the inner pages (`updates/` is Get updates, below)
- `api/`: the two Vercel Functions behind Get updates (below), the site's only code that runs on a server
- `assets/site.css`: all styles; `assets/site.js`: the mobile menu, the Host sign-up form and Get updates
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
  rule sheet (the PDF's text without its introduction and example), so when the rules change, change it along with the
  PDF and How to play. The ⋯ menu skips a question, always for one not seen yet, or looks back at the one before (only
  that one, and only to look at it: the menu and the deck then take you back to the question in play). While the page
  is open, it keeps the screen on. Zooming in is turned off there, as the table is laid out for the whole screen: in
  the viewport tag, with `touch-action` in `play.css`, and for Safari's pinch, which can ignore both, in `play.js`.
  The deck's cards are thin cream paper with the table's etching showing through them, lined up with it: `play.js`
  knows the etching's size and place on the table (`ETCHING`), so change it along with the `.rome` background in
  `play.css`.

The menu and footer are repeated on every page (except Play, which has neither), so change them on all six.

The home page's FAQ folds open in two columns that read row by row, as a grid would: the odd questions are in the
left column, the even ones in the right (and the last one, the 13th, at the bottom of the right column), so that
opening one only moves the questions under it. Each question also has its number as `style="order: …"`, which puts
them back in turn on phones, where it's one list. So to add or move a question, change the columns and the numbers.

Get updates: people leave their email to hear when the questions and materials are ready, and whenever there's news about tournaments.
The form is on the home page twice (under the introduction and at the end), on its own page (`updates/`), and in a
pop-up that "Get updates" in the menu opens (`assets/site.js`). The forms ask only for the email; the pop-up also asks
what they are ("I'm a…", optional). The pop-up also comes up by itself once: on laptops
when the mouse leaves the page at the top, after 10 seconds on it; on phones and tablets after 30 seconds on the page.
Then not again for 30 days, and never after signing up or sending the Host form (the browser remembers this as
`fermi-updates` in local storage); never on the Play page or Get updates itself.

The forms send to `api/subscribe.js`, which adds the address to the contacts in Resend (resend.com), not yet
subscribed, and emails a link to confirm it, from contact@fermi.org. The link (`api/confirm.js`, good for a week)
subscribes them, puts them into the segments "Fermi Poker updates" (everyone) and "High school students", "University
students", "Teachers and professors" or "Others" (what they said they are; "Students" from before high school and
university were asked apart), emails contact@fermi.org about the new sign-up, and shows the
Get updates page saying so. Both need Resend's key as `RESEND_API_KEY` in the project's environment variables on
Vercel, and fermi.org verified in Resend. To send news, write a Broadcast in Resend to a segment; Resend adds the
link to unsubscribe. Without JavaScript the forms still work: the Get updates page shows what happened (`#sent`,
`#confirmed`, `#invalid`, `#failed`).

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
