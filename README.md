# fermi.org

The Fermi Foundation website: plain HTML and CSS, no build step.

- `index.html`: the home page, about hosting Fermi Poker tournaments
- `faq/`: the questions and the educational value, in tabs (below)
- `how-to-play/`, `host/`, `sponsor/`, `about/`, `updates/`: the inner pages (`updates/` is Get updates, below)
- `api/`: the two Vercel Functions behind Get updates (below), the site's only code that runs on a server
- `assets/site.css`: all styles; `assets/site.js`: the mobile menu, the Host sign-up form, Get updates, How to
  play's footnotes and the FAQ page's tabs
- `assets/img/`, `assets/fonts/` (PT Sans and PT Serif, and for the new design Mona Sans, all self-hosted),
  `files/` (the rule sheet PDF, and the 63-question pack to print, with blank cards for your own questions on its last
  page)
- The fonts' Latin files (`fermi-sans-*.woff2`, `fermi-serif-*.woff2`) are PT Sans and PT Serif without their
  kerning around spaces, which made the gap after a period narrower than a word space. They were made with fontTools by
  taking the space and no-break space out of the kerning, and renamed (Fermi Sans, Fermi Serif) because the Open Font
  License reserves the original names for unmodified fonts. The `latin-ext` files are unchanged.
- `mona-sans-latin.woff2` is Mona Sans (Open Font License, unmodified), the variable file with every weight and width
  (Fontsource's "standard" Latin file). `fermi-logo.woff2` is Mona Sans fixed at weight 600 and width 125%, with only
  the letters of "Fermi Poker", for the logo on every page (1 KB); add any letter the logo gains. It was made with
  fontTools (instancer and subset) and renamed Fermi Logo, as "Mona" is a Reserved Font Name.
- `assets/img/edge-top.svg`, `edge-bottom.svg`: the torn edges of the paper; `rome-blueprint.webp` the header of the
  home page and How to play, Piranesi's Forum (`forum-piranesi.webp`) as a blueprint, its lines light on blue, and
  `rome-blueprint-phone.webp` the strip of it that phones show; `faq-hero.webp` the poker chips for the FAQ page's
  header, darkened there in CSS; `start-*.webp` the pictures on the cards under the home page's Learn more and get
  involved (the chips, the players from the Fermi Poker box, the blueprint Rome and Enrico Fermi), in the header's
  blue; `enrico-fermi.webp` is a photo of Fermi that stood on the home page before (the About card's picture is made
  from it), with `enrico-fermi-paper.svg` the paper cutout behind him (neither is on a page for now)
- `play/`: the Play page, which shows the question, hint and answer cards on a phone, tablet or laptop instead of
  printed cards. Its questions are in `play/questions.js`: the 63-question pack, in the order of the printed cards.
  Each device plays them in an order of its own, shuffled the first time and then kept. Rewording, adding, removing
  or reordering questions in the file starts every device again, in a new order (a hint or an answer can change
  without that). Its styles and script are
  `assets/play.css` and `assets/play.js`. Its cards use the printed cards' fonts, IBM Plex Sans and IBM Plex Mono
  (`assets/fonts/ibm-plex-*.woff2`, Open Font License, self-hosted as Google Fonts serves them). It isn't in the menu
  yet. Its Rules button opens the rules needed
  at the table, in the rule sheet's words (the PDF's text without its introduction and example, the game variants and
  the end of the game), so when the rules change, change it along with the PDF and How to play. The ⋯ menu skips a question, always for one not seen yet, or looks back at the one before (only
  that one, and only to look at it: the menu and the deck then take you back to the question in play). While the page
  is open, it keeps the screen on. Zooming in is turned off there, as the table is laid out for the whole screen: in
  the viewport tag, with `touch-action` in `play.css`, and for Safari's pinch, which can ignore both, in `play.js`.
  The deck's cards are thin cream paper with the table's etching showing through them, lined up with it: `play.js`
  knows the etching's size and place on the table (`ETCHING`), so change it along with the `.rome` background in
  `play.css`.

The menu and footer are repeated on every page (except Play, which has neither), so change them on all seven. On
wide screens the menu shows How to play, FAQ and Donate; the phone menu and the footer list every page. The home, FAQ
and How to play pages have the white menu bar (`nav--light`), with the name alone as the logo, links in the text as
blue words (underlined only under the mouse), and the navy footer (`footer--navy`), which has where to write in place
of the logo; the other pages keep the paper look for now.

How to play is the guide from LessWrong (https://www.lesswrong.com/posts/JFYvJqMaLw9nhfrur/fermi-poker): what you
need, an announcement, the rules to read aloud, an ante schedule and variations. It's in the new design: a blue
header (`page-hero`, with the home page's Rome, for the other inner pages to share) with the title, the introduction
and the rule sheet, then the guide on white (`.doc`), its column lined up with the title. The guide's parts keep
their classes from the paper look, and `.doc` gives them the new one. Its footnotes are numbers in the text that
lead to the notes at the bottom of the page. On wide screens `site.js` also sets each note in the margin beside its
line, and elsewhere shows it in place when its number is hovered over or tapped; from the keyboard, and without
JavaScript, a number leads to its note at the bottom. The worked sample question is still in the page, hidden, to
use later.

The FAQ page has three parts, General, Hosting and Educational value, each a list of questions that open in place.
`site.js` turns the parts into tabs named by their headings; without JavaScript they follow one another. A link to a
part (`/faq/#hosting`) opens its tab, and a link to a question (`/faq/#is-it-gambling`, its id made from its words)
opens its tab and the question.

The home page runs in bands: the header, Upcoming tournaments, the introduction (pale blue), Learn more and get
involved, and the mailing list (pale blue). Upcoming tournaments has one card for now, saying there are no public
tournaments and leading to the Host page; cards for real tournaments go in the same grid, three to a row, with the
date as `event__when`. Each card under Learn more and get involved is a link with a picture.

Get updates: people leave their email to hear when we release new question sets, and whenever there's other news
about Fermi Poker. The form is at the end of the home page (a second one, under the introduction, is hidden for now),
on its own page (`updates/`), and in a pop-up that "Get updates" in the phone menu and the footer opens
(`assets/site.js`). The forms ask only for the email; the pop-up also asks what they are ("I'm a…", optional). The
pop-up also comes up by itself once: on laptops when the mouse leaves the page at the top, after 10 seconds on it; on
phones and tablets after 30 seconds on the page. Then not again for 30 days, and never after signing up or sending the
Host form (the browser remembers this as `fermi-updates` in local storage); never on the Play page or Get updates
itself. The pop-up is off for now, to come back in the new design (`UPDATES_POPUP` in `site.js`): while it's off, it
never comes up by itself, and "Get updates" leads to the Get updates page.

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

The poker chips photo came from the site's owner. The Enrico Fermi photo is a U.S. Department of Energy photo
(c. 1943–49) in the public domain. The Rome behind the menu of the pages in the paper look is Giovanni Battista
Piranesi's etching of the Forum (Veduta di Campo Vaccino, c. 1775),
[public domain at the Met](https://www.metmuseum.org/art/collection/search/363433), cropped and re-inked in warm graphite;
behind the headers of the home page and How to play it's in blue, as a blueprint.
