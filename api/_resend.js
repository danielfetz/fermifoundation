// Shared by api/subscribe.js and api/confirm.js: calls to Resend (resend.com), which keeps the list of people who
// want updates and sends the emails. Its key is RESEND_API_KEY in the project's environment variables on Vercel.
// (Files starting with an underscore aren't functions of their own.)
const crypto = require('node:crypto')

// Who the emails come from, and who hears about each new confirmed sign-up
const FROM = 'Fermi Poker <contact@fermi.org>'
const NOTIFY = 'contact@fermi.org'

// What people can say they are, and the segment in Resend each goes into, besides the one with everyone
const ROLES = { student: 'Students', teacher: 'Teachers and professors', other: 'Others' }
const EVERYONE = 'Fermi Poker updates'
const ROLE_NAMES = { student: 'Student', teacher: 'Teacher or professor', other: 'Other' }

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

// The signature on a link to confirm, so nobody can confirm someone else's address or change what they said they are
function sign(id, role, time) {
  return crypto.createHmac('sha256', process.env.RESEND_API_KEY || '')
    .update(`confirm\n${id}\n${role}\n${time}`)
    .digest('base64url')
    .slice(0, 32)
}

function signedOk(id, role, time, signature) {
  const expected = Buffer.from(sign(id, role, time))
  const given = Buffer.from(String(signature))
  return given.length === expected.length && crypto.timingSafeEqual(given, expected)
}

// Puts a contact into segments by name, making any that don't exist yet
async function addToSegments(id, names) {
  const list = await resend('/segments')
  if (!list.ok) throw new Error(`listing segments: ${list.status} ${JSON.stringify(list.data)}`)
  const have = new Map((list.data.data || []).map(segment => [segment.name, segment.id]))
  for (const name of names) {
    let segment = have.get(name)
    if (!segment) {
      const made = await resend('/segments', { method: 'POST', body: { name } })
      if (!made.ok) throw new Error(`making segment ${name}: ${made.status} ${JSON.stringify(made.data)}`)
      segment = made.data.id
    }
    const added = await resend(`/contacts/${encodeURIComponent(id)}/segments/${encodeURIComponent(segment)}`, { method: 'POST' })
    if (!added.ok) throw new Error(`adding to ${name}: ${added.status} ${JSON.stringify(added.data)}`)
  }
}

// The site's own address, for links in emails (fermi.org, or a preview deployment's)
function origin(req) {
  return `https://${req.headers['x-forwarded-host'] || req.headers.host}`
}

const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

module.exports = { FROM, NOTIFY, ROLES, EVERYONE, ROLE_NAMES, LINK_DAYS, resend, sign, signedOk, addToSegments, origin, escape }
