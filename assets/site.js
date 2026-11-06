// Mobile menu: the button opens a sheet below the bar; picking a link or pressing Escape closes it
const nav = document.querySelector('.nav')
const toggle = nav && nav.querySelector('.nav__toggle')
const sheet = nav && nav.querySelector('.nav__sheet')

if (toggle && sheet) {
  const setOpen = open => {
    nav.classList.toggle('is-open', open)
    // The page background follows, so Safari paints the strip under the notch in the menu's color too
    document.documentElement.classList.toggle('menu-open', open)
    sheet.hidden = !open
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
  }

  toggle.addEventListener('click', () => setOpen(sheet.hidden))
  sheet.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false)
  })
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !sheet.hidden) {
      setOpen(false)
      toggle.focus()
    }
  })
}

// For schools sign-up: the answers go to /api/host (api/host.js), which passes them on to the Google Form, with how long
// the page has been open, so it can tell people from bots. Without JavaScript the form posts there directly, and comes
// back to the page with #failed (the time is missing), which offers the email address instead.
const hostForm = document.querySelector('#host-form')
const hostFormDone = document.querySelector('#host-form-done')
const pageOpened = Date.now()

if (hostForm && hostFormDone) {
  const button = hostForm.querySelector('button[type="submit"]')
  const error = hostForm.querySelector('.form__error')

  hostForm.addEventListener('submit', async event => {
    event.preventDefault()
    button.disabled = true
    error.hidden = true
    try {
      const response = await fetch(hostForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(hostForm)), elapsed: Date.now() - pageOpened }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      remember.set({ host: Date.now() })
      hostForm.hidden = true
      hostFormDone.hidden = false
      hostFormDone.focus()
    } catch {
      error.hidden = false
    } finally {
      button.disabled = false
    }
  })
}

// For companies: the request goes to /api/team (api/team.js), which emails it to us. Without JavaScript the form posts
// there directly, and comes back to the page saying how it went (#sent, #failed).
const teamForm = document.querySelector('#team-form')
const teamFormDone = document.querySelector('#team-form-done')

if (teamForm && teamFormDone) {
  const button = teamForm.querySelector('button[type="submit"]')
  const error = teamForm.querySelector('.form__error')

  teamForm.addEventListener('submit', async event => {
    event.preventDefault()
    button.disabled = true
    error.hidden = true
    try {
      const response = await fetch(teamForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(teamForm))),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      teamForm.hidden = true
      teamFormDone.hidden = false
      teamFormDone.focus()
    } catch {
      error.hidden = false
    } finally {
      button.disabled = false
    }
  })
}

// Upcoming tournaments: "I’m interested" opens a field for the email in the card, which goes to /api/interest
// (api/interest.js); then the card says to confirm with the link it emails. Escape closes the field again. Without
// JavaScript the form posts there directly, and comes back to the home page saying how it went (#interest-sent...).
for (const interest of document.querySelectorAll('.event__interest')) {
  const summary = interest.querySelector('summary')
  const form = interest.querySelector('form')
  const done = interest.nextElementSibling
  const button = form.querySelector('button[type="submit"]')
  const error = form.querySelector('.event__error')

  // Opened here rather than by the browser, so the field can take the focus during the tap (which is when phones
  // bring up the keyboard)
  summary.addEventListener('click', event => {
    event.preventDefault()
    interest.open = true
    form.elements.email.focus()
  })
  interest.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !interest.open) return
    interest.open = false
    summary.focus()
  })
  form.addEventListener('submit', async event => {
    event.preventDefault()
    button.disabled = true
    error.hidden = true
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      interest.hidden = true
      done.hidden = false
      done.focus()
    } catch {
      error.hidden = false
    } finally {
      button.disabled = false
    }
  })
}

// The tournament finder on the home page: a dot for each city on the map it's on, and the cities nearest you first,
// with how far each is, and where you are on the maps. Where you are: roughly where the visit comes from (/api/where,
// api/where.js, from Vercel), a place you type in (assets/data/places.json: every town of 30,000 people or more, and of
// 10,000 or more in the US, the UK, Canada, Ireland, Australia and New Zealand, from GeoNames), or your device's
// location if you ask. None of it is kept.
const finder = document.querySelector('.finder')

