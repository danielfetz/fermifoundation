// The guide by email, from the form in the home page's header: sent by assets/site.js or, without JavaScript, posted
// straight here. Emails the whole guide (api/_guide-email.js, made from how-to-play/index.html by
// scripts/guide_email.py), with links to the rule sheet, the questions to print and the questions on a screen over it,
// tells daniel@fermi.org who asked, and keeps the address among Resend's contacts with the property "guide" (the day
// it was asked for), not subscribed to updates: that takes signing up for them.
const { FROM, NOTIFY, resend, contactFor, listAll, origin, escape } = require('./_resend.js')
const GUIDE_PAGE = require('./_guide-email.js')

// The contact's property that says they asked for the guide, and when
const GUIDE = 'guide'
// Who hears about each request for the guide (the requests are also among the contacts in Resend, with the day)
const GUIDE_NOTIFY = 'daniel@fermi.org'
// Anyone faster than this from opening the page to sending hasn't typed an address
const QUICKEST = 1500

// The email, set like the home page (paper, ink), with a plain-text twin: a line on what's in it, the links to
// download, the question set that isn't public, then the whole guide, and how to reach us
function guideEmail(site) {
  const ink = '#2b251f'
  const soft = '#6b6158'
  const sans = "Arial, 'Helvetica Neue', Helvetica, sans-serif"
  const serif = "Georgia, 'Times New Roman', serif"
  const fill = text => text.replaceAll('{{site}}', site)
  const links = [
    ['Rule sheet (PDF)', `${site}/files/fermi-poker-rules.pdf`, 'All the rules on a single page. Print a copy or two for every table.'],
    ['Questions to print (PDF)', `${site}/files/fermi-poker-question-pack.pdf`, 'Question, hint and answer cards, and blank cards for your own questions.'],
    ['Questions on a screen (fermi.org/play)', `${site}/play/`, 'Show the questions, hints and answers on a phone, tablet or laptop instead of printing them.'],
  ]
  const intro = 'Here’s everything you need to host a tournament or game night with friends: the rule sheet and question set to download, and below, the whole guide.'
  const secret = 'We also have a question set that isn’t public, so players can’t memorize the answers beforehand.'
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:0;background:#efeade">
<div style="padding:32px 12px;background:#efeade;color:${ink}">
  <div style="max-width:600px;margin:0 auto;padding:28px 26px 22px;background:#ffffff">
    <h1 style="margin:0 0 12px;color:${ink};font-family:${serif};font-size:28px;font-weight:normal;line-height:1.2">Your Fermi Poker guide</h1>
    <p style="margin:0 0 20px;font-family:${sans};font-size:16px;line-height:1.5">${intro}</p>
${links.map(([title, href, what]) => `    <p style="margin:0 0 14px;font-family:${sans};font-size:16px;line-height:1.5"><a href="${escape(href)}" style="color:${ink};font-weight:bold">${title}</a><br>${what}</p>`).join('\n')}
    <p style="margin:18px 0 0;font-family:${sans};font-size:16px;line-height:1.5">${secret} To get it, write us at <a href="mailto:${NOTIFY}" style="color:${ink}">${NOTIFY}</a> and tell us about your tournament.</p>
    <div style="margin:28px 0 0;padding-top:8px;border-top:1px solid #e6dfd3">
      <h2 style="margin:24px 0 6px;font-family:${serif};font-size:30px;font-weight:normal;line-height:1.15;color:${ink}"><a href="${escape(`${site}/how-to-play/`)}" style="color:${ink};text-decoration:none">${escape(GUIDE_PAGE.title)}</a></h2>
      <p style="margin:0 0 22px;font-family:${sans};font-size:15px;line-height:1.5;color:${ink}">${fill(GUIDE_PAGE.bylineHtml)}</p>
${fill(GUIDE_PAGE.html)}
    </div>
    <p style="margin:28px 0 0;padding-top:18px;border-top:1px solid #e6dfd3;font-family:${sans};font-size:16px;line-height:1.5">Hosting a tournament at a school or university? Funding is available: <a href="${escape(`${site}/host/#sign-up`)}" style="color:${ink}">tell us about it</a>. Any questions? Just reply to this email.</p>
  </div>
  <p style="max-width:600px;margin:16px auto 0;color:${soft};font-family:${sans};font-size:13px;line-height:1.5;text-align:center">You asked for the guide on fermi.org. We won’t email you again unless you <a href="${escape(`${site}/updates/`)}" style="color:${soft}">sign up for updates</a>.<br>Fermi Foundation · <a href="https://fermi.org" style="color:${soft}">fermi.org</a></p>
</div>
</body></html>`
  const text = `Your Fermi Poker guide

${intro}

${links.map(([title, href, what]) => `${title}: ${href}\n${what}`).join('\n\n')}

${secret} To get it, write us at ${NOTIFY} and tell us about your tournament.

------------------------------------------------------------

${GUIDE_PAGE.title.toUpperCase()}
${site}/how-to-play/
${fill(GUIDE_PAGE.bylineText)}

${fill(GUIDE_PAGE.text)}
------------------------------------------------------------

Hosting a tournament at a school or university? Funding is available. Tell us about it: ${site}/host/#sign-up
Any questions? Just reply to this email.

You asked for the guide on fermi.org. We won’t email you again unless you sign up for updates: ${site}/updates/

Fermi Foundation · fermi.org
`
  return { html, text }
}

// Keeps the day they asked for the guide on the contact. The property has to exist before a contact can have it, so
// it's made the first time.
async function saveGuide(id) {
  if (!(await listAll('/contact-properties')).some(property => property.key === GUIDE)) {
    const made = await resend('/contact-properties', { method: 'POST', body: { key: GUIDE, type: 'string' } })
    // (perhaps made a moment ago by another request: then saving works all the same)
    if (!made.ok) console.error('Resend property:', made.status, JSON.stringify(made.data))
  }
  const day = new Date().toISOString().slice(0, 10)
  const saved = await resend(`/contacts/${encodeURIComponent(id)}`, { method: 'PATCH', body: { properties: { [GUIDE]: day } } })
  if (!saved.ok) throw new Error(`saving the guide: ${saved.status} ${JSON.stringify(saved.data)}`)
}

module.exports = async function guide(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }
  // The form on the site asks for JSON; a plain form post gets the home page back, saying what happened
  const json = String(req.headers.accept || '').includes('application/json')
  const answer = (ok, status = ok ? 200 : 400) => json
    ? res.status(status).json({ ok })
    : res.redirect(303, ok ? '/#guide-sent' : '/#guide-failed')

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  // assets/site.js says how long the page was open; a post without it didn't come from the page
  const elapsed = Number(body.elapsed)
  if (!Number.isFinite(elapsed)) return answer(false)
  // Only bots fill in the hidden field or send within a second or so: pretend it worked
  if (body.website || elapsed < QUICKEST) return answer(true)
  const email = String(body.email || '').trim().toLowerCase()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return answer(false)
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing')
    return answer(false, 500)
  }

  const sent = await resend('/emails', {
    method: 'POST',
    body: { from: FROM, to: [email], reply_to: NOTIFY, subject: 'Your Fermi Poker guide', ...guideEmail(origin(req)) },
  })
  if (!sent.ok) {
    console.error('Resend email:', sent.status, JSON.stringify(sent.data))
    return answer(false, 502)
  }
  // The guide is on its way whatever happens now; telling us and keeping the address are a bonus
  const told = await resend('/emails', {
    method: 'POST',
    body: {
      from: FROM,
      to: [GUIDE_NOTIFY],
      reply_to: email,
      subject: `Guide requested: ${email}`,
      text: `${email} asked for the guide on fermi.org. Reply to this email to write them.\n`,
      html: `<p>${escape(email)} asked for the guide on fermi.org. Reply to this email to write them.</p>`,
    },
  })
  if (!told.ok) console.error('Resend email (to us):', told.status, JSON.stringify(told.data))
  try {
    const contact = await contactFor(email)
    if (contact) await saveGuide(contact.id)
  } catch (error) {
    console.error('Resend contact:', error)
  }
  return answer(true)
}
