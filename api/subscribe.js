// Sign-ups for updates, from the forms on the site (assets/site.js) or, without JavaScript, posted straight here.
// Adds the address to Resend's contacts, not yet subscribed, and emails a link to confirm it (api/confirm.js). Someone
// already on the list gets no email, but the same answer, so the form never tells who's subscribed.
const { FROM, ROLES, LINK_DAYS, resend, sign, origin, escape } = require('./_resend.js')

module.exports = async function subscribe(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }
  // The forms on the site ask for JSON; a plain form post gets the page that says what happened
  const json = String(req.headers.accept || '').includes('application/json')
  const answer = (ok, status = ok ? 200 : 400) => json
    ? res.status(status).json({ ok })
    : res.redirect(303, ok ? '/updates/#sent' : '/updates/#failed')

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  // Only bots fill in the hidden field: pretend it worked
  if (body.website) return answer(true)
  const email = String(body.email || '').trim().toLowerCase()
  const role = ROLES[body.role] ? body.role : ''
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return answer(false)
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing')
    return answer(false, 500)
  }

  // The contact: new, so not subscribed until they confirm; or already there
  let id
  let subscribed = false
  const made = await resend('/contacts', { method: 'POST', body: { email, unsubscribed: true } })
  if (made.ok && made.data.id) {
    id = made.data.id
  } else {
    const found = await resend(`/contacts/${encodeURIComponent(email)}`)
    if (!found.ok || !found.data.id) {
      console.error('Resend contact:', made.status, JSON.stringify(made.data), found.status, JSON.stringify(found.data))
      return answer(false, 502)
    }
    id = found.data.id
    subscribed = found.data.unsubscribed === false
  }
  if (subscribed) return answer(true)

  const time = String(Math.floor(Date.now() / 1000))
  const link = `${origin(req)}/api/confirm?id=${encodeURIComponent(id)}&r=${role}&ts=${time}&s=${sign(id, role, time)}`
  const sent = await resend('/emails', {
    method: 'POST',
    body: {
      from: FROM,
      to: [email],
      subject: 'Please confirm your email for Fermi Poker updates',
      html: html(link),
      text: text(link),
    },
  })
  if (!sent.ok) {
    console.error('Resend email:', sent.status, JSON.stringify(sent.data))
    return answer(false, 502)
  }
  return answer(true)
}

// The email: one button, set like the site (cream paper, a grey frame, the blue button), with a plain-text twin
function html(link) {
  const sans = "Arial, 'Helvetica Neue', sans-serif"
  return `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#f7f7ea">
<div style="padding:32px 16px;background:#f7f7ea;color:#151d23">
  <div style="max-width:520px;margin:0 auto;padding:28px 28px 24px;border:4px solid #8a8e91;background:#fffef2">
    <h1 style="margin:0 0 12px;color:#000;font-family:Georgia, 'Times New Roman', serif;font-size:24px;line-height:1.25">Please confirm your email</h1>
    <p style="margin:0 0 22px;font-family:${sans};font-size:16px;line-height:1.5">You asked for updates from Fermi Poker. Click the button to confirm, and you’re on the list. We’ll let you know when our questions and materials are ready, and send news about Fermi Poker tournaments.</p>
    <p style="margin:0 0 22px"><a href="${escape(link)}" style="display:inline-block;padding:12px 26px;border-radius:999px;background:#009dff;color:#ffffff;font-family:${sans};font-size:16px;font-weight:bold;text-decoration:none">Confirm my email</a></p>
    <p style="margin:0;color:#32424e;font-family:${sans};font-size:14px;line-height:1.5">The link works for ${LINK_DAYS} days. If you didn’t sign up, ignore this email and you won’t hear from us.</p>
  </div>
  <p style="max-width:520px;margin:16px auto 0;color:#6b767f;font-family:${sans};font-size:13px;line-height:1.5;text-align:center">Fermi Foundation · <a href="https://fermi.org" style="color:#6b767f">fermi.org</a></p>
</div>
</body></html>`
}

function text(link) {
  return `Please confirm your email

You asked for updates from Fermi Poker. Open this link to confirm, and you’re on the list:

${link}

We’ll let you know when our questions and materials are ready, and send news about Fermi Poker tournaments.

The link works for ${LINK_DAYS} days. If you didn’t sign up, ignore this email and you won’t hear from us.

Fermi Foundation · fermi.org
`
}