if (finder) {
  const list = finder.querySelector('.finder__list')
  const near = finder.querySelector('.finder__near')
  const search = finder.querySelector('.finder__search')
  const input = search.elements.q
  const suggestions = finder.querySelector('#finder-places')
  const intro = near.textContent
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
  const regionName = code => { try { return regionNames.of(code) } catch { return code } }
  const cities = [...list.children].map(item => ({ item, key: item.dataset.city, lat: +item.dataset.lat, lon: +item.dataset.lon }))

  // The maps' projections, as they were drawn (d3's conic equal-area: its parallels, central meridian, scale and
  // offset, in the pictures' own units), so places can be put on them here
  const MAPS = {
    us: { w: 720, h: 450, par: [29.5, 45.5], rot: 96, k: 959.2240719212782, t: [367.56461203652145, 306.91154700940876] },
    uk: { w: 330, h: 450, par: [50, 58], rot: 4, k: 2271.8468508540677, t: [173.62747157320388, 1078.2816726932483] },
  }
  const rad = Math.PI / 180
  const project = ({ par, rot, k, t }, lat, lon) => {
    const s0 = Math.sin(par[0] * rad), n = (s0 + Math.sin(par[1] * rad)) / 2, c = 1 + s0 * (2 * n - s0), r0 = Math.sqrt(c) / n
    const y0 = r0 - Math.sqrt(c - 2 * n * Math.sin(33.6442 * rad)) / n
    const r = Math.sqrt(c - 2 * n * Math.sin(lat * rad)) / n, l = (lon + rot) * rad * n
    return [t[0] + k * r * Math.sin(l), t[1] - k * (r0 - r * Math.cos(l) - y0)]
  }
  // The map a place is on, and where on it (as percentages), or nothing
  const onMap = (lat, lon) => {
    for (const [id, map] of Object.entries(MAPS)) {
      const [x, y] = project(map, lat, lon)
      if (x > 0 && x < map.w && y > 0 && y < map.h) return { id, x: (x / map.w) * 100, y: (y / map.h) * 100 }
    }
  }

  // A dot for each city, its name beside it (on the left if the city says so, to keep clear of a neighbour)
  for (const city of cities) {
    const at = onMap(city.lat, city.lon)
    if (!at) continue
    city.dot = document.createElement('span')
    city.dot.className = `finder__dot${city.item.dataset.label === 'left' ? ' finder__dot--left' : ''}`
    city.dot.style.setProperty('--x', `${at.x}%`)
    city.dot.style.setProperty('--y', `${at.y}%`)
    city.dot.append(Object.assign(document.createElement('span'), { textContent: city.item.querySelector('.finder__name').textContent }))
    finder.querySelector(`.finder__map--${at.id}`).append(city.dot)
  }

  // Distance on the globe, in km, and as the page says it (miles in the US and the UK)
  const km = (a, b) => {
    const h = Math.sin((b.lat - a.lat) * rad / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin((b.lon - a.lon) * rad / 2) ** 2
    return 12742 * Math.asin(Math.sqrt(h))
  }
  const far = (d, miles) => {
    const v = miles ? d / 1.609344 : d, unit = miles ? 'mi' : 'km'
    return v < 1 ? `< 1 ${unit}` : `${(v < 10 ? v.toFixed(1) : Math.round(v).toLocaleString('en-US'))} ${unit}`
  }
  // How a place is named: "Overland Park, KS", "Oxford, UK", "Munich, Germany"
  const placeName = ([city, country, region]) =>
    country === 'US' && /^[A-Z]{2}$/.test(region) ? `${city}, ${region}` : `${city}, ${country === 'GB' ? 'UK' : regionName(country)}`

  const show = (where, label, country) => {
    const miles = ['US', 'GB', 'LR', 'MM'].includes(country)
    const sorted = cities.map(c => ({ ...c, d: km(where, c) })).sort((a, b) => a.d - b.d)
    for (const [i, c] of sorted.entries()) {
      list.append(c.item)
      c.item.classList.toggle('is-near', i === 0)
      c.dot?.classList.toggle('is-near', i === 0)
      const p = c.item.querySelector('.finder__far')
      p.textContent = far(c.d, miles)
      p.hidden = false
    }
    near.replaceChildren('Tournaments nearest to ', Object.assign(document.createElement('b'), { textContent: label }))
    const at = onMap(where.lat, where.lon)
    for (const you of finder.querySelectorAll('.finder__you')) {
      you.hidden = !at || !you.parentElement.matches(`.finder__map--${at.id}`)
      if (you.hidden) continue
      you.style.setProperty('--x', `${at.x}%`)
      you.style.setProperty('--y', `${at.y}%`)
      // Its name on the left, away from a city's dot to its right, unless it's at the map's left edge
      you.classList.toggle('finder__you--right', at.x < 15)
      you.firstElementChild.textContent = label.split(',')[0]
    }
  }

  let places
  const loadPlaces = () => (places ??= fetch('/assets/data/places.json').then(r => r.json()))
  const fold = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

  // "Cambridge" is the biggest Cambridge; "Cambridge, MA", "Cambridge UK" or "Cambridge, United States" narrow it down
  const lookUp = async query => {
    const all = await loadPlaces()
    const [city, ...rest] = query.split(',').map(fold)
    const within = rest.join(' ').trim()
    const named = p => [p[2], p[1], regionName(p[1]), p[1] === 'GB' ? 'uk' : '', p[1] === 'US' ? 'usa' : ''].some(x => x && fold(x).startsWith(within))
    const exact = all.filter(p => fold(p[0]) === city && (!within || named(p)))
    const hits = exact.length ? exact : all.filter(p => fold(p[0]).startsWith(city) && (!within || named(p)))
    return hits.sort((a, b) => b[5] - a[5])[0]
  }

  search.addEventListener('submit', async event => {
    event.preventDefault()
    if (!input.value.trim()) return input.focus()
    const place = await lookUp(input.value).catch(() => null)
    if (!place) {
      near.textContent = `We couldn’t find “${input.value.trim()}”. Try a bigger town nearby.`
      return
    }
    show({ lat: place[3], lon: place[4] }, placeName(place), place[1])
  })

  // Suggestions as you type, the biggest places first
  input.addEventListener('focus', () => loadPlaces().catch(() => {}), { once: true })
  input.addEventListener('input', async () => {
    const q = fold(input.value)
    if (q.length < 2 || q.includes(',')) return
    const all = await loadPlaces().catch(() => [])
    suggestions.replaceChildren(...all.filter(p => fold(p[0]).startsWith(q)).sort((a, b) => b[5] - a[5]).slice(0, 8)
      .map(p => Object.assign(document.createElement('option'), { value: placeName(p) })))
  })

  // Your device's location, named after the nearest place on the list
  finder.querySelector('.finder__locate').addEventListener('click', () => {
    if (!navigator.geolocation) return
    near.textContent = 'Finding where you are…'
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const here = { lat: coords.latitude, lon: coords.longitude }
      const all = await loadPlaces().catch(() => [])
      let best, bestD = Infinity
      for (const p of all) {
        const d = km(here, { lat: p[3], lon: p[4] })
        if (d < bestD) [best, bestD] = [p, d]
      }
      show(here, best && bestD < 50 ? placeName(best) : 'your location', best?.[1])
    }, () => { near.textContent = intro })
  })

  // A first guess, from where the visit comes from
  fetch('/api/where').then(r => (r.ok ? r.json() : {})).then(w => {
    if (!Number.isFinite(w.lat) || !Number.isFinite(w.lon)) return
    show({ lat: w.lat, lon: w.lon }, w.city ? placeName([w.city, w.country, w.region]) : 'you', w.country)
  }).catch(() => {})
}

