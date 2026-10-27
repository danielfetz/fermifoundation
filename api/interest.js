// Interest in a tournament, from the cards under Upcoming tournaments on the home page: sent by assets/site.js or,
// without JavaScript, posted straight here. Like api/subscribe.js, adds the address to Resend's contacts, not yet
// subscribed, and emails a link to confirm it (api/confirm.js), which puts them into that tournament's segment only, not
// on the list for updates. Someone already on the tournament's list gets no email, but the same answer.
const {
  FROM, TOURNAMENTS, tournamentSegment, resend, sign, contactFor, segmentsOf, segmentIds, confirmEmail, origin,
} = require('./_resend.js')

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
  // Already on this tournament's list: no email (if Resend can't say, they get one)
  if (contact.subscribed && (await segmentsOf(contact.id).catch(() => new Map())).has(tournamentSegment(city))) {
    return answer(true)
  }

  // The tournament's segment, made now if it's the first sign-up, so the link never has to make it (a link opened twice
  // at once could make it twice)
  await segmentIds([tournamentSegment(city)]).catch(error => console.error('Resend segment:', error.message))

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
