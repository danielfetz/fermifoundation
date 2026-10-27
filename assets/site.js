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

// For schools sign-up: the answers go to a Google Form, which doesn't let the page read its reply. So the browser checks the
// required fields, and once the request is sent we show the thanks. Without JavaScript the form posts to Google directly.
const hostForm = document.querySelector('#host-form')
const hostFormDone = document.querySelector('#host-form-done')

if (hostForm && hostFormDone) {
  const button = hostForm.querySelector('button[type="submit"]')
  const error = hostForm.querySelector('.form__error')

  hostForm.addEventListener('submit', async event => {
    event.preventDefault()
    // Only bots fill in the hidden field: pretend it worked
    const isBot = hostForm.elements.website.value !== ''

    const data = new URLSearchParams()
    for (const [name, value] of new FormData(hostForm)) {
      // Optional questions left empty aren't sent at all, which is how Google takes "no answer"
      if (!name.startsWith('entry.') || value === '') continue
      const date = hostForm.elements[name].type === 'date' && value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (date) {
        // Google takes a date as separate year, month and day
        data.append(`${name}_year`, date[1])
        data.append(`${name}_month`, String(Number(date[2])))
        data.append(`${name}_day`, String(Number(date[3])))
      } else {
        data.append(name, value)
      }
    }

    button.disabled = true
    error.hidden = true
    try {
      if (!isBot) await fetch(hostForm.action, { method: 'POST', mode: 'no-cors', body: data })
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

// Updates: the sign-up forms in the page (home, /updates/), and a short one in a pop-up, with a small heading over each
// field. They send to
// /api/subscribe (api/subscribe.js), which emails a link to confirm. The pop-up comes up by itself once: on laptops
// when the mouse leaves the page at the top, heading for the tabs or the close button, after 10 seconds on the page;
// on phones and tablets after 30 seconds on it. Then not again for 30 days, and never after signing up or sending the
// For schools form. "Get updates" in the menu opens it any time. The Play page doesn't load this script, so never there.
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

  // Whether it may come up by itself now: never once someone has signed up, sent the For schools form or seen it lately; not
  // while they type, or while a sign-up form is on screen anyway
  const DAY = 24 * 60 * 60 * 1000
  const mayOpen = () => {
    const known = remember.get()
    if (known.signedUp || known.host || (known.seen && Date.now() - known.seen < 30 * DAY)) return 'never'
    if (document.querySelector('dialog[open]') || document.activeElement?.matches('input, textarea, select')) return 'later'
    const inView = [...document.querySelectorAll('form.su')].some(form => {
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
