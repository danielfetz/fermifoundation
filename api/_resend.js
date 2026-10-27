// Shared by api/subscribe.js, api/interest.js and api/confirm.js: calls to Resend (resend.com), which keeps the lists
// of people who want updates or to hear about a tournament, and sends the emails. Its key is RESEND_API_KEY in the
// project's environment variables on Vercel. (Files starting with an underscore aren't functions of their own.)
const crypto = require('node:crypto')

// Who the emails come from, and who hears about each new confirmed sign-up
const FROM = 'Fermi Poker <contact@fermi.org>'
const NOTIFY = 'contact@fermi.org'

// What people can say they are, and the segment in Resend each goes into, besides the one with everyone. "student" is
// from before the forms asked high school and university students apart: links to confirm already sent with it still work.
const ROLES = {
  school: 'High school students',
  university: 'University students',
  teacher: 'Teachers and professors',
  other: 'Others',
  student: 'Students',
}
const EVERYONE = 'Fermi Poker updates'
const ROLE_NAMES = {
  school: 'High school student',
  university: 'University student',
  teacher: 'Teacher or professor',
  other: 'Other',
  student: 'Student',
}

// The tournaments people can ask to hear about (Upcoming tournaments, on the home page), by the key in its card's form,
// each with a segment of its own, "Boston tournament" and so on, apart from the one for updates. Once there's a date,
// a Broadcast to it tells them.
const TOURNAMENTS = {
  boston: 'Boston',
  berkeley: 'Berkeley',
  nyc: 'New York City',
  london: 'London',
  oxford: 'Oxford',
}
const tournamentSegment = city => `${TOURNAMENTS[city]} tournament`

// A link to confirm is good for a week
const LINK_DAYS = 7

// One call to Resend's API. Resend allows a few calls a second; if it asks us to wait, we do, up to three times.
async function resend(path, { method = 'GET', body } = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`https://api.resend.com${path}`, {
      method,
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (res.status === 429 && attempt < 3) {
      const wait = Math.min(Number(res.headers.get('retry-after')) || 1, 3)
      await new Promise(resolve => setTimeout(resolve, wait * 1000))
      continue
    }
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, status: res.status, data }
  }
}

// The signature on a link to confirm, so nobody can confirm someone else's address or change what they asked for.
// `what` is what they said they are (for updates), or "tournament:" and the city.
function sign(id, what, time) {
  return crypto.createHmac('sha256', process.env.RESEND_API_KEY || '')
    .update(`confirm\n${id}\n${what}\n${time}`)
    .digest('base64url')
    .slice(0, 32)
}

function signedOk(id, what, time, signature) {
  const expected = Buffer.from(sign(id, what, time))
  const given = Buffer.from(String(signature))
  return given.length === expected.length && crypto.timingSafeEqual(given, expected)
}

// The contact for an address: the one there, or a new one, not subscribed until they confirm. Answers its id, and
// whether it's subscribed (to something: what to, its segments say), or null if Resend didn't answer. A contact is
// made only once Resend says there's none, so making one never touches one that's there.
async function contactFor(email) {
  // The address as it is in the path, as Resend's own library sends it, but for what would end the path
  const found = await resend(`/contacts/${email.replace(/[/?#%\\]/g, encodeURIComponent)}`)
  if (found.ok && found.data.id) return { id: found.data.id, subscribed: found.data.unsubscribed === false }
  if (found.status !== 404) {
    console.error('Resend contact:', found.status, JSON.stringify(found.data))
    return null
  }
  const made = await resend('/contacts', { method: 'POST', body: { email, unsubscribed: true } })
  if (made.ok && made.data.id) return { id: made.data.id, subscribed: false }
  console.error('Resend new contact:', made.status, JSON.stringify(made.data))
  return null
}

// Every page of a list from Resend (a hundred at a time)
async function listAll(path) {
  const items = []
  for (let after = ''; ;) {
    const page = await resend(`${path}?limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}`)
    if (!page.ok) throw new Error(`listing ${path}: ${page.status} ${JSON.stringify(page.data)}`)
    const data = page.data.data || []
    items.push(...data)
    if (!page.data.has_more || !data.length) return items
    after = data[data.length - 1].id
  }
}

// The segments a contact is in, by name (each to its id)
async function segmentsOf(id) {
  return new Map((await listAll(`/contacts/${encodeURIComponent(id)}/segments`)).map(segment => [segment.name, segment.id]))
}

// Takes a contact out of segments (from segmentsOf)
async function removeFromSegments(id, segments) {
  for (const [name, segment] of segments) {
    const removed = await resend(`/contacts/${encodeURIComponent(id)}/segments/${encodeURIComponent(segment)}`, { method: 'DELETE' })
    if (!removed.ok) throw new Error(`taking out of ${name}: ${removed.status} ${JSON.stringify(removed.data)}`)
  }
}

