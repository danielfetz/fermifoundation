// Sign-ups from schools and universities, from the form on For schools (host/index.html): sent by assets/site.js or,
// without JavaScript, posted straight here. Passes them on to the Google Form whose answers fill the Google Sheet, so
// the form's address stays off the page, where bots found it and posted to it directly. Its address is HOST_FORM_URL
// in the project's environment variables on Vercel (the form's link, ending in /formResponse). The fields' IDs below are
// that form's: a new form has its own, in its "Get pre-filled link".
const GOOGLE_FORM = process.env.HOST_FORM_URL ||
  'https://docs.google.com/forms/d/e/1FAIpQLSedrDBgiFtLCRzoa89NS37JuW8GJ1IdJbVU7rrM0b7nzaFuOg/formResponse'

// The form's fields: the name on the page, the Google Form's field ID, how long it may be, and whether it's required
const FIELDS = [
  ['name', 'entry.944777299', 200, true],
  ['email', 'entry.823906579', 254, true],
  ['school', 'entry.1487216815', 300, true],
  ['place', 'entry.1968065858', 300, true],
  ['players', 'entry.322329381', 10, false],
  ['date', 'entry.1555696815', 10, false],
  ['sponsor', 'entry.1903212903', 3, true],
  ['more', 'entry.1242649101', 5000, false],
]

// Anyone faster than this from opening the page to sending hasn't read the form
const QUICKEST = 4000
const LINK = /https?:\/\/|www\./i

module.exports = async function host(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }
  // The form on the site asks for JSON; a plain form post gets the page back, saying what happened
  const json = String(req.headers.accept || '').includes('application/json')
  const answer = (ok, status = ok ? 200 : 400) => json
    ? res.status(status).json({ ok })
    : res.redirect(303, ok ? '/host/#sent' : '/host/#failed')

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  // assets/site.js says how long the page was open; a post without it didn't come from the page
  const elapsed = Number(body.elapsed)
  if (!Number.isFinite(elapsed)) return answer(false)
  // Only bots fill in the hidden field, send within seconds, or put links where a name goes (links in Tell us more are
  // fine): pretend it worked
  if (body.website || elapsed < QUICKEST) return answer(true)

  const form = {}
  for (const [key, , max, required] of FIELDS) {
    form[key] = String(body[key] || '').trim()
    if (form[key].length > max || (required && !form[key])) return answer(false)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || !['Yes', 'No'].includes(form.sponsor)) return answer(false)
  if (form.players && !/^\d+$/.test(form.players)) return answer(false)
  if (form.date && !/^\d{4}-\d{2}-\d{2}$/.test(form.date)) return answer(false)
  if ([form.name, form.school, form.place].some(value => LINK.test(value))) return answer(true)

  const data = new URLSearchParams()
  for (const [key, entry] of FIELDS) {
    // Optional questions left empty aren't sent at all, which is how Google takes "no answer"
    if (!form[key]) continue
    if (key === 'date') {
      // Google takes a date as separate year, month and day
      const [year, month, day] = form.date.split('-')
      data.append(`${entry}_year`, year)
      data.append(`${entry}_month`, String(Number(month)))
      data.append(`${entry}_day`, String(Number(day)))
    } else {
      data.append(entry, form[key])
    }
  }
  try {
    const sent = await fetch(GOOGLE_FORM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data,
      redirect: 'manual',
    })
    if (sent.status >= 400) {
      console.error('Google Form:', sent.status)
      return answer(false, 502)
    }
  } catch (error) {
    console.error('Google Form:', error)
    return answer(false, 502)
  }
  return answer(true)
}
