// The link in the email that api/subscribe.js sends: checks its signature and age, subscribes the contact in Resend,
// puts it into the segments (everyone, and what they said they are), and lets contact@fermi.org know. Then it shows
// the Get updates page saying how it went (updates/index.html, #confirmed, #invalid or #failed).
const { FROM, NOTIFY, ROLES, EVERYONE, ROLE_NAMES, LINK_DAYS, resend, signedOk, addToSegments, escape } = require('./_resend.js')

module.exports = async function confirm(req, res) {
  const { id = '', r = '', ts = '', s = '' } = req.query || {}
  const role = ROLES[r] ? r : ''
  const age = Date.now() / 1000 - Number(ts)
  if (!id || !process.env.RESEND_API_KEY || !signedOk(id, role, ts, s) || !(age >= 0 && age < LINK_DAYS * 86400)) {
    return res.redirect(303, '/updates/#invalid')
  }

  const found = await resend(`/contacts/${encodeURIComponent(id)}`)
  if (!found.ok) {
    console.error('Resend contact:', found.status, JSON.stringify(found.data))
    return res.redirect(303, '/updates/#failed')
  }
  // Clicked twice (or opened by a mail filter first): nothing more to do
  if (found.data.unsubscribed === false) return res.redirect(303, '/updates/#confirmed')

  const updated = await resend(`/contacts/${encodeURIComponent(id)}`, { method: 'PATCH', body: { unsubscribed: false } })
  if (!updated.ok) {
    console.error('Resend subscribe:', updated.status, JSON.stringify(updated.data))
    return res.redirect(303, '/updates/#failed')
  }

  // The rest doesn't decide anything for them, so a hiccup only goes into the log
  const segments = [EVERYONE, ...(role ? [ROLES[role]] : [])]
  await addToSegments(id, segments).catch(error => console.error('Resend segments:', error.message))
  const email = found.data.email || ''
  const sent = await resend('/emails', {
    method: 'POST',
    body: {
      from: FROM,
      to: [NOTIFY],
      subject: `New sign-up for updates: ${email}${role ? ` (${ROLE_NAMES[role]})` : ''}`,
      text: `${email} confirmed their sign-up for updates.\n\nI’m a: ${role ? ROLE_NAMES[role] : '(not answered)'}\n\nThey’re in Resend’s contacts, and in the segments ${segments.join(' and ')}.\n`,
      html: `<p><b>${escape(email)}</b> confirmed their sign-up for updates.</p><p>I’m a: ${role ? ROLE_NAMES[role] : '(not answered)'}</p><p>They’re in Resend’s contacts, and in the segments ${segments.map(escape).join(' and ')}.</p>`,
    },
  })
  if (!sent.ok) console.error('Resend notice:', sent.status, JSON.stringify(sent.data))

  return res.redirect(303, '/updates/#confirmed')
}
