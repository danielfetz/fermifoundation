// Offers to organize a tournament open to everyone in a city, from the form on Partner with us (partner/index.html):
// sent by assets/site.js or, without JavaScript, posted straight here. Emails each to contact@fermi.org, so that
// replying answers whoever sent it.
const { FROM, NOTIFY, resend, escape } = require('./_resend.js')

// The form's fields, in the order the email lists them: the name in the form, its label, and how long it may be
const FIELDS = [
  ['name', 'Name', 200],
  ['email', 'Email', 254],
  ['city', 'City and country', 200],
  ['more', 'More', 5000],
]

module.exports = async function partner(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }
  // The form on the site asks for JSON; a plain form post gets the page back, saying what happened
  const json = String(req.headers.accept || '').includes('application/json')
  const answer = (ok, status = ok ? 200 : 400) => json
    ? res.status(status).json({ ok })
    : res.redirect(303, ok ? '/partner/#sent' : '/partner/#failed')

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  // Only bots fill in the hidden field: pretend it worked
  if (body.website) return answer(true)
  const form = {}
  for (const [key, , max] of FIELDS) {
    form[key] = String(body[key] || '').trim()
    if (form[key].length > max) return answer(false)
  }
  if (!form.name || !form.city || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return answer(false)
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing')
    return answer(false, 500)
  }

  const rows = FIELDS.map(([key, label]) => [label, form[key] || '(not answered)'])
  const sent = await resend('/emails', {
    method: 'POST',
    body: {
      from: FROM,
      to: [NOTIFY],
      reply_to: form.email,
      subject: `Organizing a tournament in ${form.city}`.replace(/\s+/g, ' '),
      text: `An offer from the Partner with us page. Reply to this email to answer ${form.name}.\n\n${rows.map(([label, value]) => `${label}: ${value}`).join('\n')}\n`,
      html: `<p>An offer from the Partner with us page. Reply to this email to answer ${escape(form.name)}.</p>${rows.map(([label, value]) => `<p><b>${label}:</b> ${escape(value).replace(/\n/g, '<br>')}</p>`).join('')}`,
    },
  })
  if (!sent.ok) {
    console.error('Resend email:', sent.status, JSON.stringify(sent.data))
    return answer(false, 502)
  }
  return answer(true)
}
