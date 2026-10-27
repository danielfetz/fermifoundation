// Interest in a tournament, from the cards under Upcoming tournaments on the home page: sent by assets/site.js or,
// without JavaScript, posted straight here. Like api/subscribe.js, adds the address to Resend's contacts if it isn't
// there (not subscribed), and emails a link to confirm it (api/confirm.js), which adds the city to the contact's
// "tournaments" and tells contact@fermi.org, leaving the list for updates as it was. Someone already signed up for that
// city gets no email, but the same answer.
const { FROM, TOURNAMENTS, resend, sign, contactFor, confirmEmail, origin } = require('./_resend.js')

module.exports = async function interest(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }
  // The form on the site asks for JSON; a plain form post gets the home page back, saying what happened
  const json = String(req.headers.accept || '').includes('application/json')
  const answer = (ok, status = ok ? 200 : 400) => json
    ? res.status(status).json({ ok })
    : res.redirect(303, ok ? '/#interest-sent' : '/#interest-failed')

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  // Only bots fill in the hidden field: pretend it worked
  if (body.website) return answer(true)
  const email = String(body.email || '').trim().toLowerCase()
  const city = Object.hasOwn(TOURNAMENTS, body.city) ? body.city : ''
  if (!city || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return answer(false)
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing')
    return answer(false, 500)
  }

  const contact = await contactFor(email)
  if (!contact) return answer(false, 502)
  // Already signed up for this city: no email
  if (contact.cities.includes(TOURNAMENTS[city])) return answer(true)

  const { id } = contact
  const time = String(Math.floor(Date.now() / 1000))
  const link = `${origin(req)}/api/confirm?id=${encodeURIComponent(id)}&t=${city}&ts=${time}&s=${sign(id, `tournament:${city}`, time)}`
  const sent = await resend('/emails', {
    method: 'POST',
    body: {
      from: FROM,
      to: [email],
      subject: `Please confirm your email for the Fermi Poker tournament in ${TOURNAMENTS[city]}`,
      ...confirmEmail(
        link,
        `You asked to hear when there’s a date for a Fermi Poker tournament in ${TOURNAMENTS[city]}.`,
        'We’ll email you once there’s a date, and only about this tournament.',
      ),
    },
  })
  if (!sent.ok) {
    console.error('Resend email:', sent.status, JSON.stringify(sent.data))
    return answer(false, 502)
  }
  return answer(true)
}
