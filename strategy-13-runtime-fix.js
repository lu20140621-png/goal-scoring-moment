/* Runtime fixes for the 13-lesson Strategy Tutorial.
   Keeps mobile layout separated, removes geometry-changing target pulses,
   and makes target selection immediately responsive without allowing duplicates. */
(() => {
  'use strict';
  if (window.__gsmStrategy13RuntimeFix) return;
  window.__gsmStrategy13RuntimeFix = true;

  const style = document.createElement('style');
  style.id = 'gsm-strategy13-runtime-fix-style';
  style.textContent = `
    .player.selectable{
      animation:none!important;
      outline:3px solid rgba(255,211,78,.92);
      outline-offset:2px;
      filter:drop-shadow(0 0 10px rgba(255,211,78,.45));
    }
    .inputLocked .player.selectable{pointer-events:auto!important}
    @media(max-width:760px){
      .coach{
        position:relative!important;
        top:auto!important;
        transform:none!important;
        margin:0!important;
      }
      .board{position:relative!important;margin-top:0!important}
    }
  `;
  document.head.appendChild(style);

  let targetBusy = false;

  const previousSetupLesson = setupLesson;
  setupLesson = function() {
    targetBusy = false;
    return previousSetupLesson();
  };

  // Replace player handling so a newly exposed SHOOT target can be tapped
  // immediately, even while the previous card animation is finishing.
  handlePlayer = function(id) {
    if (current < 3 && window.StrategyIntroGuide) {
      window.StrategyIntroGuide.player(id);
      return;
    }
    const mode = lessons[current].mode;

    if (mode === 'teammate') {
      if (id !== 'H1') return wrong('BLUE 2 is your teammate. GREEN players are opponents.');
      complete('Correct. Team color is public; hidden role is separate from team.');
      return;
    }

    if (mode === 'identifyBall') {
      if (id !== ballOwner) return wrong(`${nameOf(id)} does not have the Soccer Card.`);
      complete('Correct. The Soccer Card marks possession.');
      return;
    }

    if (mode === 'pass') {
      if (id !== 'H1') return wrong('PASS must go to a teammate in this lesson.');
      const from = ballOwner;
      ballOwner = 'H1';
      renderPlayers();
      addResult('SOCCER CARD → BLUE 2', 'good');
      setPitchEvent('SOCCER CARD → BLUE 2', 'good');
      complete('Pass complete. Possession changed to BLUE 2 without using a PASS card.');
      return;
    }

    if (awaitingTarget) resolveTarget(id);
  };

  // Resolve target selection directly so the first tap always works.
  // targetBusy prevents rapid taps from adding Tokens or completing twice.
  resolveTarget = function(id) {
    if (targetBusy || !awaitingTarget) return;
    if (!['A0', 'A1'].includes(id)) {
      wrong('SHOOT must target a living opponent.');
      return;
    }

    targetBusy = true;
    awaitingTarget = false;
    setSelectable([]);
    setTarget(id);
    setPitchEvent(`SHOOT → ${nameOf(id)}`, 'warn');

    const mode = lessons[current].mode;

    if (mode === 'shoot') {
      tokens[id] = (tokens[id] || 0) + 1;
      renderPlayers();
      addResult(`${nameOf(id)} +1 TOKEN`, 'good');
      setPitchEvent('+1 TOKEN', 'warn');
      complete('No defense was played, so the target takes 1 Token.');
      return;
    }

    if (mode === 'tokens') {
      tokens.A0 = 3;
      eliminated.A0 = true;
      revealed.A0 = 'PLAYER';
      renderPlayers();
      addResult('GREEN 1 → 3 TOKENS', 'warn');
      addResult('ELIMINATED · PLAYER REVEALED', 'good');
      setPitchEvent('PLAYER ELIMINATED · ROLE REVEALED', 'good');
      complete('At 3 Tokens the player is eliminated and the hidden role is revealed.');
      return;
    }

    if (mode === 'final' && stage === 4) {
      if (id !== 'A1') {
        targetBusy = false;
        awaitingTarget = true;
        setSelectable(['A0', 'A1']);
        $('promptText').textContent = 'GREEN 1 is already known to be a Player. Choose the remaining hidden opponent.';
        wrong('GREEN 1 is already known to be a Player. Try the remaining hidden opponent.');
        return;
      }

      tokens.A1 = 3;
      eliminated.A1 = true;
      revealed.A1 = 'GOALKEEPER';
      renderPlayers();
      addResult('GREEN 2 → 3 TOKENS', 'warn');
      addResult('GOALKEEPER REVEALED', 'bad');
      addResult('GREEN TEAM LOSES', 'good');
      stage = 5;
      setPitchEvent('GOALKEEPER FOUND · YOU WIN', 'good');
      complete('You eliminated the hidden Goalkeeper. The game ends immediately — you win.');
    }
  };
})();
