// Play page: the question, hint and answer cards on screen, for tables without printed cards.
// Cards turned over land on a pile; the rest wait face down in the deck. The answer turns over only when held, so
// nobody reveals it by accident. On phones, from hint 2 on, earlier cards fold to one line (see play.css), and tapping
// one shows it in full. Where you are is remembered on this device.
(() => {
  const questions = window.FERMI_QUESTIONS || [];
  const pile = document.getElementById('pile');
  const note = document.getElementById('table-note');
  const deck = document.getElementById('deck');
  const count = document.getElementById('play-count');
  const live = document.getElementById('play-live');
  const prev = document.querySelector('[data-go="-1"]');
  const next = document.querySelector('[data-go="1"]');
  if (!pile || !deck || !questions.length) return;

  const CARDS = [
    { name: 'Question', then: 'write your guess, then betting round 1.' },
    { name: 'Hint 1', then: 'betting round 2.' },
    { name: 'Hint 2', then: 'betting round 3.' },
    { name: 'Answer', then: 'betting round 4, then the showdown.' },
  ];
  const HOLD_MS = 600;
  const STORE = 'fermi-play';
  // Phones fold earlier cards (the same media query as in play.css)
  const folding = matchMedia('(max-width: 899px) and (max-height: 1000px)');
  const mouse = matchMedia('(pointer: fine)');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');

  // Which question you're on, and how many of each question's cards are turned over
  let state = { q: 0, shown: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    if (saved && Number.isInteger(saved.q) && saved.q >= 0 && saved.q < questions.length) {
      state = { q: saved.q, shown: saved.shown || {} };
    }
  } catch {}
  const save = () => {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch {}
  };
  const shownOf = (q) => Math.min(4, Math.max(0, state.shown[q] | 0));

  const el = (tag, className, ...children) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.append(...children);
    return node;
  };
  const textOf = (q, i) => (i === 0 ? q.question : i === 3 ? q.answer : q.hints[i - 1]);
  const theCard = (i) => (i === 0 ? 'the question' : i === 3 ? 'the answer' : CARDS[i].name.toLowerCase());
  const verb = () => (mouse.matches ? 'Click' : 'Tap');

  // A card face up: which card it is, its text, and what comes next. The one-line version shows when it's folded.
  function card(q, i, tag = 'li') {
    const body = i === 3
      ? el('div', 'pc__body', el('p', 'pc__value', q.answer), ...(q.note ? [el('p', 'pc__note', q.note)] : []))
      : el('div', 'pc__body', el('p', 'pc__text', textOf(q, i)));
    const node = el(tag, 'pc',
      el('p', 'pc__peek', el('b', '', CARDS[i].name), ' ' + textOf(q, i)),
      el('div', 'pc__top', el('b', '', CARDS[i].name), el('span', '', `${i + 1} of 4`)),
      body,
      el('p', 'pc__next', el('b', '', 'Next:'), ' ' + CARDS[i].then));
    node.dataset.card = i;
    return node;
  }

  // A card face down, on top of the deck
  function back(top, side, name, action, label) {
    const portrait = el('img');
    portrait.src = '/assets/img/fermi-logo.webp';
    portrait.alt = '';
    const node = el('button', 'back back--next',
      el('span', 'back__top', el('b', '', top), el('span', '', side)),
      el('span', 'back__row', el('span', 'back__kind', name), el('span', 'back__tap', action)),
      el('span', 'back__mark', portrait, 'Fermi Poker'));
    node.type = 'button';
    node.setAttribute('aria-label', label);
    return node;
  }

  function render(fresh = false) {
    closeLift(false);
    const q = questions[state.q];
    const n = shownOf(state.q);
    const hadFocus = deck.contains(document.activeElement);
    count.textContent = `Question ${state.q + 1}`;
    prev.disabled = state.q === 0;
    next.disabled = state.q === questions.length - 1;

    pile.replaceChildren(...Array.from({ length: n }, (_, i) => card(q, i)));
    pile.classList.toggle('is-folded', n >= 3);
    const top = pile.lastElementChild;
    if (top) top.classList.add('pc--focus');
    if (top && fresh) top.classList.add('pc--new');
    note.hidden = n > 0;
    note.querySelector('b').textContent = `Question ${state.q + 1}`;
    markFolded();

    const left = 4 - n;
    if (left > 0) {
      const button = n === 3
        ? back('Up next', '4 of 4', 'Answer', 'Hold to turn over', 'Hold to turn over the answer')
        : back('Up next', `${n + 1} of 4`, CARDS[n].name, `${verb()} to turn over`, `Turn over ${theCard(n)}`);
      if (n === 3) button.dataset.hold = '';
      const under = el('div', 'back back--under');
      under.setAttribute('aria-hidden', 'true');
      deck.replaceChildren(...(left > 1 ? [under] : []), button, el('p', 'deck__left', `${left} card${left > 1 ? 's' : ''} left`));
    } else {
      // All four turned over: the next question waits on the deck
      const last = state.q === questions.length - 1;
      const button = last
        ? back('Up next', '', 'Question 1', 'Start again', 'Start again from question 1')
        : back('Up next', '', `Question ${state.q + 2}`, `${verb()} to start`, `Start question ${state.q + 2}`);
      button.dataset.next = '';
      deck.replaceChildren(button);
    }
    if (hadFocus) deck.querySelector('button')?.focus({ preventScroll: true });
    if (top && fresh) top.scrollIntoView({ block: 'nearest', behavior: calm.matches ? 'auto' : 'smooth' });
  }

  // Taps that come too quickly after a card was turned over are ignored, so a double tap can't turn over two cards
  let quietUntil = 0;
  function turnOver() {
    const n = shownOf(state.q);
    if (n >= 4 || Date.now() < quietUntil) return;
    quietUntil = Date.now() + 400;
    state.shown[state.q] = n + 1;
    save();
    render(true);
    const q = questions[state.q];
    live.textContent = n === 3 ? `Answer: ${q.answer}. ${q.note || ''}` : `${CARDS[n].name}: ${textOf(q, n)}`;
  }
  function go(q) {
    if (q < 0 || q >= questions.length) return;
    state.q = q;
    save();
    render();
    live.textContent = `Question ${q + 1}`;
  }
  function startNext() {
    if (Date.now() < quietUntil) return;
    quietUntil = Date.now() + 400;
    if (state.q < questions.length - 1) return go(state.q + 1);
    state = { q: 0, shown: {} };
    save();
    render();
    live.textContent = 'Question 1';
  }

  // The deck: a click turns over a hint or the question; the answer needs a press of HOLD_MS
  let holding = null;
  let holdTimer = 0;
  let lastPress = 0;
  let downOn = null;
  function startHold(button) {
    if (holding) return;
    holding = button;
    button.classList.add('is-holding');
    holdTimer = setTimeout(() => {
      stopHold();
      turnOver();
    }, HOLD_MS);
  }
  function stopHold() {
    clearTimeout(holdTimer);
    holding?.classList.remove('is-holding');
    holding = null;
  }
  const isPress = (event) => event.key === ' ' || event.key === 'Enter';
  deck.addEventListener('click', (event) => {
    const button = event.target.closest('button.back');
    if (!button) return;
    // A pointer click counts only on the card where the press began: holding the answer and letting go over the
    // next question that replaces it doesn't start that question
    if (event.detail > 0 && button !== downOn) return;
    if ('next' in button.dataset) return startNext();
    if (!('hold' in button.dataset)) return turnOver();
    // A click on the answer without a press before it comes from assistive technology, which can't hold
    if (Date.now() - lastPress > 1000) turnOver();
  });
  deck.addEventListener('pointerdown', (event) => {
    lastPress = Date.now();
    downOn = event.target.closest('button.back');
    if (downOn && 'hold' in downOn.dataset && event.isPrimary && event.button === 0) startHold(downOn);
  });
  deck.addEventListener('pointerup', stopHold);
  deck.addEventListener('pointercancel', stopHold);
  deck.addEventListener('pointerout', (event) => {
    if (holding && !holding.contains(event.relatedTarget)) stopHold();
  });
  deck.addEventListener('keydown', (event) => {
    if (!isPress(event)) return;
    // A key held down repeats; the repeats must not turn over the card that comes up next
    if (event.repeat) return event.preventDefault();
    const button = event.target.closest('button.back[data-hold]');
    if (!button) return;
    event.preventDefault();
    lastPress = Date.now();
    startHold(button);
  });
  deck.addEventListener('keyup', (event) => {
    if (!isPress(event)) return;
    lastPress = Date.now();
    stopHold();
  });
  deck.addEventListener('contextmenu', (event) => {
    if (event.target.closest('[data-hold]')) event.preventDefault();
  });

  // Phones: folded cards can be tapped to read them in full
  function markFolded() {
    const folded = folding.matches && pile.classList.contains('is-folded');
    for (const node of pile.children) {
      if (folded && node !== pile.lastElementChild) {
        node.tabIndex = 0;
        node.setAttribute('role', 'button');
        node.setAttribute('aria-label', `Show ${theCard(Number(node.dataset.card))} in full`);
      } else {
        node.removeAttribute('tabindex');
        node.removeAttribute('role');
        node.removeAttribute('aria-label');
      }
    }
  }
  let lift = null;
  function openLift(i) {
    closeLift(false);
    const shown = card(questions[state.q], i, 'div');
    shown.classList.add('pc--focus');
    shown.querySelector('.pc__next').replaceChildren(`${verb()} to put it back`);
    shown.tabIndex = -1;
    lift = el('div', 'lift', shown);
    lift.setAttribute('role', 'dialog');
    lift.setAttribute('aria-modal', 'true');
    lift.setAttribute('aria-label', CARDS[i].name);
    lift.dataset.card = i;
    lift.addEventListener('click', () => closeLift());
    document.body.append(lift);
    shown.focus({ preventScroll: true });
  }
  function closeLift(refocus = true) {
    if (!lift) return;
    const from = lift.dataset.card;
    lift.remove();
    lift = null;
    if (refocus) pile.querySelector(`[data-card="${from}"]`)?.focus({ preventScroll: true });
  }
  pile.addEventListener('click', (event) => {
    const node = event.target.closest('.pc[role="button"]');
    if (node) openLift(Number(node.dataset.card));
  });
  pile.addEventListener('keydown', (event) => {
    const node = event.target.closest('.pc[role="button"]');
    if (!node || !isPress(event)) return;
    event.preventDefault();
    openLift(Number(node.dataset.card));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLift();
  });

  prev.addEventListener('click', () => go(state.q - 1));
  next.addEventListener('click', () => go(state.q + 1));
  folding.addEventListener('change', () => {
    closeLift(false);
    markFolded();
  });
  mouse.addEventListener('change', () => render());

  render();
})();
