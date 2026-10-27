// The link in the emails that api/subscribe.js and api/interest.js send: checks its signature and age, subscribes the
// contact in Resend, puts it into the segments for what they asked for (for updates: everyone, and what they said they
// are; for a tournament: that tournament's), and lets contact@fermi.org know. Then it shows the page saying how it went:
// for updates the Get updates page (updates/index.html: #confirmed, #invalid or #failed), for a tournament the home
// page (#interest-confirmed, #interest-invalid or #interest-failed).
const {
  FROM, NOTIFY, ROLES, EVERYONE, ROLE_NAMES, TOURNAMENTS, tournamentSegment, LINK_DAYS, resend, signedOk, segmentsOf,
  removeFromSegments, addToSegments, subscribedIn, escape,
} = require('./_resend.js')

module.exports = async function confirm(req, res) {
  const { id = '', r = '', t = '', ts = '', s = '' } = req.query || {}
  // A link from api/interest.js names the tournament (t); one from api/subscribe.js, what they said they are (r)
  const city = Object.hasOwn(TOURNAMENTS, t) ? t : ''
  const role = Object.hasOwn(ROLES, r) ? r : ''
  const page = t
    ? { done: '/#interest-confirmed', invalid: '/#interest-invalid', failed: '/#interest-failed' }
    : { done: '/updates/#confirmed', invalid: '/updates/#invalid', failed: '/updates/#failed' }
  const age = Date.now() / 1000 - Number(ts)
  const what = city ? `tournament:${city}` : role
  if (!id || (t && !city) || !process.env.RESEND_API_KEY || !signedOk(id, what, ts, s) || !(age >= 0 && age < LINK_DAYS * 86400)) {
    return res.redirect(303, page.invalid)
  }

  const found = await resend(`/contacts/${encodeURIComponent(id)}`)
  if (!found.ok) {
    console.error('Resend contact:', found.status, JSON.stringify(found.data))
    return res.redirect(303, page.failed)
  }
  const segments = city ? [tournamentSegment(city)] : [EVERYONE, ...(role ? [ROLES[role]] : [])]
  const subscribed = found.data.unsubscribed === false
  let ids
  try {
    const had = await segmentsOf(id)
    // Clicked twice (or opened by a mail filter first): nothing more to do
    if (subscribed && had.has(segments[0])) return res.redirect(303, page.done)
    // Not subscribed: new, or they unsubscribed before. Then out of any segments they were in, so what they unsubscribed
    // from stays that way: they'll hear only about what they've just confirmed.
    if (!subscribed) await removeFromSegments(id, had)
    ids = await addToSegments(id, segments)
    if (!subscribed) {
      const updated = await resend(`/contacts/${encodeURIComponent(id)}`, { method: 'PATCH', body: { unsubscribed: false } })
      if (!updated.ok) throw new Error(`subscribing: ${updated.status} ${JSON.stringify(updated.data)}`)
    }
  } catch (error) {
    console.error('Resend:', error.message)
    return res.redirect(303, page.failed)
  }

  // The rest doesn't decide anything for them, so a hiccup only goes into the log
  const email = found.data.email || ''
  let notice
  if (city) {
    // With how many are on the list now, them included (a list made a moment ago may not show them yet)
    const count = await subscribedIn(ids.get(segments[0])).then(list => list.add(id).size).catch(error => {
      console.error('Resend count:', error.message)
    })
    const wants = `confirmed they’d like to hear when there’s a date for the tournament in ${TOURNAMENTS[city]}.` +
      (count ? ` That makes ${count === 1 ? '1 person' : `${count} people`} on the list for it.` : '')
    const where = `They’re in Resend’s contacts, in the segment ${segments[0]}: once there’s a date, a Broadcast to it tells them all.`
    notice = {
      subject: `New sign-up for the ${TOURNAMENTS[city]} tournament: ${email}`,
      text: `${email} ${wants}\n\n${where}\n`,
      html: `<p><b>${escape(email)}</b> ${escape(wants)}</p><p>${escape(where)}</p>`,
    }
  } else {
    notice = {
      subject: `New sign-up for updates: ${email}${role ? ` (${ROLE_NAMES[role]})` : ''}`,
      text: `${email} confirmed their sign-up for updates.\n\nI’m a: ${role ? ROLE_NAMES[role] : '(not answered)'}\n\nThey’re in Resend’s contacts, and in the segments ${segments.join(' and ')}.\n`,
      html: `<p><b>${escape(email)}</b> confirmed their sign-up for updates.</p><p>I’m a: ${role ? ROLE_NAMES[role] : '(not answered)'}</p><p>They’re in Resend’s contacts, and in the segments ${segments.map(escape).join(' and ')}.</p>`,
    }
  }
  const sent = await resend('/emails', { method: 'POST', body: { from: FROM, to: [NOTIFY], ...notice } })
  if (!sent.ok) console.error('Resend notice:', sent.status, JSON.stringify(sent.data))

  return res.redirect(303, page.done)
}
