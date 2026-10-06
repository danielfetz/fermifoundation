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