// The guide by email, in the home page's header: sent to /api/guide (api/guide.js) with how long the page has been
// open, so it can tell people from bots. Once sent the form stays as it is, and its button says so, until the address
// is changed (to fix a typo, say). Without JavaScript the form posts there directly, and comes back with #guide-sent
// or #guide-failed, which offers the guide online.
const guideForm = document.querySelector('.hero__guide')

if (guideForm) {
  const button = guideForm.querySelector('button[type="submit"]')
  const ask = button.innerHTML
  const error = guideForm.querySelector('.hero__guide-error')
  const status = document.querySelector('#guide-status')
  const sent = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Sent! Check your inbox'

  guideForm.addEventListener('submit', async event => {
    event.preventDefault()
    if (button.classList.contains('is-sent')) return
    button.disabled = true
    error.hidden = true
    try {
      const response = await fetch(guideForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(guideForm)), elapsed: Date.now() - pageOpened }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      remember.set({ guide: Date.now() })
      button.classList.add('is-sent')
      button.innerHTML = sent
      status.textContent = 'On its way! Check your inbox for the guide.'
    } catch {
      error.hidden = false
      button.disabled = false
    }
  })
  // Another address: the button asks again
  guideForm.elements.email.addEventListener('input', () => {
    if (!button.classList.contains('is-sent')) return
    button.classList.remove('is-sent')
    button.innerHTML = ask
    button.disabled = false
    status.textContent = ''
  })
}

