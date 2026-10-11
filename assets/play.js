// Play page: the question, hint and answer cards on screen, for tables without printed cards.
// Every question starts with its question card turned over; the hints and the answer wait face down in the deck,
// and turn over and fly onto the pile when tapped. On screens up to 1000px tall, from hint 2 on, earlier cards fold
// to one line (see play.css); tapping one opens it in its place and folds the others. Where you are is remembered
// on this device. The header has the rules, and a menu for skipping a question or going back to the last one.
(() => {
  const questions = window.FERMI_QUESTIONS || [];
  const pile = document.getElementById('pile');
  const deck = document.getElementById('deck');
  const live = document.getElementById('play-live');
  const moreButton = document.getElementById('more-open');
  const menu = document.getElementById('more');
  const skipItem = menu.querySelector('[data-skip]');
  const backItem = menu.querySelector('[data-back]');
  const rulesButton = document.getElementById('rules-open');
  const rules = document.getElementById('rules');
  const rome = document.querySelector('.rome');
  if (!pile || !deck || !questions.length) return;

  const CARDS = [
    { name: 'Question', then: 'put in the ante, write your guess, then betting round 1.' },
    { name: 'Hint 1', then: 'betting round 2.' },
    { name: 'Hint 2', then: 'betting round 3.' },
    { name: 'Answer', then: 'betting round 4, then the showdown.' },
  ];
  const STORE = 'fermi-play';
  const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
  // Screens up to 1000px tall fold earlier cards (the same media query as in play.css)
  const folding = matchMedia('(max-height: 1000px)');
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
  // In a folded pile: the earlier card opened (-1: the newest one is open)
  let open = -1;

  const el = (tag, className, ...children) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.append(...children);
    return node;
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

  // A card face down, on top of the deck: up next, which card it is, and the button. When to turn it over is on the
  // card above ("Now: betting round 2.").
  function back(side, name, action, label) {
    const node = el('button', 'back back--next',
      el('span', 'back__top', el('b', '', 'Up next'), el('span', '', side)),
      el('span', 'back__row', el('span', 'back__kind', name), el('span', 'back__tap', action)));
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
  // The deck's cards are thin paper: the etching of the table shows through them, lined up with it. It lies on the
  // table as .rome's background has it in play.css: 2560 × 1021 pixels, covering the table, placed at 33% 35%.
  const ETCHING = { width: 2560, height: 1021, x: 0.33, y: 0.35 };
  function lineUpEtching() {
    if (!rome) return;
    const table = rome.getBoundingClientRect();
    const scale = Math.max(table.width / ETCHING.width, table.height / ETCHING.height);
    const width = ETCHING.width * scale;
    const height = ETCHING.height * scale;
    const left = table.left + (table.width - width) * ETCHING.x;
    const top = table.top + (table.height - height) * ETCHING.y;
    // Each card where it lies in the deck, at rest (its slight turn left out)
    const at = deck.getBoundingClientRect();
    for (const node of deck.children) {
      const x = at.left + parseFloat(node.style.getPropertyValue('--dx'));
      const y = at.top + parseFloat(node.style.getPropertyValue('--dy'));
      node.style.setProperty('--etching-at', `${left - x}px ${top - y}px`);
      node.style.setProperty('--etching-size', `${width}px ${height}px`);
    }
  }
  function renderDeck(n, dealt) {
    const left = 4 - n;
    let button;
    if (left > 0) {
      button = back(`${n + 1} of 4`, CARDS[n].name, `${verb()} to turn over`, `Turn over ${theCard(n)}`);
    } else {
      // All four turned over: the next question's four cards wait on the deck
      const last = state.q === questions.length - 1;
      button = last
        ? back('1 of 4', 'Question 1', 'Start again', 'Start again from question 1')
        : back('1 of 4', `Question ${state.q + 2}`, `${verb()} to start`, `Start question ${state.q + 2}`);
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
    deck.replaceChildren(...pile);
    lineUpEtching();
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

  // from: where the card leaves the deck (its box), when a card was just dealt; was: the pile before that (snapshot)
  function render(from = null, was = null) {
    const q = questions[state.q];
    const n = shownOf(state.q);
    const hadFocus = deck.contains(document.activeElement);
    document.getElementById('skip-to').textContent = `Question ${state.q < questions.length - 1 ? state.q + 2 : 1} instead`;
    document.getElementById('back-to').textContent = `Back to question ${state.q}`;
    backItem.hidden = state.q === 0;
    pile.replaceChildren(...Array.from({ length: n }, (_, i) => card(q, i)));
    pile.classList.toggle('is-folded', n >= 3);
    applyOpen();
    renderDeck(n, !!from);
    if (hadFocus) deck.querySelector('button')?.focus({ preventScroll: true });
    morph(was);
    reveal();
    if (from) fly(pile.lastElementChild, from);
  }
  // The newest card in view, clear of the deck (also after a reload, on small screens). Only the pile scrolls; the
  // page itself, which that may have moved, stays where it is.
  function reveal() {
    pile.lastElementChild?.scrollIntoView({ block: 'nearest' });
    document.scrollingElement.scrollTop = 0;
  }

  // When cards change shape (the pile folding as a card is dealt, or a folded card opening), nothing jumps and nothing
  // blinks. Like an accordion, a card that changes shape shrinks or grows to its new size, and the cards below glide
  // along. What it shows on both sides of the change moves and grows or shrinks to its new place and size: the
  // question, for one, just gets smaller as the next card comes. What it shows only before fades out, and what it
  // shows only after fades in, at once, never leaving the card blank.
  // Two copies of the pile do this in front of it: the pile as it was, and the pile as it is now, on the same cards
  // (each card's two copies lie together, under the next card's). Both take the cards' new sizes and places together,
  // and at the end, when they match the pile exactly, they go. Meanwhile the pile's own cards stay transparent, so
  // each card shows once, its edges throughout. (A card being dealt flies in on the pile itself.)
  const MORPH_MS = 300;
  let morphing = null;
  let settleUntil = 0;
  function snapshot() {
    morphing?.();
    if (!moving()) return null;
    const cards = [...pile.children];
    return { copy: pile.cloneNode(true), heights: cards.map((node) => node.offsetHeight), margins: cards.map((node) => getComputedStyle(node).marginTop) };
  }
  // A copy of the pile to lie in front of it, out of everyone's way
  function overlay(copy, name) {
    copy.removeAttribute('id');
    copy.removeAttribute('aria-label');
    copy.classList.add(name);
    copy.inert = true;
    copy.setAttribute('aria-hidden', 'true');
    return copy;
  }
  // A card's shadow as it ends up, not as a transition still has it
  function settledShadow(node) {
    node.style.transition = 'none';
    const shadow = getComputedStyle(node).boxShadow;
    node.style.transition = '';
    return shadow;
  }
  // The parts of a card, and where each lies on it when it shows (as laid out, before the card's slight turn), with
  // its type size
  const PARTS = ['.pc__top', '.pc__peek', '.pc__text', '.pc__value', '.pc__note', '.pc__now'];
  function partsOf(card) {
    return PARTS.map((selector) => {
      const node = card.querySelector(selector);
      if (!node?.getClientRects().length) return null;
      const style = getComputedStyle(node);
      return { node, left: node.offsetLeft, top: node.offsetTop, width: node.offsetWidth, font: parseFloat(style.fontSize), pad: style.paddingBottom };
    });
  }
  const samePart = (a, b) => (!a && !b)
    || (!!a && !!b && a.left === b.left && a.top === b.top && a.width === b.width && a.font === b.font && a.pad === b.pad);
  // A text's words, each made a box of its own (so it can fade on its own), and where each lies in the text. Only for
  // plain text.
  const plain = (node) => [...node.childNodes].every((child) => child.nodeType === Node.TEXT_NODE);
  function wordsOf(node) {
    node.replaceChildren(...node.textContent.split(/(\s+)/).map((text) => {
      if (!text.trim()) return text;
      const word = el('span', '', text);
      word.style.display = 'inline-block';
      return word;
    }));
    return [...node.children].map((word) => ({ node: word, x: word.offsetLeft, y: word.offsetTop }));
  }
  function morph(was) {
    if (!was || !moving()) return;
    const cards = [...pile.children];
    const before = overlay(was.copy, 'pile--was');
    const olds = [...before.children].slice(0, cards.length);
    if (!olds.length) return;
    const after = overlay(pile.cloneNode(true), 'pile--now');
    const news = [...after.children];
    const animations = [];
    const run = (node, keyframes, timing) => {
      animations.push(node.animate(keyframes, { duration: MORPH_MS, easing: EASE, fill: 'both', ...timing }));
    };
    pile.after(before, after);
    // Measured first, all at once: each card's parts as they were, and as they are now
    const measured = olds.map((old, i) => [partsOf(old), partsOf(news[i])]);
    const hidden = cards.slice(0, olds.length);
    for (const node of hidden) node.style.opacity = '0';
    // Each card's two copies lie together, the card as it is now on the card as it was, both under the next card
    news.forEach((ghost, i) => {
      ghost.style.zIndex = String(2 * i + 2);
      // The cards dealt since fly in on the pile itself, above the copies
      if (i >= olds.length) {
        ghost.style.visibility = 'hidden';
        cards[i].style.zIndex = String(2 * cards.length + 1);
      }
    });
    olds.forEach((old, i) => {
      const ghost = news[i];
      old.style.zIndex = String(2 * i + 1);
      // In both copies, each card takes its new size and place
      const size = [{ height: `${was.heights[i]}px`, minHeight: '0px', marginTop: was.margins[i] },
        { height: `${cards[i].offsetHeight}px`, minHeight: '0px', marginTop: getComputedStyle(cards[i]).marginTop }];
      for (const copy of [old, ghost]) {
        copy.style.overflow = 'hidden';
        run(copy, size);
      }
      const [then, now] = measured[i];
      if (Math.abs(was.heights[i] - cards[i].offsetHeight) < 1 && then.every((part, k) => samePart(part, now[k]))) {
        ghost.style.visibility = 'hidden';
        return;
      }
      // A card changing shape: its shadow becomes the new one, and each part goes its own way, out of the flow
      run(old, [{ boxShadow: getComputedStyle(old).boxShadow }, { boxShadow: settledShadow(cards[i]) }]);
      for (const part of [...then, ...now]) {
        if (part) Object.assign(part.node.style, { position: 'absolute', left: `${part.left}px`, top: `${part.top}px`, width: `${part.width}px`, margin: '0', transformOrigin: '0 0' });
      }
      // A card folding to its one line, or opening from it: its name goes from one to the other, growing or
      // shrinking on the way, while the rest of each fades
      const [oldTop, oldLine, newTop, newLine] = [then[0], then[1], now[0], now[1]];
      const ends = oldTop && newLine && !oldLine && !newTop ? [oldTop, newLine] : oldLine && newTop && !oldTop && !newLine ? [oldLine, newTop] : null;
      if (ends) {
        const [start, end] = ends.map((part) => {
          const name = part.node.querySelector(':scope > b');
          name.style.visibility = 'hidden';
          return { left: part.left + name.offsetLeft, top: part.top + name.offsetTop, font: getComputedStyle(name).fontSize, text: name.textContent };
        });
        const name = el('b', 'pc__name', start.text);
        ghost.append(name);
        run(name, [{ left: `${start.left}px`, top: `${start.top}px`, fontSize: start.font }, { left: `${end.left}px`, top: `${end.top}px`, fontSize: end.font }]);
      }
      then.forEach((a, k) => {
        const b = now[k];
        if (a && b && PARTS[k] === '.pc__top') {
          // The card's name and number, on one line over a rule as wide as the card: their type grows or shrinks and
          // the rule widens or narrows, until they are as they are now
          b.node.style.visibility = 'hidden';
          run(a.node, [{ left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, fontSize: `${a.font}px`, paddingBottom: a.pad },
            { left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, fontSize: `${b.font}px`, paddingBottom: b.pad }]);
        } else if (a && b && plain(a.node) && plain(b.node) && a.node.textContent === b.node.textContent) {
          // The same text on both sides, which may break into lines differently. As it was and as it is now, it grows
          // or shrinks to its new size and place, the two together. Both are set in the larger of the two sizes and
          // scaled down, so they stay sharp and their letters fall in the same places (browsers that round letters
          // to whole pixels round them differently in each size), each in a width that breaks its lines as it does.
          // The words that keep their place in their line show once, as they were; the ones that move to another
          // line, or along theirs, fade from where they were to where they are now.
          const size = Math.max(a.font, b.font);
          const [oldWords, newWords] = [a, b].map((part) => {
            Object.assign(part.node.style, { fontSize: `${size}px`, width: `${(part.width * size) / part.font}px` });
            return wordsOf(part.node);
          });
          const dx = b.left - a.left;
          const dy = b.top - a.top;
          const startSize = `scale(${a.font / size})`;
          const endSize = `scale(${b.font / size})`;
          run(a.node, [{ transform: `translate(0px, 0px) ${startSize}` }, { transform: `translate(${dx}px, ${dy}px) ${endSize}` }]);
          run(b.node, [{ transform: `translate(${-dx}px, ${-dy}px) ${startSize}` }, { transform: `translate(0px, 0px) ${endSize}` }]);
          oldWords.forEach((word, w) => {
            const same = newWords[w];
            if (Math.abs(word.x - same.x) < 0.5 && Math.abs(word.y - same.y) < 0.5) {
              same.node.style.visibility = 'hidden';
            } else {
              run(word.node, [{ opacity: 1 }, { opacity: 0 }], { duration: MORPH_MS * 0.2, easing: 'ease-out' });
              run(same.node, [{ opacity: 0 }, { opacity: 1 }], { duration: MORPH_MS * 0.35, delay: MORPH_MS * 0.15, easing: 'ease-out' });
            }
          });
        } else {
          // Shown only before, or only now: one fades out quickly as the other fades in, so the card is never blank
          if (a) run(a.node, [{ opacity: 1 }, { opacity: 0 }], { duration: MORPH_MS * 0.25, easing: 'ease-out' });
          if (b) run(b.node, [{ opacity: 0 }, { opacity: 1 }], { duration: MORPH_MS * 0.4, delay: MORPH_MS * 0.1, easing: 'ease-out' });
        }
      });
    });
    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      if (morphing === finish) morphing = null;
      animations.forEach((animation) => animation.finish());
      before.remove();
      after.remove();
      for (const node of cards) {
        node.style.opacity = '';
        node.style.zIndex = '';
      }
    };
    morphing = finish;
    Promise.all(animations.map((animation) => animation.finished)).then(finish, () => {});
  }

  // Dealing a card: the deck's top card turns over where it lies. As it turns edge-on, the card it turns into takes
  // over and flies to its place on the pile, turning face up on the way. Returns the box the flight starts from.
  function liftTopCard() {
    const top = deck.querySelector('.back--next');
    if (!top) return null;
    const at = deck.getBoundingClientRect();
    const box = { left: at.left + top.offsetLeft, top: at.top + top.offsetTop, width: top.offsetWidth, height: top.offsetHeight };
    if (moving() && canFlip) {
      const layer = el('div', 'flip-layer', top.cloneNode(true));
      Object.assign(layer.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
      layer.inert = true;
      layer.setAttribute('aria-hidden', 'true');
      document.body.append(layer);
      layer.firstChild.animate([{ rotate: 'y 0deg', translate: '0 0' }, { rotate: 'y 90deg', translate: '0 -12px' }],
        { duration: 170, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {}).then(() => layer.remove());
    }
    return box;
  }
  function fly(node, from) {
    if (!moving()) return;
    settleUntil = Date.now() + 650;
    const to = node.getBoundingClientRect();
    const scale = Math.min(1, from.width / to.width);
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const timing = { duration: 440, delay: canFlip ? 150 : 0, easing: EASE, fill: 'backwards' };
    node.animate([{ translate: `${dx}px ${dy}px`, scale: String(scale) }, { translate: '0 0', scale: '1' }], timing);
    node.animate([{ opacity: 0 }, { opacity: 1 }], { ...timing, duration: canFlip ? 60 : 200, easing: 'linear' });
    if (canFlip) node.animate([{ rotate: 'y -90deg' }, { rotate: 'y 0deg' }], { ...timing, easing: 'cubic-bezier(0.3, 0.6, 0.3, 1)' });
  }

  // Taps on the deck that come too quickly after a card was turned over are ignored, so a double tap can't turn over
  // two cards
  let quietUntil = 0;
  let busy = false;
  function turnOver() {
    const n = shownOf(state.q);
    if (busy || n >= 4) return;
    quietUntil = Date.now() + 400;
    const was = snapshot();
    state.shown[state.q] = n + 1;
    open = -1;
    save();
    render(liftTopCard(), was);
    const q = questions[state.q];
    live.textContent = n === 3 ? `Answer: ${q.answer}. ${q.note || ''}` : `${CARDS[n].name}: ${textOf(q, n)}`;
  }
  // The next question (from the deck, or skipped from the menu): the cards on the table are collected, then its
  // question card flies in
  async function startNext() {
    if (busy) return;
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

  // The deck: a tap or a click turns over the card on top, or, after the answer, starts the next question
  const isPress = (event) => event.key === ' ' || event.key === 'Enter';
  deck.addEventListener('click', (event) => {
    const button = event.target.closest('button.back');
    if (!button || Date.now() < quietUntil) return;
    if ('next' in button.dataset) startNext();
    else turnOver();
  });
  deck.addEventListener('keydown', (event) => {
    // A key held down repeats; the repeats must not turn over the cards that come up next
    if (isPress(event) && event.repeat) event.preventDefault();
  });

  // One card in a folded pile is open, the newest unless you tap another. Tapping a folded card opens it in
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
    const was = snapshot();
    open = i;
    applyOpen();
    morph(was);
  }
  // Not while a card is still flying in
  function toggle(node) {
    if (busy || Date.now() < settleUntil) return;
    setOpen(node.classList.contains('pc--focus') ? -1 : Number(node.dataset.card));
  }
  pile.addEventListener('click', (event) => {
    const node = event.target.closest('.pc[role="button"]');
    if (node) toggle(node);
  });
  pile.addEventListener('keydown', (event) => {
    const node = event.target.closest('.pc[role="button"]');
    if (!node || !isPress(event)) return;
    event.preventDefault();
    toggle(node);
  });

  folding.addEventListener('change', () => {
    open = -1;
    applyOpen();
  });
  mouse.addEventListener('change', () => render());

  // The menu: skipping this question (the cards are collected, as after the showdown) or going back to the last one.
  // It closes when you choose, tap elsewhere, press Escape or tab away.
  function showMenu(show) {
    menu.hidden = !show;
    moreButton.setAttribute('aria-expanded', String(show));
  }
  moreButton.addEventListener('click', (event) => {
    showMenu(menu.hidden);
    // From the keyboard, straight to the first choice
    if (!menu.hidden && event.detail === 0) skipItem.focus();
  });
  skipItem.addEventListener('click', () => {
    showMenu(false);
    moreButton.focus({ preventScroll: true });
    startNext();
  });
  backItem.addEventListener('click', () => {
    showMenu(false);
    moreButton.focus({ preventScroll: true });
    go(state.q - 1);
  });
  // A tap elsewhere only closes the menu: it doesn't also turn over the card it lands on
  let swallow = false;
  document.addEventListener('pointerdown', (event) => {
    swallow = !menu.hidden && !event.target.closest('.ph-more');
    if (swallow) showMenu(false);
  });
  document.addEventListener('click', (event) => {
    if (!swallow || event.detail === 0) return;
    swallow = false;
    event.stopPropagation();
    event.preventDefault();
  }, true);
  menu.addEventListener('keydown', (event) => {
    const items = [...menu.querySelectorAll('button:not([hidden])')];
    const at = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      items[(at + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || menu.hidden) return;
    showMenu(false);
    moreButton.focus();
  });
  menu.addEventListener('focusout', (event) => {
    // Only when focus moves on to something else: a tap that takes focus nowhere is handled on pointerdown
    if (event.relatedTarget && !event.relatedTarget.closest('.ph-more')) showMenu(false);
  });

  // The rule sheet opens at the top, ready to scroll. Close, Escape or a tap beside it closes it, sliding away again.
  const rulesBody = rules.querySelector('.rules__body');
  let closing = 0;
  function closeRules() {
    if (!rules.open || closing) return;
    if (!moving()) return rules.close();
    rules.classList.add('is-closing');
    // In case the animation never ends (a hidden tab, say)
    closing = setTimeout(() => rules.close(), 400);
  }
  rules.addEventListener('animationend', (event) => {
    if (closing && /^rules-(down|out)$/.test(event.animationName)) rules.close();
  });
  rules.addEventListener('close', () => {
    clearTimeout(closing);
    closing = 0;
    rules.classList.remove('is-closing');
    rulesButton.focus({ preventScroll: true });
  });
  rulesButton.addEventListener('click', () => {
    showMenu(false);
    rules.showModal();
    rulesBody.scrollTop = 0;
    rulesBody.focus({ preventScroll: true });
  });
  rules.querySelector('[data-close]').addEventListener('click', closeRules);
  // A click on the dialog itself, not its contents, is a click on the dimmed page around it
  rules.addEventListener('click', (event) => {
    if (event.target === rules) closeRules();
  });
  rules.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeRules();
  });

  // Phones dim and lock after a minute or so, often in the middle of a betting round: while the page is on screen,
  // it keeps the screen on. The browser lets go when you switch away, so it asks again when you come back.
  let awake = null;
  let asking = false;
  async function stayAwake() {
    if (awake || asking || document.visibilityState !== 'visible' || !navigator.wakeLock) return;
    asking = true;
    try {
      awake = await navigator.wakeLock.request('screen');
      awake.addEventListener('release', () => { awake = null; });
    } catch {}
    asking = false;
  }
  document.addEventListener('visibilitychange', stayAwake);
  // Some browsers only allow it after a tap
  document.addEventListener('click', stayAwake);
  stayAwake();

  // Where the screen ends for pinned things: on iPhones, the top of Safari's bottom bar. The deck's top 132px stand
  // above it, and the deck and the page run on below it, behind the bar (see play.css).
  const probe = el('div', 'edge-probe');
  document.body.append(probe);
  // The deck moves with it, and the table may have changed size: the etching is lined up again
  const measureEdge = () => {
    document.body.style.setProperty('--edge', `${probe.getBoundingClientRect().top}px`);
    lineUpEtching();
  };
  measureEdge();
  addEventListener('resize', measureEdge);
  window.visualViewport?.addEventListener('resize', measureEdge);

  render();
  // The cards are set in web fonts: once they're in, the cards may be a little taller
  document.fonts?.ready.then(reveal);
})();
