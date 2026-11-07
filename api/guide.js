// The guide by email, from the form in the home page's header: sent by assets/site.js or, without JavaScript, posted
// straight here. Emails the whole guide (api/_guide-email.js, made from how-to-play/index.html by
// scripts/guide_email.py; the rule sheet, the questions and the question set that isn't public are in it, under
// Materials), tells daniel@fermi.org who asked, and keeps the address among Resend's contacts with the property "guide"
// (the day it was asked for), not subscribed to updates: that takes signing up for them.
const { FROM, NOTIFY, resend, contactFor, listAll, origin, escape } = require('./_resend.js')
const GUIDE_PAGE = require('./_guide-email.js')

// The contact's property that says they asked for the guide, and when
const GUIDE = 'guide'
// Who hears about each request for the guide (the requests are also among the contacts in Resend, with the day)
const GUIDE_NOTIFY = 'daniel@fermi.org'
// Anyone faster than this from opening the page to sending hasn't typed an address
const QUICKEST = 1500

// The email, set like the home page (paper, ink), with a plain-text twin: the guide itself straight away, under the
// title (a link to it on How to play) and who wrote it, then the way to funding for schools and how to reach us
function guideEmail(site) {
  const ink = '#2b251f'
  const soft = '#6b6158'
  const sans = "Arial, 'Helvetica Neue', Helvetica, sans-serif"
  const serif = "Georgia, 'Times New Roman', serif"
  const fill = text => text.replaceAll('{{site}}', site)
  const online = `${site}/how-to-play/`
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:0;background:#efeade">
<div style="padding:32px 12px;background:#efeade;color:${ink}">
  <div style="max-width:600px;margin:0 auto;padding:28px 26px 22px;background:#ffffff">
    <h1 style="margin:0 0 12px;color:${ink};font-family:${serif};font-size:28px;font-weight:normal;line-height:1.2"><a href="${escape(online)}" style="color:${ink};text-decoration:none">Your Fermi Poker guide</a></h1>
    <p style="margin:0 0 22px;font-family:${sans};font-size:15px;line-height:1.5;color:${ink}">${fill(GUIDE_PAGE.bylineHtml)}</p>
${fill(GUIDE_PAGE.html)}
    <p style="margin:28px 0 0;padding-top:18px;border-top:1px solid #e6dfd3;font-family:${sans};font-size:16px;line-height:1.5">Hosting a tournament at a school or university? You can <a href="${escape(`${site}/host/#sign-up`)}" style="color:${ink}">apply for funding</a> to cover the cost of poker chips and small prizes. Any questions? Just write us at <a href="mailto:${NOTIFY}" style="color:${ink}">${NOTIFY}</a></p>
  </div>
  <p style="max-width:600px;margin:16px auto 0;color:${soft};font-family:${sans};font-size:13px;line-height:1.5;text-align:center">You asked for the guide on fermi.org. We won’t add you to our mailing list unless you <a href="${escape(`${site}/updates/`)}" style="color:${soft}">sign up for updates</a>.<br>Fermi Foundation · <a href="https://fermi.org" style="color:${soft}">fermi.org</a></p>
</div>
</body></html>`
  const text = `Your Fermi Poker guide
${online}
${fill(GUIDE_PAGE.bylineText)}

${fill(GUIDE_PAGE.text)}
------------------------------------------------------------

Hosting a tournament at a school or university? You can apply for funding to cover the cost of poker chips and small prizes: ${site}/host/#sign-up
Any questions? Just write us at ${NOTIFY}

You asked for the guide on fermi.org. We won’t add you to our mailing list unless you sign up for updates: ${site}/updates/

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