// Updates: the sign-up forms in the page (home, /updates/), and a short one in a pop-up, with a small heading over each
// field. They send to
// /api/subscribe (api/subscribe.js), which emails a link to confirm. The pop-up comes up by itself once: on laptops
// when the mouse leaves the page at the top, heading for the tabs or the close button, after 10 seconds on the page;
// on phones and tablets after 30 seconds on it. Then not again for 30 days, and never after signing up, sending the
// For schools form or asking for the guide. "Get updates" in the menu opens it any time. The Play page doesn't load this
// script, so never there.
const remember = {
  get() {
    try { return JSON.parse(localStorage.getItem('fermi-updates')) || {} } catch { return {} }
  },
  set(values) {
    try { localStorage.setItem('fermi-updates', JSON.stringify({ ...remember.get(), ...values })) } catch {}
  },
}

const updatesForm = id => `
  <form class="su" action="/api/subscribe" method="post">
    <div class="su__row">
      <label class="su__label" for="${id}-email">Email</label>
      <input id="${id}-email" name="email" type="email" placeholder="Your email" autocomplete="email" required>
      <label class="su__label" for="${id}-role">I’m a <span>(optional)</span></label>
      <select id="${id}-role" name="role">
        <option value="" selected>Choose…</option>
        <option value="school">High school student</option>
        <option value="university">University student</option>
        <option value="teacher">Teacher or professor</option>
        <option value="other">Other</option>
      </select>
      <button class="btn btn--primary" type="submit">Sign up</button>
    </div>
    <div class="form__trap" aria-hidden="true">
      <label>Leave this empty <input name="website" type="text" tabindex="-1" autocomplete="off"></label>
    </div>
    <p class="su__note">You can unsubscribe at any time.</p>
    <p class="su__error" role="alert" hidden>That didn’t work. Please try again, or write us at <a class="link" href="mailto:contact@fermi.org">contact@fermi.org</a>.</p>
  </form>
  <div class="su-done" tabindex="-1" hidden>
    <h3>Check your inbox</h3>
    <p>We’ve sent a link to <b class="su-done__email"></b>. Click it to confirm, and you’re on the list.</p>
  </div>`

function wireUpdates(form) {
  const done = form.nextElementSibling
  const button = form.querySelector('button[type="submit"]')
  const error = form.querySelector('.su__error')
  form.addEventListener('submit', async event => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(form))
    button.disabled = true
    error.hidden = true
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      remember.set({ signedUp: Date.now() })
      done.querySelector('.su-done__email').textContent = String(data.email).trim()
      form.hidden = true
      done.hidden = false
      done.focus()
    } catch {
      error.hidden = false
    } finally {
      button.disabled = false
    }
  })
}
document.querySelectorAll('form.su').forEach(wireUpdates)

// The Sign up button takes the fields' rounded corners when it sits on one line with them, and stays a pill when it
// wraps under them (on phones, and in the pop-up). Checked again whenever a form changes width (.btn--beside, site.css).
const besideFields = new ResizeObserver(rows => rows.forEach(({ target: row }) => {
  const button = row.querySelector('.btn')
  const field = button.previousElementSibling
  button.classList.toggle('btn--beside', Math.abs(button.getBoundingClientRect().top - field.getBoundingClientRect().top) < 1)
}))
document.querySelectorAll('form.su .su__row').forEach(row => besideFields.observe(row))

