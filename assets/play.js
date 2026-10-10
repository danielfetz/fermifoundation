// Play page: the question, hint and answer cards on screen, for tables without printed cards.
// Every question starts with its question card turned over; the hints and the answer wait face down in the deck,
// and turn over and fly onto the pile when dealt. The answer turns over only when held, so nobody reveals it by accident.
// On phones, from hint 2 on, earlier cards fold to one line (see play.css); tapping one opens it in its place and
// folds the others. Where you are is remembered on this device.
(() => {
  const questions = window.FERMI_QUESTIONS || [];
  const pile = document.getElementById('pile');
  const deck = document.getElementById('deck');
  const count = document.getElementById('play-count');
  const live = document.getElementById('play-live');
  const prev = document.querySelector('[data-go="-1"]');
  const next = document.querySelector('[data-go="1"]');
  if (!pile || !deck || !questions.length) return;

  const CARDS = [
    { name: 'Question', then: 'put in the ante, write your guess, then betting round 1.' },
    { name: 'Hint 1', then: 'betting round 2.' },
    { name: 'Hint 2', then: 'betting round 3.' },
    { name: 'Answer', then: 'betting round 4, then the showdown.' },
  ];
  const HOLD_MS = 600;
  const STORE = 'fermi-play';
  const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
  // Phones fold earlier cards (the same media query as in play.css)
  const folding = matchMedia('(max-width: 899px) and (max-height: 1000px)');
  const mouse = matchMedia('(pointer: fine)');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  // Cards flip with the CSS rotate property; browsers without it get the same flight, just without the flip
  const canFlip = window.CSS?.supports?.('rotate', 'y 180deg');
  const moving = () => !calm.matches && typeof pile.animate === 'function';

  // Which question you're on, and how many of each question's cards are turned over (always at least the question)
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
  const shownOf = (q) => Math.min(4, Math.max(1, state.shown[q] | 0));
  // On phones: the earlier card opened in the pile (-1: the newest one is open)
  let open = -1;

  const el = (tag, className, ...children) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.append(...children);
    return node;
  };
  const portrait = () => {
    const img = el('img');
    img.src = '/assets/img/fermi-logo.webp';
    img.alt = '';
    return img;
  };
  const textOf = (q, i) => (i === 0 ? q.question : i === 3 ? q.answer : q.hints[i - 1]);
  const theCard = (i) => (i === 0 ? 'the question' : i === 3 ? 'the answer' : CARDS[i].name.toLowerCase());
  const verb = () => (mouse.matches ? 'Click' : 'Tap');

  // A card face up: which card it is, its text, and what the table does now. The one-line version shows when it's
  // folded.
  function card(q, i) {
    const body = i === 3
      ? el('div', 'pc__body', el('p', 'pc__value', q.answer), ...(q.note ? [el('p', 'pc__note', q.note)] : []))
      : el('div', 'pc__body', el('p', 'pc__text', textOf(q, i)));
    const node = el('li', 'pc',
      el('p', 'pc__peek', el('b', '', CARDS[i].name), ' ' + textOf(q, i)),
      el('div', 'pc__top', el('b', '', CARDS[i].name), el('span', '', `${i + 1} of 4`)),
      body,
      el('p', 'pc__now', el('b', '', 'Now:'), ' ' + CARDS[i].then));
    node.dataset.card = i;
    return node;
  }

  // A card face down, on top of the deck: when to turn it over, which card it is, and the button
  function back(top, side, name, action, label) {
    const node = el('button', 'back back--next',
      el('span', 'back__top', el('b', '', top), el('span', '', side)),
      el('span', 'back__row', el('span', 'back__kind', name), el('span', 'back__tap', action)),
      el('span', 'back__mark', portrait(), 'Fermi Poker'));
    node.type = 'button';
    node.setAttribute('aria-label', label);
    return node;
  }

  // The deck, piled as it is: each card a little offset from the one above, so you can see how many are left
  const STACK = [
    { x: 0, y: 0, r: -0.8 },
    { x: 6, y: -8, r: 1.6 },
    { x: -5, y: -15, r: -2.2 },
    { x: 8, y: -21, r: 2.6 },
  ];
  function place(node, depth) {
    const { x, y, r } = STACK[depth];
    node.style.setProperty('--dx', `${x}px`);
    node.style.setProperty('--dy', `${y}px`);
    node.style.setProperty('--dr', `${r}deg`);
  }
  function renderDeck(n, dealt) {
    const left = 4 - n;
    let button;
    if (left > 0) {
      button = n === 3
        ? back('After betting round 3', '4 of 4', 'Answer', 'Hold to turn over', 'Hold to turn over the answer')
        : back(`After betting round ${n}`, `${n + 1} of 4`, CARDS[n].name, `${verb()} to turn over`, `Turn over ${theCard(n)}`);
      if (n === 3) button.dataset.hold = '';
    } else {
      // All four turned over: the next question's four cards wait on the deck
      const last = state.q === questions.length - 1;
      button = last
        ? back('After the showdown', '1 of 4', 'Question 1', 'Start again', 'Start again from question 1')
        : back('After the showdown', '1 of 4', `Question ${state.q + 2}`, `${verb()} to start`, `Start question ${state.q + 2}`);
      button.dataset.next = '';
    }
    const cards = left || 4;
    // Deepest first, so each lies under the next; the top card, with its button, last
    const pile = Array.from({ length: cards - 1 }, (_, k) => {
      const node = el('div', 'back back--under');
      node.setAttribute('aria-hidden', 'true');
      place(node, cards - 1 - k);
      return node;
    });
    place(button, 0);
    pile.push(button);
    deck.replaceChildren(...pile, ...(left > 0 ? [el('p', 'deck__left', `${left} card${left > 1 ? 's' : ''} left`)] : []));
    if (!dealt || !moving()) return;
    pile.forEach((node, k) => {
      const depth = cards - 1 - k;
      if (left > 0) {
        // A card was dealt: the ones below each move up a place
        const from = STACK[depth + 1];
        const to = STACK[depth];
        node.animate([{ translate: `${from.x - to.x}px ${from.y - to.y}px`, rotate: `${from.r - to.r}deg` }, { translate: '0 0', rotate: '0deg' }],
          { duration: 320, delay: 120, easing: EASE, fill: 'backwards' });
      } else {
        // The answer was dealt: the next question's cards arrive, one after another
        node.animate([{ opacity: 0, translate: '0 70px' }, { opacity: 1, translate: '0 0' }],
          { duration: 380, delay: 320 + k * 70, easing: EASE, fill: 'backwards' });
      }
    });
  }

  // from: where the card leaves the deck (its box), when a card was just dealt
  function render(from = null) {
    const q = questions[state.q];
    const n = shownOf(state.q);
    const hadFocus = deck.contains(document.activeElement);
    count.textContent = `Question ${state.q + 1}`;
    prev.disabled = state.q === 0;
    next.disabled = state.q === questions.length - 1;
    pile.replaceChildren(...Array.from({ length: n }, (_, i) => card(q, i)));
    pile.classList.toggle('is-folded', n >= 3);
    applyOpen();
    renderDeck(n, !!from);
    if (hadFocus) deck.querySelector('button')?.focus({ preventScroll: true });
    if (from) {
      const top = pile.lastElementChild;
      top.scrollIntoView({ block: 'nearest' });
      fly(top, from);
    }
  }

  // Dealing a card: the deck's top card turns over where it lies. As it turns edge-on, the card it turns into takes
  // over and flies to its place on the pile, turning face up on the way. Returns the box the flight starts from.
  function liftTopCard() {
    const top = deck.querySelector('.back--next');
    if (!top) return null;
    const at = deck.getBoundingClientRect();
    const box = { left: at.left, top: at.top, width: top.offsetWidth, height: top.offsetHeight };
    if (moving() && canFlip) {
      const layer = el('div', 'flip-layer', top.cloneNode(true));
      Object.assign(layer.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
      layer.inert = true;
      layer.setAttribute('aria-hidden', 'true');
      document.body.append(layer);
      layer.firstChild.classList.remove('is-holding');
      layer.firstChild.animate([{ rotate: 'y 0deg', translate: '0 0' }, { rotate: 'y 90deg', translate: '0 -12px' }],
        { duration: 170, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {}).then(() => layer.remove());
    }
    return box;
  }
  function fly(node, from) {
    if (!moving()) return;
    const to = node.getBoundingClientRect();
    const scale = Math.min(1, from.width / to.width);
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const timing = { duration: 440, delay: canFlip ? 150 : 0, easing: EASE, fill: 'backwards' };
    node.animate([{ translate: `${dx}px ${dy}px`, scale: String(scale) }, { translate: '0 0', scale: '1' }], timing);
    node.animate([{ opacity: 0 }, { opacity: 1 }], { ...timing, duration: canFlip ? 60 : 200, easing: 'linear' });
    if (canFlip) node.animate([{ rotate: 'y -90deg' }, { rotate: 'y 0deg' }], { ...timing, easing: 'cubic-bezier(0.3, 0.6, 0.3, 1)' });
  }

  // Taps that come too quickly after a card was turned over are ignored, so a double tap can't turn over two cards
  let quietUntil = 0;
  let busy = false;
  function turnOver() {
    const n = shownOf(state.q);
    if (busy || n >= 4 || Date.now() < quietUntil) return;
    quietUntil = Date.now() + 400;
    state.shown[state.q] = n + 1;
    open = -1;
    save();
    render(liftTopCard());
    const q = questions[state.q];
    live.textContent = n === 3 ? `Answer: ${q.answer}. ${q.note || ''}` : `${CARDS[n].name}: ${textOf(q, n)}`;
  }
  // The next question: the cards on the table are collected, then its question card flies in
  async function startNext() {
    if (busy || Date.now() < quietUntil) return;
    quietUntil = Date.now() + 400;
    busy = true;
    if (moving()) {
      const cards = [...pile.children];
      await Promise.all(cards.map((node, i) => node.animate(
        [{ opacity: 1 }, { opacity: 0, translate: '-48px 6px', scale: '0.96' }],
        { duration: 240, delay: (cards.length - 1 - i) * 45, easing: 'ease-in', fill: 'forwards' },
      ).finished.catch(() => {})));
    }
    if (state.q < questions.length - 1) state.q += 1;
    else state = { q: 0, shown: {} };
    open = -1;
    save();
    busy = false;
    render(liftTopCard());
    live.textContent = `Question ${state.q + 1}: ${questions[state.q].question}`;
  }
  function go(q) {
    if (busy || q < 0 || q >= questions.length) return;
    state.q = q;
    open = -1;
    save();
    render();
    live.textContent = `Question ${q + 1}: ${questions[q].question}`;
  }

  // The deck: a click turns over a hint, the answer needs a press of HOLD_MS
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

  // Phones: one card in a folded pile is open, the newest unless you tap another. Tapping a folded card opens it in
  // its place and folds the open one; tapping an earlier open card goes back to the newest.
  function applyOpen() {
    const cards = [...pile.children];
    const newest = cards.length - 1;
    const folded = folding.matches && pile.classList.contains('is-folded');
    if (!folded) open = -1;
    const focus = open >= 0 && open < newest ? open : newest;
    cards.forEach((node, i) => {
      node.classList.toggle('pc--focus', i === focus);
      if (folded && !(i === focus && i === newest)) {
        node.tabIndex = 0;
        node.setAttribute('role', 'button');
        node.setAttribute('aria-expanded', String(i === focus));
        node.setAttribute('aria-label', i === focus ? `Back to ${theCard(newest)}` : `Show ${theCard(i)}`);
      } else {
        for (const name of ['tabindex', 'role', 'aria-expanded', 'aria-label']) node.removeAttribute(name);
      }
    });
  }
  function setOpen(i) {
    const cards = [...pile.children];
    const before = cards.map((node) => node.getBoundingClientRect().top);
    open = i;
    applyOpen();
    if (!moving()) return;
    // The cards slide to their new places, and the opened one's text fades in
    cards.forEach((node, k) => {
      const dy = before[k] - node.getBoundingClientRect().top;
      if (Math.abs(dy) > 0.5) node.animate([{ translate: `0 ${dy}px` }, { translate: '0 0' }], { duration: 300, easing: EASE });
    });
    pile.querySelector('.pc--focus .pc__body')?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
  }
  function toggle(node) {
    setOpen(node.classList.contains('pc--focus') ? -1 : Number(node.dataset.card));
  }
  pile.addEventListener('click', (event) => {
    const node = event.target.closest('.pc[role="button"]');
    if (node && !busy) toggle(node);
  });
  pile.addEventListener('keydown', (event) => {
    const node = event.target.closest('.pc[role="button"]');
    if (!node || !isPress(event)) return;
    event.preventDefault();
    if (!busy) toggle(node);
  });

  prev.addEventListener('click', () => go(state.q - 1));
  next.addEventListener('click', () => go(state.q + 1));
  folding.addEventListener('change', () => {
    open = -1;
    applyOpen();
  });
  mouse.addEventListener('change', () => render());

  render();
})();
