# fermi.org

The Fermi Foundation website: plain HTML and CSS, no build step.

- `index.html`: the home page
- `faq/`: the questions and the educational value, in tabs (below)
- `how-to-play/`, `host/`, `companies/`, `sponsor/`, `about/`, `updates/`: the inner pages (`host/` is For schools,
  `companies/` For companies, `updates/` Get updates, all below)
- `host-a-tournament/`: Host a tournament, links to everything for hosting (below)
- `partner/`: Partner with us, for people who want to organize a tournament open to everyone in their city: a form that
  `api/partner.js` emails to contact@fermi.org, like For companies' (below); the home page's tournaments and each
  tournament's page link to it
- `tournaments/`: a page for each tournament (`tournaments/boston/` and the others), which the home page's finder leads
  to (below); `tournaments/index.html` only sends anyone who opens `/tournaments/` to the finder
- `credits/`: the credit for the header photo, which every page's footer links to (below)
- `404.html`: the page Vercel shows for any address with nothing at it ("Page not found", in the classic look, kept out
  of search results), so its links and files all start at the root (`/`)
- `api/`: the Vercel Functions behind Get updates, the guide by email, the tournaments' email for a date, and the For
  schools, For companies and Partner with us forms (below), the site's only code that runs on a server
- `assets/site.css`: all styles; `assets/site.js`: the mobile menu, the guide by email, the tournament finder, the forms
  on For schools, For companies and Partner with us, Get updates, the tournaments' email for a date, How to play's footnotes and the
  FAQ page's tabs
- `assets/img/`, `assets/fonts/` (PT Sans and PT Serif, and for the new design Mona Sans, and in the classic look
  Instrument Serif and Instrument Sans, all self-hosted), `files/` (the rule sheet PDF, and the 63-question pack to print, with blank cards for your own questions on its last
  page)
- The fonts' Latin files (`fermi-sans-*.woff2`, `fermi-serif-*.woff2`) are PT Sans and PT Serif without their
  kerning around spaces, which made the gap after a period narrower than a word space. They were made with fontTools by
  taking the space and no-break space out of the kerning, and renamed (Fermi Sans, Fermi Serif) because the Open Font
  License reserves the original names for unmodified fonts. The `latin-ext` files are unchanged.
- `mona-sans-latin.woff2` is Mona Sans (Open Font License, unmodified), the variable file with every weight and width
  (Fontsource's "standard" Latin file). `fermi-logo.woff2` is Mona Sans fixed at weight 600 and width 125%, with only
  the letters of "Fermi Foundation" and "Fermi Poker", for the name at the top of the pages before the classic look
  (2 KB; on no page for now: the name is now in Instrument Serif, on the Play page too); add any letter it gains. It was made with fontTools (instancer, and subset with only the kerning)
  and renamed Fermi Logo, as "Mona" is a Reserved Font Name.
- `instrument-serif-latin.woff2` (and its italic) and `instrument-sans-latin.woff2` are Instrument Serif and
  Instrument Sans (Open Font License, unmodified; Fontsource's Latin files, the sans the variable one with every weight
  and width), the classic look's headings and text (below).
- `assets/img/edge-top.svg`, `edge-bottom.svg`: the torn edges of the old paper look; `chips-dice.webp` the picture in
  the new design's first headers (on no page for now), a close-up of
  the poker chips and dice, toned in the header's browns and softened; `poker-hall.webp` the hall of a poker
  tournament, blurred so only the room and its tables show, which the headers showed before and may again (on no page
  for now)
  (delete the block at the end of `site.css` that puts the chips in its place, and preload it again in the pages'
  heads); `start-*.webp` the pictures on the cards under the home page's Learn more and get involved (the chips, a
  drawing of University Hall, an office building painted in 1927, and students in the University Hall in Leuven),
  toned in warm greys; `hall-paper.webp` the hall photo in light sepia, as if faded onto the paper, in the home page's
  header; `map-us.svg` and `map-uk.svg` the finder's maps (below); `event-*.webp` the photos of the cities, from Pixabay (no
  credit needed), on the tournaments' pages, and `event-*-paper.webp` the same in the hall's light sepia, faded behind
  their titles (below); `enrico-fermi.webp` is a
  photo of Fermi that stood on the home page before, with `enrico-fermi-paper.svg` the paper cutout behind him
  (neither is on a page for now)
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

