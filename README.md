# fermi.org

The Fermi Foundation website: plain HTML and CSS, no build step.

- `index.html`: the home page
- `faq/`: the questions and the educational value, in tabs (below)
- `how-to-play/`, `host/`, `companies/`, `sponsor/`, `about/`, `updates/`: the inner pages (`host/` is For schools,
  `companies/` For companies, `updates/` Get updates, all below)
- `api/`: the Vercel Functions behind Get updates, the tournaments' "I'm interested" and the For companies form
  (below), the site's only code that runs on a server
- `assets/site.css`: all styles; `assets/site.js`: the mobile menu, the forms on For schools and For companies, Get
  updates, "I'm interested", How to play's footnotes and the FAQ page's tabs
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
- `assets/img/edge-top.svg`, `edge-bottom.svg`: the torn edges of the old paper look; `rome-blueprint.webp` the
  headers of every page, Piranesi's Forum (`forum-piranesi.webp`) as a blueprint, its lines light on blue, and
  `rome-blueprint-phone.webp` the strip of it that phones show; `start-*.webp` the pictures on the cards under the
  home page's Learn more and get involved (the chips, a drawing of University Hall, an office building painted in
  1927, and students in the University Hall in Leuven), toned in the header's blue; `enrico-fermi.webp` is a photo of
  Fermi that stood on the home page before, with `enrico-fermi-paper.svg` the paper cutout behind him (neither is on
  a page for now)
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

The menu and footer are repeated on every page (except Play, which has neither), so change them on all eight. On
wide screens the menu shows For schools, For companies, FAQ and Donate; the phone menu and the footer list every
page. Every page but Play is in the new design (its `html` has the class `new-design`): the white menu bar
(`nav--light`), with the name alone as the logo, links in the text as blue words a little bolder than the text, with
a light underline, and the navy footer (`footer--navy`), which has where to write in place of the logo. The paper
look the pages had before (the sky band, the paper with torn edges, `edge-top.svg` and `edge-bottom.svg`, the dark
footer) is still in `site.css`, unused for now.

Sections fade in, gliding up a little, as they come into view: `site.js` marks whatever is still below the screen
when a page loads (`.reveal`, and `.is-in` once it shows; the list of what's marked is at the end of `site.js`).
Nothing on screen is ever hidden, things that come into view together come in one after the other, and there's no
animation for people whose device asks for less motion, or without JavaScript.

How to play is the guide from LessWrong (https://www.lesswrong.com/posts/JFYvJqMaLw9nhfrur/fermi-poker): what you
need, an announcement, the rules to read aloud, an ante schedule and variations. It's in the new design: a blue
header (`page-hero`, with the home page's Rome, for the other inner pages to share) with the title, the introduction
and the rule sheet, then the guide on white (`.doc`), its column lined up with the title. The guide's parts keep
their classes from the paper look, and `.doc` gives them the new one. Its footnotes are numbers in the text that
lead to the notes at the bottom of the page. On wide screens `site.js` also sets each note in the margin beside its
line, and elsewhere shows it in place when its number is hovered over or tapped; from the keyboard, and without
JavaScript, a number leads to its note at the bottom. The worked sample question is still in the page, hidden, to
use later.

For schools (`host/`, where Host a tournament was) is for schools and universities, whose tournaments we help with
for free: a form whose answers go to a Google Form (and from there to a Google Sheet), then the steps to host one, as
rows (`boxes--rows`). For companies (`companies/`) is for teams, for team building and leadership workshops, which
companies pay for: a short form that `api/team.js` emails to contact@fermi.org through Resend (below), so that
replying answers whoever sent it. Without JavaScript that form posts there directly and comes back to the page saying
how it went (`#sent`, `#failed`). Both pages are built like How to play: the blue header, then the page on white.
So are About (its programs in rows too), Donate (`sponsor/`) and Get updates (below).

The FAQ page, under the blue Rome header like Get updates, has three parts, General, Hosting and Educational value,
each a list of questions that open in place.
`site.js` turns the parts into tabs named by their headings; without JavaScript they follow one another. A link to a
part (`/faq/#hosting`) opens its tab, and a link to a question (`/faq/#is-it-gambling`, its id made from its words)
opens its tab and the question.

The home page runs in bands, white and pale blue in turn: the header, Upcoming tournaments, the introduction, Learn
more and get involved, the mailing list, and Frequently asked questions. Each card under Learn more and get involved
is a link with a picture. Frequently asked questions has five of the FAQ page's questions, opening in place, and a
button to the rest; their answers are copies of the FAQ page's, so change them in both.

Upcoming tournaments has a card for each city where we'll hold one once enough people are interested (Boston,
Berkeley, New York City, London and Oxford for now), its date "to be set" (`event__when`), over the pattern of card
suits, and a last card, Somewhere else?, its button (Partner with us) an email to contact@fermi.org. A city's card can
have a photo in place of the pattern (an `img` with the class `event__photo`, say `assets/img/event-boston.webp`). On
a city's card, "I'm interested" opens a field for the email (a `details` element, so it works without JavaScript too).
It goes to `api/interest.js`, which, like Get updates, adds the address to Resend's contacts if it isn't there yet and
emails a link to confirm it. The link (`api/confirm.js`) adds the city to the contact's property "tournaments" in
Resend (say "Boston, New York City"), and emails contact@fermi.org "New sign-up for the Boston tournament", with every
city they've signed up for. That's all it changes: whether they get updates stays as it was. The cities have no
segments of their own, as Resend's free plan has only three. Without JavaScript, and after the link, the home page
says how it went, above the cards (`#interest-sent`, `#interest-confirmed`, `#interest-invalid`, `#interest-failed`).
Once there's a date, find who signed up for the city (the "tournaments" property on the contacts in Resend, or the
emails to contact@fermi.org) and email them, and put the date on its card. To add a city: a card like Boston's (its
key in the hidden `city` field and in the email field's id), and the key and name in `TOURNAMENTS` in
`api/_resend.js`.

Get updates: people leave their email to hear when we release new question sets, and whenever there's other news
about Fermi Poker. The form is at the end of the home page (a second one, under the introduction, is hidden for now),
on its own page (`updates/`), and in a pop-up that "Get updates" in the phone menu and the footer opens
(`assets/site.js`). The forms ask only for the email; the pop-up also asks what they are ("I'm a…", optional). The
pop-up also comes up by itself once: on laptops when the mouse leaves the page at the top, after 10 seconds on it; on
phones and tablets after 30 seconds on the page. Then not again for 30 days, and never after signing up or sending the
For schools form (the browser remembers this as `fermi-updates` in local storage); never on the Play page or Get updates
itself. The pop-up is off for now, to come back in the new design (`UPDATES_POPUP` in `site.js`): while it's off, it
never comes up by itself, and "Get updates" leads to the Get updates page.

The forms send to `api/subscribe.js`, which adds the address to the contacts in Resend (resend.com), not yet
subscribed, and emails a link to confirm it, from contact@fermi.org. The link (`api/confirm.js`, good for a week)
subscribes them, puts them into the segments "Fermi Poker updates" (everyone) and "High school students", "University
students", "Teachers and professors" or "Others" (what they said they are; "Students" from before high school and
university were asked apart), emails contact@fermi.org about the new sign-up, and shows the
Get updates page saying so. These, and `api/interest.js` and `api/team.js`, need Resend's key as `RESEND_API_KEY` in
the project's environment variables on Vercel, and fermi.org verified in Resend. To send news, write a Broadcast in
Resend to a segment; Resend adds the link to unsubscribe. Without JavaScript the forms still work: the Get updates
page shows what happened (`#sent`, `#confirmed`, `#invalid`, `#failed`).