// The ids of segments, by name, making any that don't exist yet. One that can't be made may just have been made by
// another request at the same moment (a link opened twice), so then it's looked for again.
async function segmentIds(names) {
  const segmentsByName = async () => new Map((await listAll('/segments')).map(segment => [segment.name, segment.id]))
  const have = await segmentsByName()
  for (const name of names) {
    if (have.has(name)) continue
    const made = await resend('/segments', { method: 'POST', body: { name } })
    const segment = made.ok && made.data.id ? made.data.id : (await segmentsByName()).get(name)
    if (!segment) throw new Error(`making segment ${name}: ${made.status} ${JSON.stringify(made.data)}`)
    have.set(name, segment)
  }
  return have
}

// Puts a contact into segments by name, making any that don't exist yet. Answers their ids, by name.
async function addToSegments(id, names) {
  const have = await segmentIds(names)
  for (const name of names) {
    const added = await resend(`/contacts/${encodeURIComponent(id)}/segments/${encodeURIComponent(have.get(name))}`, { method: 'POST' })
    if (!added.ok) throw new Error(`adding to ${name}: ${added.status} ${JSON.stringify(added.data)}`)
  }
  return have
}

// Whether a contact is subscribed and in a segment (by name), looked at again after a moment, twice if need be: when a
// link opened twice at once trips over itself, the other request may well have done it all
async function onListAfterAll(id, name) {
  for (const wait of [1500, 3000]) {
    await new Promise(resolve => setTimeout(resolve, wait))
    const found = await resend(`/contacts/${encodeURIComponent(id)}`)
    if (found.ok && found.data.unsubscribed === false && (await segmentsOf(id).catch(() => new Map())).has(name)) return true
  }
  return false
}

// The ids of those in a segment who are subscribed (those who unsubscribed stay in it, but get nothing)
async function subscribedIn(segment) {
  const contacts = await listAll(`/segments/${encodeURIComponent(segment)}/contacts`)
  return new Set(contacts.filter(contact => contact.unsubscribed === false).map(contact => contact.id))
}

// The email with the link to confirm: one button, set like the site (cream paper, a grey frame, the blue button), with
// a plain-text twin. `asked` says what they asked for, and `then` what they'll hear about once on the list.
function confirmEmail(link, asked, then) {
  const sans = "Arial, 'Helvetica Neue', sans-serif"
  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#f7f7ea">
<div style="padding:32px 16px;background:#f7f7ea;color:#151d23">
  <div style="max-width:520px;margin:0 auto;padding:28px 28px 24px;border:4px solid #8a8e91;background:#fffef2">
    <h1 style="margin:0 0 12px;color:#000;font-family:Georgia, 'Times New Roman', serif;font-size:24px;line-height:1.25">Please confirm your email</h1>
    <p style="margin:0 0 22px;font-family:${sans};font-size:16px;line-height:1.5">${asked} Click the button to confirm, and you’re on the list. ${then}</p>
    <p style="margin:0 0 22px"><a href="${escape(link)}" style="display:inline-block;padding:12px 26px;border-radius:999px;background:#009dff;color:#ffffff;font-family:${sans};font-size:16px;font-weight:bold;text-decoration:none">Confirm my email</a></p>
    <p style="margin:0;color:#32424e;font-family:${sans};font-size:14px;line-height:1.5">The link works for ${LINK_DAYS} days. If you didn’t sign up, ignore this email and you won’t hear from us.</p>
  </div>
  <p style="max-width:520px;margin:16px auto 0;color:#6b767f;font-family:${sans};font-size:13px;line-height:1.5;text-align:center">Fermi Foundation · <a href="https://fermi.org" style="color:#6b767f">fermi.org</a></p>
</div>
</body></html>`
  const text = `Please confirm your email

${asked} Open this link to confirm, and you’re on the list:

${link}

${then}

The link works for ${LINK_DAYS} days. If you didn’t sign up, ignore this email and you won’t hear from us.

Fermi Foundation · fermi.org
`
  return { html, text }
}

// The site's own address, for links in emails (fermi.org, or a preview deployment's)
function origin(req) {
  return `https://${req.headers['x-forwarded-host'] || req.headers.host}`
}

const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

module.exports = {
  FROM, NOTIFY, ROLES, EVERYONE, ROLE_NAMES, TOURNAMENTS, tournamentSegment, LINK_DAYS, resend, sign, signedOk, contactFor,
  segmentsOf, removeFromSegments, segmentIds, addToSegments, onListAfterAll, subscribedIn, confirmEmail, origin, escape,
}