let updatesDialog
function openUpdates(how) {
  if (!updatesDialog) {
    updatesDialog = document.createElement('dialog')
    updatesDialog.className = 'updates'
    updatesDialog.setAttribute('aria-labelledby', 'updates-title')
    updatesDialog.innerHTML = `
      <div class="updates__box">
        <div class="updates__head">
          <h2 class="updates__title" id="updates-title" tabindex="-1">Join the mailing list</h2>
          <button class="updates__close" type="button" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </button>
        </div>
        <p class="updates__text">We’ll let you know when we release new question sets, and whenever there’s other news about Fermi Poker.</p>
        ${updatesForm('updates')}
      </div>`
    document.body.append(updatesDialog)
    const form = updatesDialog.querySelector('form')
    wireUpdates(form)
    updatesDialog.querySelector('.updates__close').addEventListener('click', () => updatesDialog.close())
    // A click on the dimmed page around it closes it too
    updatesDialog.addEventListener('click', event => {
      if (event.target === updatesDialog) updatesDialog.close()
    })
    updatesDialog.addEventListener('close', () => {
      if (!remember.get().signedUp) remember.set({ seen: Date.now() })
      // Opened again later, it shows the form again
      if (form.hidden) {
        form.reset()
        form.hidden = false
        form.nextElementSibling.hidden = true
      }
    })
  }
  // Come up by itself, it counts as seen right away, even if they then leave without closing it
  if (how !== 'menu' && !remember.get().signedUp) remember.set({ seen: Date.now() })
  updatesDialog.showModal()
  // From the menu, straight to the email field; by itself, on its title, so no keyboard pops up on phones
  if (how === 'menu') updatesDialog.querySelector('input[type="email"]').focus()
  else updatesDialog.querySelector('.updates__title').focus()
}

// The pop-up is off for now, to come back in the new design: set this to true to show it again. While it's off, "Get
// updates" leads to the Get updates page, which has the same form.
const UPDATES_POPUP = false

if (UPDATES_POPUP && !location.pathname.startsWith('/updates/')) {
  document.querySelectorAll('a[href="/updates/"]').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    openUpdates('menu')
  }))

  // Whether it may come up by itself now: never once someone has signed up, sent the For schools form, asked for the guide
  // or seen it lately; not while they type, or while a sign-up form (or the guide's) is on screen anyway
  const DAY = 24 * 60 * 60 * 1000
  const mayOpen = () => {
    const known = remember.get()
    if (known.signedUp || known.host || known.guide || (known.seen && Date.now() - known.seen < 30 * DAY)) return 'never'
    if (document.querySelector('dialog[open]') || document.activeElement?.matches('input, textarea, select')) return 'later'
    const inView = [...document.querySelectorAll('form.su, form.hero__guide')].some(form => {
      const box = form.getBoundingClientRect()
      return box.bottom > 0 && box.top < innerHeight
    })
    return inView ? 'later' : 'now'
  }

  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    // Laptops: the mouse leaving the window at the top, on its way to the tabs, the address bar or the close button,
    // once someone has been on the page for 10 seconds. Browsers report where the mouse last was, which after a quick
    // flick can be well below the top edge, so it also counts when the mouse was heading up (more up than sideways)
    // and left from the top 80 pixels. Leaving at the sides or the bottom doesn't count.
    const armed = Date.now() + 10 * 1000
    let x = 0
    let y = 0
    let dx = 0
    let dy = 0
    const track = event => {
      dx = event.clientX - x
      dy = event.clientY - y
      x = event.clientX
      y = event.clientY
    }
    const leaving = event => {
      if (event.relatedTarget || Date.now() < armed) return
      if (event.clientY > 8 && !(event.clientY < 80 && dy < 0 && -dy >= Math.abs(dx))) return
      const may = mayOpen()
      if (may === 'later') return
      document.removeEventListener('mousemove', track)
      document.removeEventListener('mouseout', leaving)
      if (may === 'now') openUpdates('leaving')
    }
    document.addEventListener('mousemove', track, { passive: true })
    document.addEventListener('mouseout', leaving)
  } else {
    // Phones and tablets: 30 seconds on the page, counting only while it's on screen; if someone's busy, 10 more
    let wait = 30 * 1000
    let started = 0
    let timer = 0
    let over = false
    const arm = ms => {
      wait = ms
      started = Date.now()
      timer = setTimeout(fire, ms)
    }
    const fire = () => {
      timer = 0
      const may = mayOpen()
      if (may === 'later') return arm(10 * 1000)
      over = true
      if (may === 'now') openUpdates('timer')
    }
    document.addEventListener('visibilitychange', () => {
      if (over) return
      if (document.hidden && timer) {
        clearTimeout(timer)
        timer = 0
        wait -= Date.now() - started
      } else if (!document.hidden && !timer) {
        arm(Math.max(0, wait))
      }
    })
    if (!document.hidden) arm(wait)
  }
}

