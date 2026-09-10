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
   After the coach welcomes the player, pause once and ask them to prepare the six real cards used by the guided tabletop demo. */
(() => {
  'use strict';
  if (window.__gsmStrategyPhysicalPrepInstalled) return;
  window.__gsmStrategyPhysicalPrepInstalled = true;

  const PREP_TEXT = 'Before we start, grab six real cards from the box: the BLUE Team GOALKEEPER and PLAYER, the GREEN Team GOALKEEPER and PLAYER, 1 SOCCER card, and any 1 ACTION card. Lay all six in front of you and follow along with me — we’ll use these real cards as we learn.';
  let prepShown = false;

  function ensureStyle() {
    if (document.getElementById('gsm-physical-prep-style')) return;
    const style = document.createElement('style');
    style.id = 'gsm-physical-prep-style';
    style.textContent = `
      .physicalPrepTray{max-width:100%;margin:10px 0 2px;padding:10px;border:2px solid #d7b33a;border-radius:14px;background:linear-gradient(180deg,#fff8d8,#f4f8fc);box-shadow:0 7px 18px #17324f24;overflow:hidden;animation:physicalPrepIn .28s ease-out}
      .physicalPrepTitle{display:block;margin-bottom:8px;color:#6d5100;font-size:9px;line-height:1.25;font-weight:950;letter-spacing:.06em;text-align:center;white-space:normal;overflow-wrap:anywhere}
      .physicalPrepCards{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;min-width:0}
      .physicalPrepCard{position:relative;min-width:0;padding:18px 3px 5px;border:1px solid #bfd0df;border-radius:10px;background:#fff;text-align:center;box-shadow:0 3px 8px #17324f1f;overflow:hidden}
      .physicalPrepCard.blueRole{border-color:#4c91d4;background:#f3f8ff}
      .physicalPrepCard.greenRole{border-color:#39a56d;background:#f2fbf5}
      .physicalPrepTeam{position:absolute;left:4px;right:4px;top:4px;border-radius:999px;padding:2px 3px;color:#fff;font-size:6px;line-height:1;font-weight:950;letter-spacing:.08em;white-space:nowrap}
      .physicalPrepTeam.blue{background:#2876d2}.physicalPrepTeam.green{background:#1a9b59}.physicalPrepTeam.neutral{background:#526d82}
      .physicalPrepCard img{display:block;width:50px;height:70px;max-width:100%;margin:0 auto 4px;object-fit:contain;filter:drop-shadow(0 4px 5px #0003)}
      .physicalPrepCard b{display:block;color:#183c60;font-size:6.5px;line-height:1.15;font-weight:950;overflow-wrap:anywhere}
      .physicalPrepHint{margin-top:7px;color:#496174;font-size:7.5px;line-height:1.35;font-weight:800;text-align:center}
      .guideDialogue.physicalPrepActive{padding-right:18px;padding-bottom:62px}
      .guideDialogue.physicalPrepActive .guideContinue{right:12px;bottom:10px;width:auto;min-width:90px;height:40px;padding:0 14px;border-radius:999px;font-size:10px;line-height:1;white-space:nowrap}
      @keyframes physicalPrepIn{from{opacity:0;transform:translateY(7px) scale(.985)}to{opacity:1;transform:none}}
      @media(max-width:760px){
        .guideScene.physicalPrepScene .guidePortrait{flex:0 0 76px!important;width:76px!important;height:96px!important}
        .guideDialogue.physicalPrepActive{padding:10px 9px 54px!important}
        .guideDialogue.physicalPrepActive .guideContinue{right:7px;bottom:7px;min-width:82px;height:36px;padding:0 12px;font-size:9px}
        .physicalPrepTray{margin:7px 0 1px;padding:7px 6px;border-radius:11px}
        .physicalPrepTitle{font-size:7px;margin-bottom:5px;letter-spacing:.04em}
        .physicalPrepCards{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}
        .physicalPrepCard{padding:16px 2px 4px}
        .physicalPrepCard img{width:40px;height:56px;margin-bottom:2px}
        .physicalPrepCard b{font-size:5.8px}
        .physicalPrepTeam{left:3px;right:3px;top:3px;font-size:5.5px;padding:2px}
        .physicalPrepHint{font-size:6.4px;margin-top:5px}
      }
      @media(max-width:350px){
        .guideScene.physicalPrepScene .guidePortrait{flex-basis:68px!important;width:68px!important;height:86px!important}
        .physicalPrepCard img{width:34px;height:49px}
        .physicalPrepCard b{font-size:5.4px}
      }
    `;
    document.head.appendChild(style);
  }

  function showTray(dialogue) {
    ensureStyle();
    document.querySelector('.physicalPrepTray')?.remove();
    const text = dialogue?.querySelector('.guideText') || document.querySelector('.guideText');
    if (!text) return;

    dialogue?.classList.add('physicalPrepActive');
    dialogue?.parentElement?.classList.add('physicalPrepScene');

    const tray = document.createElement('div');
    tray.className = 'physicalPrepTray';
    tray.setAttribute('aria-label','Six real cards to prepare');
    tray.innerHTML = `
      <div class="physicalPrepTitle">🃏 PUT THESE 6 REAL CARDS IN FRONT OF YOU</div>
      <div class="physicalPrepCards">
        <div class="physicalPrepCard blueRole"><span class="physicalPrepTeam blue">BLUE TEAM</span><img src="images/goalkeeper-card.webp" alt="Blue Team Goalkeeper card"><b>GOALKEEPER</b></div>
        <div class="physicalPrepCard blueRole"><span class="physicalPrepTeam blue">BLUE TEAM</span><img src="images/player-card.webp" alt="Blue Team Player card"><b>PLAYER</b></div>
        <div class="physicalPrepCard greenRole"><span class="physicalPrepTeam green">GREEN TEAM</span><img src="images/goalkeeper-card.webp" alt="Green Team Goalkeeper card"><b>GOALKEEPER</b></div>
        <div class="physicalPrepCard greenRole"><span class="physicalPrepTeam green">GREEN TEAM</span><img src="images/player-card.webp" alt="Green Team Player card"><b>PLAYER</b></div>
        <div class="physicalPrepCard"><span class="physicalPrepTeam neutral">TAKE 1</span><img src="images/soccer-card.webp" alt="Soccer card"><b>SOCCER</b></div>
        <div class="physicalPrepCard"><span class="physicalPrepTeam neutral">ANY 1</span><img src="images/shoot-card.webp" alt="Example Action card"><b>ACTION CARD</b></div>
      </div>
      <div class="physicalPrepHint">Keep all six beside your screen. The coach will tell you what to move and why.</div>`;
    text.insertAdjacentElement('afterend', tray);
  }

  function hideTray() {
    document.querySelector('.physicalPrepTray')?.remove();
    document.querySelectorAll('.guideDialogue.physicalPrepActive').forEach(dialogue => {
      dialogue.classList.remove('physicalPrepActive');
      const arrow = dialogue.querySelector('.guideContinue');
      if (arrow && arrow.textContent === 'READY →') arrow.textContent = '›';
    });
    document.querySelectorAll('.guideScene.physicalPrepScene').forEach(el => el.classList.remove('physicalPrepScene'));
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

    // First tap while the welcome is typing keeps the original fast-forward behavior.
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
      showTray(dialogue);
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
