/* Keep the visible hand synchronized with the real handCards array.
   Core lesson handlers consume cards in state, but some lesson completions did not repaint the hand. */
(() => {
  'use strict';
  if (window.__gsmStrategy13CardConsumeFixInstalled) return;
  window.__gsmStrategy13CardConsumeFixInstalled = true;

  if (typeof handleCard === 'function') {
    const previousHandleCard = handleCard;
    handleCard = function(name, index) {
      const beforeLength = Array.isArray(handCards) ? handCards.length : 0;
      const result = previousHandleCard(name, index);

      // Valid plays remove/discard a card synchronously from handCards.
      // Repaint only when state actually consumed a card, so wrong-choice demos stay untouched.
      if (Array.isArray(handCards) && handCards.length < beforeLength && typeof renderHand === 'function') {
        renderHand();
      }
      return result;
    };
  }
})();

/* Lessons 1–3 physical-card onboarding.
   After the coach welcomes the player, pause once and ask them to put four real cards on the table so the digital tutorial feels like guided tabletop play. */
(() => {
  'use strict';
  if (window.__gsmStrategyPhysicalPrepInstalled) return;
  window.__gsmStrategyPhysicalPrepInstalled = true;

  const PREP_TEXT = 'Before we start, take out four real cards: 1 GOALKEEPER, 1 PLAYER, the SOCCER card, and any 1 ACTION card. Put them in front of you and follow along with me — move the real cards as we learn.';
  let prepShown = false;

  function ensureStyle() {
    if (document.getElementById('gsm-physical-prep-style')) return;
    const style = document.createElement('style');
    style.id = 'gsm-physical-prep-style';
    style.textContent = `
      .physicalPrepTray{margin:10px 0 2px;padding:10px;border:2px solid #d7b33a;border-radius:14px;background:linear-gradient(180deg,#fff8d8,#f4f8fc);box-shadow:0 7px 18px #17324f24;animation:physicalPrepIn .28s ease-out}
      .physicalPrepTitle{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:8px;color:#6d5100;font-size:9px;font-weight:950;letter-spacing:.08em;text-align:center}
      .physicalPrepCards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}
      .physicalPrepCard{min-width:0;padding:6px 4px 5px;border:1px solid #bfd0df;border-radius:10px;background:#fff;text-align:center;box-shadow:0 3px 8px #17324f1f}
      .physicalPrepCard img{display:block;width:58px;height:80px;max-width:100%;margin:0 auto 4px;object-fit:contain;filter:drop-shadow(0 4px 5px #0003)}
      .physicalPrepCard b{display:block;color:#183c60;font-size:7px;line-height:1.15;font-weight:950}
      .physicalPrepHint{margin-top:7px;color:#496174;font-size:7.5px;line-height:1.35;font-weight:800;text-align:center}
      @keyframes physicalPrepIn{from{opacity:0;transform:translateY(7px) scale(.985)}to{opacity:1;transform:none}}
      @media(max-width:760px){
        .physicalPrepTray{margin:7px 0 1px;padding:7px;border-radius:11px}
        .physicalPrepCards{gap:4px}
        .physicalPrepCard{padding:4px 2px}
        .physicalPrepCard img{width:43px;height:60px;margin-bottom:2px}
        .physicalPrepCard b{font-size:6px}
        .physicalPrepTitle{font-size:7px;margin-bottom:5px}
        .physicalPrepHint{font-size:6.5px;margin-top:5px}
      }
      @media(max-width:390px){
        .physicalPrepCards{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:3px}
        .physicalPrepCard{flex:0 0 72px;scroll-snap-align:start}
        .physicalPrepCard img{width:46px;height:64px}
      }
    `;
    document.head.appendChild(style);
  }

  function showTray() {
    ensureStyle();
    let tray = document.querySelector('.physicalPrepTray');
    if (tray) tray.remove();
    const text = document.querySelector('.guideText');
    if (!text) return;
    tray = document.createElement('div');
    tray.className = 'physicalPrepTray';
    tray.setAttribute('aria-label','Four real cards to prepare');
    tray.innerHTML = `
      <div class="physicalPrepTitle">🃏 PUT THESE 4 REAL CARDS IN FRONT OF YOU</div>
      <div class="physicalPrepCards">
        <div class="physicalPrepCard"><img src="images/goalkeeper-card.webp" alt="Goalkeeper card"><b>1 GOALKEEPER</b></div>
        <div class="physicalPrepCard"><img src="images/player-card.webp" alt="Player card"><b>1 PLAYER</b></div>
        <div class="physicalPrepCard"><img src="images/soccer-card.webp" alt="Soccer card"><b>1 SOCCER</b></div>
        <div class="physicalPrepCard"><img src="images/shoot-card.webp" alt="Example Action card"><b>1 ACTION CARD</b></div>
      </div>
      <div class="physicalPrepHint">Keep them beside your screen. The coach will tell you what to move and why.</div>`;
    text.insertAdjacentElement('afterend', tray);
  }

  function hideTray() {
    document.querySelector('.physicalPrepTray')?.remove();
  }

  function guideState() {
    return window.StrategyIntroGuide && window.StrategyIntroGuide.state;
  }

  function maybeIntercept(event) {
    const dialogue = event.target && event.target.closest ? event.target.closest('.guideDialogue') : null;
    if (!dialogue) return;
    if (event.type === 'keydown' && !['Enter',' '].includes(event.key)) return;
    const state = guideState();
    if (!state || state.lesson !== 0 || state.step !== 0 || state.locked) return;

    // First tap while the welcome is typing should keep the original fast-forward behavior.
    if (state.typing) return;

    if (!prepShown) {
      event.preventDefault();
      event.stopImmediatePropagation();
      prepShown = true;
      state.fullText = PREP_TEXT;
      state.typing = false;
      const output = dialogue.querySelector('.guideText');
      const arrow = dialogue.querySelector('.guideContinue');
      if (output) output.textContent = PREP_TEXT;
      if (arrow) { arrow.hidden = false; arrow.textContent = 'READY →'; }
      showTray();
      return;
    }

    // On the next tap, remove the prep tray and let the original Lesson 1 handler continue normally.
    hideTray();
    prepShown = false;
  }

  document.addEventListener('click', maybeIntercept, true);
  document.addEventListener('keydown', maybeIntercept, true);

  // Clean up if the player jumps to another lesson or restarts the intro.
  const observer = new MutationObserver(() => {
    const state = guideState();
    if (!state || state.lesson !== 0 || state.step !== 0) {
      hideTray();
      prepShown = false;
    }
  });
  observer.observe(document.body,{subtree:true,childList:true});
})();