// Footnotes, on How to play: each number in the text leads to its note at the bottom of the page. On wide screens the
// notes also stand in the margin, each beside its line (a little lower where two would overlap); elsewhere, hovering
// over a number, or tapping it, shows its note in place, under it. From the keyboard, a number still leads to its note
// at the bottom, as it does without JavaScript.
const footnoteRefs = [...document.querySelectorAll('.fn-ref a')]

if (footnoteRefs.length) {
  const page = document.querySelector('.page')
  const wide = matchMedia('(min-width: 1230px)')
  const hover = matchMedia('(hover: hover) and (pointer: fine)')
  // A note's text, without its link back up
  const textOf = ref => {
    const copy = document.getElementById(ref.hash.slice(1)).cloneNode(true)
    copy.querySelectorAll('.fn-back').forEach(a => a.remove())
    return copy.innerHTML.trim()
  }

  // In the margin: a copy of each note right after its number, which site.css moves beside the text
  const sides = footnoteRefs.map(ref => {
    const side = document.createElement('span')
    side.className = 'sidenote'
    side.setAttribute('aria-hidden', 'true')
    side.innerHTML = `<span class="sidenote__n">${ref.textContent.replace(/\D/g, '')}</span>${textOf(ref)}`
    side.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'))
    ref.parentElement.after(side)
    return side
  })
  const place = () => {
    page.classList.toggle('page--sidenotes', wide.matches)
    if (!wide.matches) return
    let bottom = -Infinity
    for (const side of sides) {
      side.style.marginTop = ''
      const top = side.getBoundingClientRect().top + scrollY
      const shift = Math.max(0, bottom + 14 - top)
      if (shift) side.style.marginTop = `${shift}px`
      bottom = top + shift + side.offsetHeight
    }
  }
  place()
  document.fonts.ready.then(place)
  new ResizeObserver(place).observe(page)
  wide.addEventListener('change', place)

  // In place: under its number (or above it, near the bottom of the screen)
  const pop = document.createElement('div')
  pop.className = 'fn-pop'
  pop.setAttribute('role', 'note')
  pop.hidden = true
  document.body.append(pop)
  let open = null
  let leaving = 0
  const hide = () => {
    clearTimeout(leaving)
    if (!open) return
    open.setAttribute('aria-expanded', 'false')
    open = null
    pop.hidden = true
  }
  const hideSoon = () => {
    clearTimeout(leaving)
    leaving = setTimeout(hide, 300)
  }
  const show = ref => {
    clearTimeout(leaving)
    if (open === ref) return
    hide()
    open = ref
    ref.setAttribute('aria-expanded', 'true')
    pop.innerHTML = textOf(ref)
    pop.hidden = false
    const box = ref.getBoundingClientRect()
    const width = Math.min(380, innerWidth - 32)
    pop.style.width = `${width}px`
    pop.style.left = `${scrollX + Math.max(16, Math.min(box.left - 20, innerWidth - width - 16))}px`
    const below = box.bottom + 8
    const above = box.top - 8 - pop.offsetHeight
    pop.style.top = `${scrollY + (below + pop.offsetHeight > innerHeight && above > 0 ? above : below)}px`
  }
  const flash = side => {
    side.classList.add('is-lit')
    setTimeout(() => side.classList.remove('is-lit'), 900)
  }
  footnoteRefs.forEach((ref, i) => {
    ref.setAttribute('aria-expanded', 'false')
    ref.addEventListener('click', event => {
      // From the keyboard (no pointer, so no click count), the link does what it does without JavaScript
      if (event.detail === 0) return
      event.preventDefault()
      if (wide.matches) flash(sides[i])
      else if (open === ref) hide()
      else show(ref)
    })
    ref.addEventListener('mouseenter', () => {
      if (wide.matches) sides[i].classList.add('is-lit')
      else if (hover.matches) show(ref)
    })
    ref.addEventListener('mouseleave', () => {
      sides[i].classList.remove('is-lit')
      if (hover.matches) hideSoon()
    })
  })
  pop.addEventListener('mouseenter', () => clearTimeout(leaving))
  pop.addEventListener('mouseleave', () => {
    if (hover.matches) hideSoon()
  })
  document.addEventListener('click', event => {
    if (open && !pop.contains(event.target) && !event.target.closest('.fn-ref')) hide()
  })
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') hide()
  })
  addEventListener('resize', hide)
}

