// Sign-ups for updates, from the forms on the site (assets/site.js) or, without JavaScript, posted straight here.
// Adds the address to Resend's contacts, not yet subscribed, and emails a link to confirm it (api/confirm.js). Someone
// already on the list gets no email, but the same answer, so the form never tells who's subscribed.
const { FROM, ROLES, EVERYONE, resend, sign, contactFor, segmentsOf, confirmEmail, origin } = require('./_resend.js')

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
  const role = Object.hasOwn(ROLES, body.role) ? body.role : ''
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return answer(false)
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing')
    return answer(false, 500)
  }

  const contact = await contactFor(email)
  if (!contact) return answer(false, 502)
  // Already on the list: no email. (Subscribed only to hear about a tournament isn't on it. If Resend can't say,
  // they get the email.)
  if (contact.subscribed && (await segmentsOf(contact.id).catch(() => new Map())).has(EVERYONE)) return answer(true)

  const { id } = contact
  const time = String(Math.floor(Date.now() / 1000))
  const link = `${origin(req)}/api/confirm?id=${encodeURIComponent(id)}&r=${role}&ts=${time}&s=${sign(id, role, time)}`
  const sent = await resend('/emails', {
    method: 'POST',
    body: {
      from: FROM,
      to: [email],
      subject: 'Please confirm your email for Fermi Poker updates',
      ...confirmEmail(
        link,
        'You asked for updates from Fermi Poker.',
        'We’ll let you know when we release new question sets, and whenever there’s other news about Fermi Poker.',
      ),
    },
  })
  if (!sent.ok) {
    console.error('Resend email:', sent.status, JSON.stringify(sent.data))
    return answer(false, 502)
  }
  return answer(true)
}
