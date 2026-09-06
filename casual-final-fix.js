(() => {
'use strict';

const $ = id => document.getElementById(id);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const A = {
  SOCCER: 'images/soccer-card.webp?v=20260904fix1',
  YELLOW: 'images/yellow-card.webp',
  SHOOT: 'images/shoot-card.webp',
  DRIBBLE: 'images/dribble%20past-card.webp',
  TACKLE: 'images/tackle.webp?v=20260904tackle2'
};
const state = { active:false, phase:'idle', locked:false, booted:false };

function inFinal() {
  return document.body.classList.contains('finalMode') &&
    (($('lessonName')?.textContent || '').includes('FINAL CHALLENGE'));
}

function playerLabel(i) {
  return i === 0 ? 'YOU' : `PLAYER ${i + 1}`;
}

function setCoach(text) {
  const el = $('coachText');
  if (el) el.textContent = text;
  const c = $('coachContinue');
  if (c) c.hidden = true;
}

function fx(text, kind='neutral', ms=1100) {
  const el = $('fx');
  if (!el) return;
  el.textContent = text;
  el.className = `fx show ${kind}`;
  clearTimeout(fx.t);
  fx.t = setTimeout(() => { el.className = 'fx'; }, ms);
}

function clearFlow() {
  if ($('flow')) $('flow').innerHTML = '<div class="flowEmpty">Actions will appear here.</div>';
}

function arrow() {
  const flow = $('flow');
  if (!flow || !flow.children.length || flow.querySelector('.flowEmpty')) return;
  const a = document.createElement('div');
  a.className = 'arrow';
  a.textContent = '→';
  flow.appendChild(a);
}

function flowCard(name, text) {
  const flow = $('flow');
  if (!flow) return;
  flow.querySelector('.flowEmpty')?.remove();
  arrow();
  const n = document.createElement('div');
  n.className = 'flowCard';
  n.innerHTML = `<img src="${A[name]}" alt="${name}"><b>${text}</b>`;
  flow.appendChild(n);
  flow.scrollLeft = flow.scrollWidth;
}

function chip(text, kind='') {
  const flow = $('flow');
  if (!flow) return;
  flow.querySelector('.flowEmpty')?.remove();
  arrow();
  const c = document.createElement('div');
  c.className = `chip ${kind}`;
  c.textContent = text;
  flow.appendChild(c);
  flow.scrollLeft = flow.scrollWidth;
}

function setStrikes(i, count, out=false) {
  const p = $('P' + i);
  if (!p) return;
  p.classList.toggle('out', out);
  const stats = p.querySelector('.pStats');
  if (stats) stats.textContent = `SOCCER STRIKES ${count}/2`;
  const tag = p.querySelector('.pTag');
  if (tag) tag.textContent = out ? 'OUT' : 'IN GAME';
  const strikes = p.querySelectorAll('.strike');
  strikes.forEach((s, idx) => {
    s.classList.toggle('on', idx < count);
    s.classList.toggle('danger', idx === 1 && count > 1);
  });
}

function focus(ids=[]) {
  document.querySelectorAll('.player').forEach((p,i) => {
    p.classList.toggle('focus', ids.includes(i));
    p.classList.remove('target','dim');
  });
}

async function fly(from, to, src) {
  if (!from || !to) return;
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const im = document.createElement('img');
  im.className = 'flying';
  im.src = src;
  im.style.left = a.left + 'px';
  im.style.top = a.top + 'px';
  im.style.width = Math.max(42, a.width) + 'px';
  im.style.height = Math.max(58, a.height) + 'px';
  document.body.appendChild(im);
  await wait(30);
  im.style.transform = `translate(${b.left+b.width/2-a.left-a.width/2}px,${b.top+b.height/2-a.top-a.height/2}px) scale(.8)`;
  im.style.opacity = '.35';
  await wait(520);
  im.remove();
}

async function playFromHand(name) {
  const b = document.querySelector(`.cardBtn[data-card="${name}"]`);
  if (b) await fly(b, $('discardPile'), A[name]);
}

function renderDrawButton(label='DRAW TO END TURN') {
  const actions = $('actions');
  if (!actions) return;
  actions.innerHTML = '';
  const b = document.createElement('button');
  b.className = 'actionBtn blue';
  b.id = 'finalRoundDraw';
  b.textContent = label;
  actions.appendChild(b);
  $('drawPile')?.classList.add('active');
}

function showFinalTop3() {
  const top3 = $('top3');
  if (!top3) return;
  const cards = [['SOCCER',1],['TACKLE',2],['YELLOW',3]];
  top3.innerHTML = cards.map(([n,i]) =>
    `<div class="preview"><span class="num">${i}</span><img src="${A[n]}" alt="${n}"></div>`
  ).join('');
  const modal = $('top3Modal');
  if (modal) modal.classList.add('show');
  fx('TOP CARD = SOCCER','bad',1400);
}

function resetTargetModal() {
  const m = $('targetModal');
  if (m) m.classList.remove('show');
  document.querySelectorAll('#targetModal .targetBtn').forEach(b => b.hidden = false);
  document.querySelectorAll('.player').forEach(p => p.classList.remove('target','dim'));
}

function openShootTarget() {
  const title = $('targetTitle');
  const help = $('targetHelp');
  if (title) title.textContent = 'CHOOSE A SHOOT TARGET';
  if (help) help.textContent = 'Pick who draws the top card. Choosing yourself is risky.';
  document.querySelectorAll('#targetModal .targetBtn').forEach(b => b.hidden = false);
  document.querySelectorAll('.player').forEach(p => {
    p.classList.toggle('target', true);
    p.classList.remove('dim');
  });
  $('targetModal')?.classList.add('show');
}

function startRound(message='You already have 1 Soccer. Check what’s coming before you end your turn.') {
  if (!inFinal()) return;
  state.active = true;
  state.phase = 'peek';
  state.locked = false;
  resetTargetModal();
  $('top3Modal')?.classList.remove('show');
  clearFlow();
  setStrikes(0,1,false);
  setStrikes(1,0,false);
  setStrikes(2,0,false);
  setStrikes(3,0,false);
  focus([0]);
  renderDrawButton();
  setCoach(message);
  const status = $('lessonStatus');
  if (status) status.textContent = 'Goal: dodge the Soccer, then draw to end your turn.';
}

async function reinsertSoccer(fromEl) {
  await fly(fromEl || $('discardPile'), $('drawPile'), A.SOCCER);
  chip('SOCCER → BACK INTO DECK • NOT ON TOP','good');
  fx('SOCCER REINSERTED','neutral',900);
}

async function failByDrawing(reason='You drew the second Soccer.') {
  if (state.locked) return;
  state.locked = true;
  state.phase = 'failed';
  $('drawPile')?.classList.remove('active');
  const actions = $('actions');
  if (actions) actions.innerHTML = '';
  await fly($('drawPile'), $('P0'), A.SOCCER);
  flowCard('SOCCER','YOU DRAW');
  chip('SOCCER 2 / 2','bad');
  setStrikes(0,2,true);
  focus([0]);
  fx('CHALLENGE FAILED • OUT','bad',1600);
  setCoach(`${reason} The Soccer card goes back into the deck, then you retry.`);
  await wait(900);
  await reinsertSoccer($('P0'));
  await wait(850);
  fx('RESTARTING FINAL CHALLENGE','warn',1100);
  startRound('Try again. First find out what’s on top before you end your turn.');
}

async function useDribble() {
  if (state.locked || state.phase !== 'peek') return;
  state.locked = true;
  await playFromHand('DRIBBLE');
  flowCard('DRIBBLE','YOU PLAY DRIBBLE PAST');
  chip('LOOK AT NEXT 3','good');
  state.phase = 'decide';
  showFinalTop3();
  setCoach('Top card is Soccer. If that becomes your end-of-turn draw, you are out.');
  state.locked = false;
}

async function useShoot() {
  if (state.locked || state.phase !== 'decide') return;
  state.locked = true;
  await playFromHand('SHOOT');
  flowCard('SHOOT','YOU PLAY SHOOT');
  state.phase = 'target';
  openShootTarget();
  setCoach('Decide who should draw that Soccer card.');
  state.locked = false;
}

async function chooseShootTarget(i) {
  if (!state.active || state.phase !== 'target' || state.locked) return;
  state.locked = true;
  resetTargetModal();
  focus([i]);
  chip(`SHOOT TARGET → ${playerLabel(i)}`,'warn');
  if (i === 0) {
    fx('YOU TARGETED YOURSELF','bad',1000);
    state.locked = false;
    await failByDrawing('You used SHOOT on yourself and drew the Soccer.');
    return;
  }
  await fly($('drawPile'), $('P'+i), A.SOCCER);
  flowCard('SOCCER',`${playerLabel(i)} DRAWS`);
  chip(`${playerLabel(i)} TAKES SOCCER 1 / 2`,'warn');
  setStrikes(i,1,false);
  fx(`${playerLabel(i)} TOOK THE SOCCER`,'good',1300);
  await wait(350);
  await reinsertSoccer($('P'+i));
  state.phase = 'finish';
  state.locked = false;
  focus([0]);
  renderDrawButton('DRAW 1 TO END TURN');
  setCoach('Good. You dodged the Soccer. Your turn still ends only when YOU draw 1 card.');
}

async function safeEndDraw() {
  if (state.locked || state.phase !== 'finish') return;
  state.locked = true;
  $('drawPile')?.classList.remove('active');
  const actions = $('actions');
  if (actions) actions.innerHTML = '';
  await fly($('drawPile'), $('P0'), A.TACKLE);
  flowCard('TACKLE','YOU DRAW');
  chip('SAFE DRAW','good');
  chip('YOUR TURN ENDS','good');
  fx('TURN COMPLETE','good',1500);
  setCoach('Perfect. You avoided the Soccer, then your own draw ended the turn.');
  state.phase = 'done';
  await wait(900);
  fx('CHALLENGE COMPLETE','good',1800);
  chip('YOU SURVIVED THE TURN','good');
  if (actions) {
    const b = document.createElement('button');
    b.className = 'actionBtn green';
    b.textContent = 'BACK TO MODES';
    b.onclick = () => { location.href = 'index.html'; };
    actions.appendChild(b);
  }
  state.locked = false;
}

function nudge(text, label='SOCCER STILL ON TOP') {
  fx(label,'bad',1100);
  setCoach(text);
}

function intercept(e) {
  if (!state.active || !inFinal()) return;

  const card = e.target.closest?.('.cardBtn[data-card]');
  const draw = e.target.closest?.('#finalRoundDraw, #drawPile');
  const target = e.target.closest?.('#targetModal .targetBtn');
  const closeTop = e.target.closest?.('#closeTop3');
  const coachBubble = e.target.closest?.('#coachBubble');

  if (target && state.phase === 'target') {
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    chooseShootTarget(Number(target.dataset.player));
    return;
  }

  if (closeTop && state.phase === 'decide') {
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    $('top3Modal')?.classList.remove('show');
    setCoach('Now decide how to get that Soccer off the top before your final draw.');
    return;
  }

  if (draw && (state.phase === 'peek' || state.phase === 'decide')) {
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    failByDrawing(state.phase === 'peek'
      ? 'You ended your turn without checking the top card.'
      : 'You saw the Soccer but still ended your turn with DRAW.');
    return;
  }

  if (draw && state.phase === 'finish') {
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    safeEndDraw();
    return;
  }

  if (card) {
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    const name = card.dataset.card;
    if (state.phase === 'peek') {
      if (name === 'DRIBBLE') useDribble();
      else nudge('Check the deck first. Use DRIBBLE PAST before you decide what to do.','CHECK THE DECK FIRST');
      return;
    }
    if (state.phase === 'decide') {
      if (name === 'SHOOT') useShoot();
      else if (name === 'DRIBBLE') nudge('You already know the top card is Soccer. Now make a move before you draw.','SOCCER IS STILL ON TOP');
      else nudge('That does not remove the Soccer from the top. Find a way to make someone draw it first.');
      return;
    }
    if (state.phase === 'finish') {
      nudge('You may play more actions, but the challenge is not complete until your own DRAW ends the turn.','YOUR TURN IS NOT OVER');
      return;
    }
  }

  if (coachBubble && state.phase !== 'done') {
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
  }
}

document.addEventListener('click', intercept, true);

const observer = new MutationObserver(() => {
  if (!inFinal()) {
    state.active = false;
    state.phase = 'idle';
    return;
  }
  if (state.active) return;
  const drawButton = [...document.querySelectorAll('#actions .actionBtn')].find(b => /DRAW/i.test(b.textContent || ''));
  if (drawButton) startRound();
});
observer.observe(document.documentElement, {subtree:true, childList:true, attributes:true, attributeFilter:['class']});

setInterval(() => {
  if (inFinal() && !state.active) {
    const drawButton = [...document.querySelectorAll('#actions .actionBtn')].find(b => /DRAW/i.test(b.textContent || ''));
    if (drawButton) startRound();
  }
}, 400);

})();