The menu and footer are repeated on every page (except Play, which has neither), so change them on all fifteen (the five tournaments' pages among them). On wide
screens the menu shows For schools, For companies, FAQ and Donate; the phone menu and the footer list every page but
Credits. Every page but Play is in the new design (its `html` has the class `new-design`): the menu (`nav--light`) on
the header's photo, in white (`nav--over`; in ink on the paper of the pages in the classic look, below), the phone menu opening in white, with the
name alone as the logo, links in the text as rust words a little bolder than the text, with a light underline, and the
dark brown footer (`footer--dark`), which has where to write in place of the logo. The paper look the pages had before
(the sky band, the paper with torn edges, `edge-top.svg` and `edge-bottom.svg`, the dark footer) is still in
`site.css`, unused for now.

Sections fade in, gliding up a little, as they come into view: `site.js` marks whatever is still below the screen
when a page loads (`.reveal`, and `.is-in` once it shows; the list of what's marked is at the end of `site.js`).
Nothing on screen is ever hidden, things that come into view together come in one after the other, and there's no
animation for people whose device asks for less motion, or without JavaScript.

How to play is the guide from LessWrong (https://www.lesswrong.com/posts/JFYvJqMaLw9nhfrur/fermi-poker): what you
need, an announcement, the rules to read aloud, an ante schedule and variations. Its title is The Fermi Poker guide, as
the home page and the email with the guide call it (in the browser's tab and search results, How to play and host
Fermi Poker); the menu, the footer and the links to it still say How to play. It's in the classic look (below): the
title on the paper with who wrote it under it (`page-hero__byline`, set like the other pages' line under the title), then the guide on a white sheet across the page
(`.doc`), its top corners rounded as For schools' band's are, running into the footer, the column centred on it,
starting with the introduction (`page-lead`, set like the rest); its headings in the serif, the notes and the words to
read out on panels in a pale tint of the paper. The guide's parts keep their classes from the paper look, and `.doc`
(and `html.guide-page.classic`, at the end of `site.css`) gives them the new one. Its footnotes are numbers in the text
that lead to the notes at the bottom of the page. On wide screens (from 1280px, a width set in both `site.js` and
`site.css`) `site.js` also sets each note on the sheet to the right of the column, beside its line; elsewhere it shows a note in place when its number is hovered over
or tapped. From the keyboard, and without JavaScript, a number leads to its note at the bottom. The worked sample
question is still in the page, hidden, to use later.

For schools (`host/`, where Host a tournament was) is for schools and universities, whose tournaments we help with for
free: a form whose answers go to `api/host.js`, which passes them on to a Google Form (and from there to a Google
Sheet), then the steps to host one, as rows (`boxes--rows`). It's in the home page's classic look (`html.classic`:
Instrument Serif and Instrument Sans, the menu in ink, links in ink with a faint underline), as are For companies, the
FAQ, Donate, How to play, Host a tournament and About, the whole page on paper, without the photo: a line in capitals in Mona Sans over the title and a line
in the serif under it; the form in a white card whose head is deep rust, with a slide rule's scale along its top edge;
the steps on a band of the same rust, its top corners rounded, rising behind the card. It's one block at the end of
`site.css`. The Google Form's address isn't on the page, where bots found it and posted spam to it directly: it's
`HOST_FORM_URL` in the project's environment variables on Vercel (the form's link, ending in `/formResponse`; a new
form has its own fields' IDs, from its "Get pre-filled link", which go in `api/host.js`), and until it's set, the old
form's. `api/host.js` drops sign-ups that fill in the hidden field, come within four seconds of opening the page, or
put a link (http, www) in the name, and refuses ones without the time the page was open, which only `assets/site.js`
sends: without JavaScript the form comes back to the page with `#failed`, offering the email address. For companies
(`companies/`) is for teams, for team building and leadership workshops, which companies pay for: a short form that
`api/team.js` emails to contact@fermi.org through Resend (below), so that replying answers whoever sent it. Partner
with us (`partner/`) is built the same way, for people who want to organize a tournament open to everyone in their
city: its form (name, email, city and country, and more) goes to `api/partner.js`, which emails it the same way. Without
JavaScript that form posts there directly and comes back to the page saying how it went (`#sent`, `#failed`). It's
built like For schools: its introduction under the title, then its form in a card with a rust head (without For
schools' band of steps). Donate (`sponsor/`) is the same: its introduction under the title, then a rust card saying to
write us. Host a tournament and About are built like it too: their introductions under the title, then a white card
with a rust head, Host a tournament's holding the materials (rows whose headings are links), About's the programs, with
Contact under the card. Get updates (below) and Credits are in it too: the title on the paper (Get updates with what we
send under it), then a white card with the form or the credits. The new design's first look, a header over the chips
picture with the title alone and the page on white rising into it on laptops, is still in `site.css`, on no page for
now.

The FAQ page, in the classic look, its title alone on the paper and the questions in a white card, has three parts,
General, Hosting and Educational value, each a list of questions that open in place. `site.js` turns the parts into
tabs named by their headings; without JavaScript they follow one another. A link to a part (`/faq/#hosting`) opens its
tab, and a link to a question (`/faq/#is-it-gambling`, its id made from its words) opens its tab and the question.

The home page runs in bands, white and pale beige in turn: the header, the tournament finder, the introduction, Learn
more and get involved, the mailing list, and Frequently asked questions. It's set a little more classic than the other
pages: its headings in Instrument Serif and its text in Instrument Sans, and its header on paper (`#efeade`), with the
hall photo faded onto it (`hall-paper.webp`) rising from its foot, the menu and the words in ink and centred. All of
it is one block at the end of `site.css` (the rules above it for the home page's header still describe the dark hall).
Under the headline is the guide by email: a field and "Send me the guide", in ink. Host a tournament
(`host-a-tournament/`) is a short page of links to the materials (the guide, the rule sheet and the questions to
print, and the Play page), each row's heading the link (`boxes--links`), and under them the introduction's lines for
schools and companies, so change those in both. Each card under Learn more and get involved is a link with a picture.
Frequently asked questions has five of the FAQ page's questions, opening in place, and a button to the rest; their
answers are copies of the FAQ page's, so change them in both.

The guide by email goes to `api/guide.js`, which emails the links to everything for hosting (the guide, the rule
sheet, the questions to print, the Play page, and the For schools form for funding), from contact@fermi.org with
replies to it. It keeps the address among Resend's contacts with the property "guide" (the day they asked), not
subscribed to updates: that takes signing up for them. Like the For schools form, `site.js` sends how long the page
was open, and `api/guide.js` drops sign-ups that fill in the hidden field or come within a second and a half, and
refuses ones without the time: without JavaScript the form comes back to the page with `#guide-failed`, offering the
guide online. Once it's sent the form stays as it is and its button says "Sent! Check your inbox", until the address
is changed, so a typo can be fixed and the guide sent again. Once someone has asked for the guide, the updates pop-up
never comes up by itself.

The tournament finder, as a shop's store finder: the cities where we'll hold one once enough people are interested
(Boston, Berkeley, New York City, London and Oxford for now), each with a small photo of the city
(`event-boston-small.webp` and so on, 600px wide, also on the tournaments' pages' cards of the others), its date "to be
set" (`finder__when`), a dot on the map it's on, and "I'm interested", its photo, name, dot and "I'm interested" all
leading to its page; under the heading, that besides supporting events at schools and universities we plan to hold tournaments
open to everyone in cities around the world, and an invitation to partner with us to organize one (to Partner with
us). The maps are pictures, `assets/img/map-us.svg` (the lower 48 states, from the
US Census Bureau's boundaries) and `map-uk.svg` (Great Britain and Ireland, from Natural Earth), both public domain,
drawn with d3-geo in conic equal-area projections; `site.js` knows those projections (`MAPS`) and puts each city's dot
on them from its latitude and longitude, so redrawing a map means updating its numbers there. It once also had a
search for your city and "Use my location", listing the cities nearest first with how far each was (`api/where.js`,
`assets/data/places.json` from GeoNames): taken out while there are only a few cities, and in the git history to bring
back.

Each tournament has its page (`tournaments/boston/` and the others), in the classic look: "Fermi Poker tournament" in
capitals over the city's name, its date under it, and on wider screens the city faded onto the paper behind them, as
the hall is on the home page (`event-boston-paper.webp`: the photo in grey, mapped onto the hall's sepia from dark to
light, and blurred a little; `--city-y` on the header says where it's cropped). On phones its photo is under the title
instead. Then a white card across the page with when, where and a field for an email once there's a date, what the
game is (the announcement from the guide), and the other tournaments as cards with their photos. The pages are alike
but for the city: change one, change all five.

The field goes to `api/interest.js`, which, like Get updates, adds the address to Resend's contacts if it isn't there yet and
emails a link to confirm it. The link (`api/confirm.js`) adds the city to the contact's property "tournaments" in
Resend (say "Boston, New York City"), and emails contact@fermi.org "New sign-up for the Boston tournament", with every
city they've signed up for. That's all it changes: whether they get updates stays as it was. The cities have no
segments of their own, as Resend's free plan has only three. With JavaScript the card says to confirm with the link;
without it, and after the link, the city's page says how it went, under the card (`#interest-sent`,
`#interest-confirmed`, `#interest-invalid`, `#interest-failed`). Once there's a date, find who signed up for the city
(the "tournaments" property on the contacts in Resend, or the emails to contact@fermi.org) and email them, and put the
date on its page (the title's line, When, and its card on the other pages) and in its `finder__when` on the home page.
To add a city: a page in `tournaments/`, a copy of Boston's with the city's key (in the hidden `city` field) and name,
its photos (`event-<key>.webp`, 1000 by 571, and `event-<key>-paper.webp`, made from it as above), and a card for it
under the other pages' Other tournaments; an item like Boston's in the finder's list on the home page (its key in
`data-city` and the links, and its `data-lat` and `data-lon`; `data-label="left"` puts its name on the left of its dot,
clear of a neighbour's); and the key and name in `TOURNAMENTS` in `api/_resend.js`. A city off both maps is listed but
has no dot.

Get updates: people leave their email to hear when we release new question sets, and whenever there's other news about
Fermi Poker. The form is at the end of the home page (a second one, under the introduction, is hidden for now), on its
own page (`updates/`), and in a pop-up that "Get updates" in the phone menu and the footer opens (`assets/site.js`).
In the classic look the form is a round field with the button in it, in ink, like the guide by email under the home
page's headline (on phones the button under the field). The forms ask only for the email; the pop-up also asks what they are ("I'm a…", optional). The pop-up also comes up by
itself once: on laptops when the mouse leaves the page at the top, after 10 seconds on it; on phones and tablets after
30 seconds on the page. Then not again for 30 days, and never after signing up, sending the For schools form or asking
for the guide (the browser remembers this as `fermi-updates` in local storage); never on the Play page or Get updates
itself. The pop-up is off for now, to come back in the new design (`UPDATES_POPUP` in `site.js`): while it's off, it
never comes up by itself, and "Get updates" leads to the Get updates page.

The forms send to `api/subscribe.js`, which adds the address to the contacts in Resend (resend.com), not yet
subscribed, and emails a link to confirm it, from contact@fermi.org. The link (`api/confirm.js`, good for a week)
subscribes them, puts them into the segments "Fermi Poker updates" (everyone) and "High school students", "University
students", "Teachers and professors" or "Others" (what they said they are; "Students" from before high school and
university were asked apart), emails contact@fermi.org about the new sign-up, and shows the
Get updates page saying so. These, and `api/interest.js`, `api/guide.js` and `api/team.js`, need Resend's key as
`RESEND_API_KEY` in the project's environment variables on Vercel, and fermi.org verified in Resend. To send news,
write a Broadcast in Resend to a segment; Resend adds the link to unsubscribe. Without JavaScript the forms still work:
the Get updates page shows what happened (`#sent`, `#confirmed`, `#invalid`, `#failed`).

In Resend, a contact is subscribed or not as a whole, and what it hears about is the segments it's in: whether someone
gets updates is whether they're subscribed and in "Fermi Poker updates". The free plan has three segments, so the link
puts people in "Fermi Poker updates", and in the segment for what they said they are only if it exists or there's room
for it. Unsubscribing from any Broadcast unsubscribes the contact from all of them; if they later confirm a sign-up
for updates again, they're first taken out of the segments they were in, so they hear only about what they've just
asked for. A link opened twice at once (clicked again while it loads, or opened by the mail app as well) can trip over
itself while the other request does it all, so before saying something went wrong, the link looks again; if it's still
wrong, contact@fermi.org gets an email with what Resend said.

Link previews (WhatsApp, iMessage, LinkedIn and so on) come from the `og:` tags in each page's `<head>`. Every page
uses the same picture, `assets/img/link-preview-paper.jpg` (1200 × 630): the home page's header in the classic look,
"Fermi Foundation" at the top left and the headline in Instrument Serif, on the paper with the hall faded onto it
(`hall-paper.webp`), made from a small page with the site's fonts, photographed at 1200 × 630 (the previous picture,
`link-preview-hall-3.jpg`, is kept for links already shared). The photo's credit is a link away, in the footer of the
page the preview leads to. The tags need absolute URLs, so they name
https://fermi.org. Apps keep a preview for a while; a new picture under a new file name makes them fetch it again
(LinkedIn's Post Inspector refreshes it at once).

To preview, run `python3 -m http.server` here and open http://localhost:8000.

Page views are counted with Vercel Web Analytics, through the two script tags at the end of each page's `<head>`.
Vercel serves its script only on the deployment, so a local preview shows a harmless 404 for
`/_vercel/insights/script.js`.

The poker chips photo came from the site's owner (on the How to play card, and in most headers). The Enrico Fermi
photo is a U.S. Department of Energy photo
(c. 1943–49) in the public domain. So are the pictures on the For schools and For companies cards, from Wikimedia
Commons: a drawing of
[University Hall](https://commons.wikimedia.org/wiki/File:University_Hall_from_the_Middle_Campus.jpg) and the 1927
[rendering of the Victor & Co. building](https://commons.wikimedia.org/wiki/File:Victor_%26_Co._building,_Buffalo,_New_York_-_architectural_rendering,_1927.jpg)
in Buffalo, cropped above its lettering; the photo on the Sponsor or donate card, students in the
[University Hall in Leuven](https://commons.wikimedia.org/wiki/File:Lakenhal_%2850839%29.jpg), is CC0. The hall photo
(in the headers of Host a tournament, For schools and For companies, and in the link preview) is
[GPD Championship 2013](https://commons.wikimedia.org/wiki/File:GPD_Championsship_2013.jpg) by German Events GbR,
under CC BY-SA 3.0, which asks for a credit: the title with a link to it, the author, the license with a link, and
that it's blurred. It's on the Credits page (`credits/`), and every page's footer links to it (Photo credit), which
the license needs wherever the photo is. The blurred picture, and the link preview made from it, are under the same
license. The Play page's table is Giovanni Battista Piranesi's etching of the Forum (Veduta di Campo Vaccino, c. 1775),
[public domain at the Met](https://www.metmuseum.org/art/collection/search/363433), cropped and re-inked in warm
graphite (`forum-piranesi.webp`). The photos of the cities are from
Pixabay, under the Pixabay Content License, which needs no credit: New York City
([3875817](https://pixabay.com/photos/sunset-manhattan-city-skyline-3875817/)), London
([2393098](https://pixabay.com/photos/big-ben-bridge-city-sunrise-river-2393098/)), Boston
([7352352](https://pixabay.com/photos/city-sea-buildings-landscape-urban-7352352/)), and Oxford and Berkeley.
