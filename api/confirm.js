// The link in the emails that api/subscribe.js and api/interest.js send. It checks the link's signature and age,
// then: for updates, it subscribes the contact in Resend, puts it into the segments (everyone, and what they said
// they are) and shows the Get updates page saying how it went (updates/index.html: #confirmed, #invalid or #failed);
// for a tournament, it adds the city to the contact's "tournaments" (no segment, and the rest of the contact as it
// was) and shows the home page (#interest-boston and so on, #interest-invalid or #interest-failed). Either way,
// contact@fermi.org hears about it.
const {
  FROM, NOTIFY, ROLES, EVERYONE, ROLE_NAMES, TOURNAMENTS, LINK_DAYS, resend, signedOk, segmentsOf, removeFromSegments,
  addToSegments, onListAfterAll, citiesOf, saveCities, escape,
} = require('./_resend.js')

module.exports = async function confirm(req, res) {
  const { id = '', r = '', t = '', ts = '', s = '' } = req.query || {}
  // A link from api/interest.js names the tournament (t); one from api/subscribe.js, what they said they are (r)
  const city = Object.hasOwn(TOURNAMENTS, t) ? t : ''
  const role = Object.hasOwn(ROLES, r) ? r : ''
  const page = t
    ? { done: `/#interest-${city}`, invalid: '/#interest-invalid', failed: '/#interest-failed' }
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
  const email = found.data.email || id
  if (city) return tournament(res, page, id, email, citiesOf(found.data), TOURNAMENTS[city])

  const segments = [EVERYONE, ...(role ? [ROLES[role]] : [])]
  const subscribed = found.data.unsubscribed === false
  try {
    const had = await segmentsOf(id)
    // Clicked twice (or opened by a mail filter first): nothing more to do
    if (subscribed && had.has(EVERYONE)) return res.redirect(303, page.done)
    // Not subscribed: new, or they unsubscribed before. Then out of any segments they were in, so what they unsubscribed
    // from stays that way: they'll hear only about what they've just confirmed.
    if (!subscribed) await removeFromSegments(id, had)
    await addToSegments(id, [EVERYONE])
    if (!subscribed) {
      const updated = await resend(`/contacts/${encodeURIComponent(id)}`, { method: 'PATCH', body: { unsubscribed: false } })
      if (!updated.ok) throw new Error(`subscribing: ${updated.status} ${JSON.stringify(updated.data)}`)
    }
  } catch (error) {
    console.error('Resend:', error.message)
    // The link opened twice at once (clicked again while it loaded, or by the mail app too) can trip over itself, while
    // the other request does it all: so before saying something went wrong, look again
    if (await onListAfterAll(id, EVERYONE)) return res.redirect(303, page.done)
    // Then contact@fermi.org hears what Resend said, to put it right (the link works again once it is)
    const told = await resend('/emails', {
      method: 'POST',
      body: {
        from: FROM,
        to: [NOTIFY],
        subject: `A sign-up for updates couldn’t be confirmed: ${email}`,
        text: `${email} followed the link to confirm their sign-up for updates, but it didn’t work, so they saw “Something went wrong”.\n\nWhat Resend said: ${error.message}\n\nThe link works until ${new Date((Number(ts) + LINK_DAYS * 86400) * 1000).toUTCString()}, so once this is put right it can be followed again.\n`,
      },
    })
    if (!told.ok) console.error('Resend notice:', told.status, JSON.stringify(told.data))
    return res.redirect(303, page.failed)
  }

  // The rest doesn't decide anything for them, so a hiccup only goes into the log. What they said they are has a
  // segment if the plan has room for it (Resend's free plan has three segments).
  const added = role ? await addToSegments(id, [ROLES[role]]).then(() => true, error => console.error('Resend segments:', error.message)) : false
  const lists = added ? segments : [EVERYONE]
  const sent = await resend('/emails', {
    method: 'POST',
    body: {
      from: FROM,
      to: [NOTIFY],
      subject: `New sign-up for updates: ${email}${role ? ` (${ROLE_NAMES[role]})` : ''}`,
      text: `${email} confirmed their sign-up for updates.\n\nI’m a: ${role ? ROLE_NAMES[role] : '(not answered)'}\n\nThey’re in Resend’s contacts, and in the segments ${lists.join(' and ')}.\n`,
      html: `<p><b>${escape(email)}</b> confirmed their sign-up for updates.</p><p>I’m a: ${role ? ROLE_NAMES[role] : '(not answered)'}</p><p>They’re in Resend’s contacts, and in the segments ${lists.map(escape).join(' and ')}.</p>`,
    },
  })
  if (!sent.ok) console.error('Resend notice:', sent.status, JSON.stringify(sent.data))
  return res.redirect(303, page.done)
}

// A tournament: the city goes onto the contact's "tournaments", and contact@fermi.org gets an email saying so. Whether
// they're subscribed, and to what, stays as it was. Either is a record of it, so it has worked unless both fail.
async function tournament(res, page, id, email, cities, name) {
  // Clicked twice (or opened by a mail filter first): nothing more to do
  if (cities.includes(name)) return res.redirect(303, page.done)
  cities.push(name)
  const problem = await saveCities(id, cities).then(() => '', error => {
    console.error('Resend:', error.message)
    return error.message
  })
  const wants = `confirmed they’d like to hear when there’s a date for the tournament in ${name}.`
  const where = problem
    ? `Their contact in Resend couldn’t be given the city (${problem}), so this email is the record of it.`
    : `On their contact in Resend, “tournaments” has every city they’ve signed up for: ${cities.join(', ')}.`
  const sent = await resend('/emails', {
    method: 'POST',
    body: {
      from: FROM,
      to: [NOTIFY],
      subject: `New sign-up for the ${name} tournament: ${email}`,
      text: `${email} ${wants}\n\n${where}\n`,
      html: `<p><b>${escape(email)}</b> ${escape(wants)}</p><p>${escape(where)}</p>`,
    },
  })
  if (!sent.ok) console.error('Resend notice:', sent.status, JSON.stringify(sent.data))
  return res.redirect(303, sent.ok || !problem ? page.done : page.failed)
}