In Resend, a contact is subscribed or not as a whole, and what it hears about is the segments it's in: whether someone
gets updates is whether they're subscribed and in "Fermi Poker updates". The free plan has three segments, so the link
puts people in "Fermi Poker updates", and in the segment for what they said they are only if it exists or there's room
for it. Unsubscribing from any Broadcast unsubscribes the contact from all of them; if they later confirm a sign-up
for updates again, they're first taken out of the segments they were in, so they hear only about what they've just
asked for. A link opened twice at once (clicked again while it loads, or opened by the mail app as well) can trip over
itself while the other request does it all, so before saying something went wrong, the link looks again; if it's still
wrong, contact@fermi.org gets an email with what Resend said.

Link previews (WhatsApp, iMessage, LinkedIn and so on) come from the `og:` tags in each page's `<head>`. Every page
uses the same picture, `assets/img/link-preview-blueprint.jpg` (1200 × 630): the home page's header, its headline and
the line under it over the blue Rome, with the name above. The tags need absolute URLs, so they name
https://fermi.org. Apps keep a preview for a while; a new picture under a new file name makes them fetch it again
(LinkedIn's Post Inspector refreshes it at once).

To preview, run `python3 -m http.server` here and open http://localhost:8000.

Page views are counted with Vercel Web Analytics, through the two script tags at the end of each page's `<head>`.
Vercel serves its script only on the deployment, so a local preview shows a harmless 404 for
`/_vercel/insights/script.js`.

The poker chips photo came from the site's owner. The Enrico Fermi photo is a U.S. Department of Energy photo
(c. 1943–49) in the public domain. So are the pictures on the For schools and For companies cards, from Wikimedia
Commons: a drawing of
[University Hall](https://commons.wikimedia.org/wiki/File:University_Hall_from_the_Middle_Campus.jpg) and the 1927
[rendering of the Victor & Co. building](https://commons.wikimedia.org/wiki/File:Victor_%26_Co._building,_Buffalo,_New_York_-_architectural_rendering,_1927.jpg)
in Buffalo, cropped above its lettering; the photo on the Sponsor or donate card, students in the
[University Hall in Leuven](https://commons.wikimedia.org/wiki/File:Lakenhal_%2850839%29.jpg), is CC0. The Rome in
the pages' headers is Giovanni Battista Piranesi's etching of the Forum (Veduta di Campo Vaccino, c. 1775),
[public domain at the Met](https://www.metmuseum.org/art/collection/search/363433), in blue, as a blueprint; on the
Play page's table it's cropped and re-inked in warm graphite (`forum-piranesi.webp`).