// Old links to the home page's FAQ and Educational value, which now have their own page
if (location.pathname === '/' && (location.hash === '#faq' || location.hash === '#learn')) {
  location.replace(location.hash === '#faq' ? '/faq/' : '/faq/#educational-value')
}

// FAQ page: each part becomes a tab, named by its heading. A link to a part (/faq/#hosting) opens its tab, and a link
// to a question (/faq/#is-it-gambling) opens its tab and the question. Without JavaScript the parts follow one another.
const faqTabs = document.querySelector('.faq__tabs')

if (faqTabs) {
  const panels = [...document.querySelectorAll('.faq__panel')]
  const tabs = panels.map(panel => {
    const heading = panel.querySelector('.faq__heading')
    const tab = document.createElement('button')
    tab.type = 'button'
    tab.className = 'faq__tab'
    tab.id = `${panel.id}-tab`
    tab.textContent = heading.textContent
    tab.setAttribute('role', 'tab')
    tab.setAttribute('aria-controls', panel.id)
    panel.setAttribute('role', 'tabpanel')
    panel.setAttribute('aria-labelledby', tab.id)
    heading.hidden = true
    faqTabs.append(tab)
    return tab
  })
  const select = (index, focus) => {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index))
      tab.tabIndex = i === index ? 0 : -1
      panels[i].hidden = i !== index
    })
    if (focus) tabs[index].focus()
  }
  // The part a link points to (opening the question it names), shown and scrolled to
  const followHash = () => {
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)))
    const panel = target && target.closest('.faq__panel')
    select(panel ? panels.indexOf(panel) : 0)
    if (!panel) return
    if (target.matches('details')) target.open = true
    ;(target === panel ? faqTabs : target).scrollIntoView()
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      select(i)
      history.replaceState(null, '', `#${panels[i].id}`)
    })
    // Arrow keys move between the tabs, as in other tab lists
    tab.addEventListener('keydown', event => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
      if (step) select((i + step + tabs.length) % tabs.length, true)
    })
  })
  followHash()
  faqTabs.hidden = false
  addEventListener('hashchange', followHash)
}

// Sections fade in as they come into view. What's wholly below the screen when the page loads starts out faded and a
// little lower (.reveal), and comes in (.is-in) once it's partly on screen; what comes into view together comes in one
// after the other. Anything that shows at all when the page opens, even only its top, stays as it is. Not for people
// who ask for less motion, and without JavaScript everything simply shows.
const revealable = document.querySelectorAll('.events h2, .event, .intro__inner > p, .start h2, .start-card, .home-faq h2, .home-faq .qa, .home-faq__more, .signup__text, .doc .page > .texts, .doc .page > .section, .faq__inner')

if (revealable.length && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const appear = new IntersectionObserver(entries => {
    let order = 0
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.style.transitionDelay = `${order++ * 90}ms`
      entry.target.classList.add('is-in')
      appear.unobserve(entry.target)
    }
  }, { rootMargin: '0px 0px -10% 0px' })
  for (const el of revealable) {
    if (el.getClientRects().length && el.getBoundingClientRect().top >= innerHeight) {
      el.classList.add('reveal')
      appear.observe(el)
    }
  }
}
