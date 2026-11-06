// The guide by email, from the form in the home page's header: sent by assets/site.js or, without JavaScript, posted
// straight here. Emails links to everything for hosting (the guide, the rule sheet, the questions to print, the cards
// on a screen), and keeps the address among Resend's contacts with the property "guide" (the day it was asked for), not
// subscribed to updates: that takes signing up for them.
const { FROM, NOTIFY, resend, contactFor, listAll, origin, escape } = require('./_resend.js')

// The contact's property that says they asked for the guide, and when
const GUIDE = 'guide'
// Anyone faster than this from opening the page to sending hasn't typed an address
const QUICKEST = 1500

// The email: the links, each with a line on what it is, set like the home page (paper, ink), with a plain-text twin
function guideEmail(site) {
  const sans = "Arial, 'Helvetica Neue', sans-serif"
  const serif = "Georgia, 'Times New Roman', serif"
  const links = [
    ['The guide', `${site}/how-to-play/`, 'How to play, the rules to read out, an ante schedule and variations.'],
    ['Rule sheet (PDF)', `${site}/files/fermi-poker-rules.pdf`, 'All the rules on a single page. Print a copy or two for every table.'],
    ['63 questions to print (PDF)', `${site}/files/fermi-poker-63-question-pack.pdf`, 'Question, hint and answer cards, and blank cards for your own questions.'],
    ['The cards on a screen', `${site}/play/`, 'Show the questions, hints and answers on a phone, tablet or laptop instead of printing them.'],
  ]
  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#efeade">
<div style="padding:32px 16px;background:#efeade;color:#2b251f">
  <div style="max-width:520px;margin:0 auto;padding:28px 28px 24px;background:#ffffff">
    <h1 style="margin:0 0 12px;color:#2b251f;font-family:${serif};font-size:26px;font-weight:normal;line-height:1.2">Your Fermi Poker guide</h1>
    <p style="margin:0 0 20px;font-family:${sans};font-size:16px;line-height:1.5">Here’s everything you need to host a tournament or a game night with friends.</p>
${links.map(([title, href, what]) => `    <p style="margin:0 0 16px;font-family:${sans};font-size:16px;line-height:1.5"><a href="${escape(href)}" style="color:#2b251f;font-weight:bold">${title}</a><br>${what}</p>`).join('\n')}
    <p style="margin:24px 0 0;font-family:${sans};font-size:16px;line-height:1.5">Hosting a tournament at a school or university? Funding is available: <a href="${escape(`${site}/host/#sign-up`)}" style="color:#2b251f">tell us about it</a>. Any questions? Just reply to this email.</p>
  </div>
  <p style="max-width:520px;margin:16px auto 0;color:#6b6158;font-family:${sans};font-size:13px;line-height:1.5;text-align:center">You asked for the guide on fermi.org. We won’t email you again unless you <a href="${escape(`${site}/updates/`)}" style="color:#6b6158">sign up for updates</a>.<br>Fermi Foundation · <a href="https://fermi.org" style="color:#6b6158">fermi.org</a></p>
</div>
</body></html>`
  const text = `Your Fermi Poker guide

Here’s everything you need to host a tournament or a game night with friends.

${links.map(([title, href, what]) => `${title}: ${href}\n${what}`).join('\n\n')}

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
  // The guide is on its way whatever happens now; keeping the address is a bonus
  try {
    const contact = await contactFor(email)
    if (contact) await saveGuide(contact.id)
  } catch (error) {
    console.error('Resend contact:', error)
  }
  return answer(true)
}
