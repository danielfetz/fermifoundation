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

// Host sign-up: the answers go to a Google Form, which doesn't let the page read its reply. So the browser checks the
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
      if (!name.startsWith('entry.')) continue
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
