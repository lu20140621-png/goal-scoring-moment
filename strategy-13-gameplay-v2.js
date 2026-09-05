/* Gameplay interaction layer for the 13-lesson Strategy Tutorial. */
(() => {
  'use strict';

  let inputLocked = false;
  let lessonFinished = false;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const player = id => document.querySelector(`[data-player="${id}"]`);

  function lockInputs(locked = true) {
    inputLocked = locked;
    document.body.classList.toggle('inputLocked', locked);
  }

  function animatePlayer(id, className, duration = 760) {
    const element = player(id);
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    setTimeout(() => element.classList.remove(className), duration);
  }

  function animatePossession(from, to, label = 'SOCCER CARD') {
    if (!from || !to || from === to) return;
    const start = player(from)?.getBoundingClientRect();
    const finish = player(to)?.getBoundingClientRect();
    if (!start || !finish) return;
    const card = document.createElement('img');
    card.className = 'motionCard';
    card.src = ASSETS.SOCCER;
    card.alt = label;
    card.style.left = `${start.left + start.width / 2 - 27}px`;
    card.style.top = `${start.top + start.height / 2 - 27}px`;
    const destinationMarker = player(to)?.querySelector('.ballMark');
    if (destinationMarker) destinationMarker.style.opacity = '0';
    document.body.appendChild(card);
    requestAnimationFrame(() => {
      card.style.transform = `translate(${finish.left - start.left}px,${finish.top - start.top}px) scale(1.16)`;
    });
    setTimeout(() => {
      card.remove();
      if (destinationMarker) destinationMarker.style.opacity = '';
    }, 650);
  }

  function markLatestFlow(kind = 'live') {
    const nodes = [...$('flow').querySelectorAll('.flowNode')];
    const latest = nodes.at(-1);
    if (!latest) return;
    latest.classList.add(kind);
    if (kind === 'live') setTimeout(() => latest.classList.remove(kind), 800);
  }

  async function demonstrateWrong(cardName, message, keepAttack = true) {
    if (inputLocked || lessonFinished) return;
    lockInputs(true);
    const snapshot = $('flow').innerHTML;
    addCard(cardName, 'YOU', 'WRONG RESPONSE');
    markLatestFlow();
    addResult(keepAttack ? 'SHOOT STILL ACTIVE' : 'GOAL NOT ACHIEVED', 'bad');
    const demo = document.createElement('div');
    demo.className = 'wrongDemo';
    demo.innerHTML = `<span>${message}</span>`;
    $('pitch').appendChild(demo);
    setPitchEvent(keepAttack ? 'ATTACK NOT STOPPED' : 'TRY A DIFFERENT PLAY', 'bad');
    await delay(1050);
    demo.remove();
    $('flow').innerHTML = snapshot;
    setPitchEvent('');
    feedback(`${message} Try again.`, true);
    lockInputs(false);
  }

  function renderTurnOrder(skipped = false) {
    document.querySelector('.turnOrder')?.remove();
    if (lessons[current].mode !== 'yellow') return;
    const order = document.createElement('div');
    order.className = 'turnOrder';
    order.innerHTML = `<span class="turnSeat">YOU · NOW</span><span class="turnArrow">→</span><span class="turnSeat ${skipped ? 'skipped' : 'next'}">GREEN 1 · NEXT</span><span class="turnArrow">→</span><span class="turnSeat">BLUE 2</span>`;
    $('contextActions').before(order);
  }

  const coreRenderHand = renderHand;
  renderHand = function(activeNames = [], pulse = true) {
    // GUIDE and TEST cards stay available: the board explains consequences instead
    // of disabling every incorrect decision and revealing the answer.
    if (current >= 5) activeNames = [...new Set(handCards)];
    coreRenderHand(activeNames, current < 5 && pulse);
  };

  const coreSetupLesson = setupLesson;
  setupLesson = function() {
    lessonFinished = false;
    lockInputs(false);
    const result = coreSetupLesson();
    renderTurnOrder();
    if (lessons[current].mode === 'defense') {
      animatePlayer('A0', 'attacking');
      setPitchEvent('GREEN 1 SHOOTS → YOU', 'bad');
    }
    if (lessons[current].mode === 'dribble') {
      animatePlayer('A0', 'blocking');
      setPitchEvent('GREEN 1 BLOCKS YOUR SHOOT', 'warn');
    }
    if (lessons[current].mode === 'secondDefense') {
      setPitchEvent('ATTACK CONTINUES → YOUR RESPONSE', 'bad');
      markLatestFlow();
    }
    return result;
  };

  const coreComplete = complete;
  complete = function(message) {
    if (lessonFinished) return;
    lessonFinished = true;
    return coreComplete(message);
  };

  const coreHandlePlayer = handlePlayer;
  handlePlayer = function(id) {
    if (inputLocked || lessonFinished) return;
    const beforeBall = ballOwner;
    const beforeTokens = {...tokens};
    coreHandlePlayer(id);
    if (ballOwner !== beforeBall) {
      animatePossession(beforeBall, ballOwner);
      setPitchEvent(`SOCCER CARD → ${nameOf(ballOwner)}`, 'good');
    }
    Object.keys(tokens).forEach(key => {
      if ((tokens[key] || 0) > (beforeTokens[key] || 0)) animatePlayer(key, tokens[key] >= 3 ? 'elimination' : 'tokenPop', 900);
    });
  };

  const coreHandleCard = handleCard;
  handleCard = function(name, index) {
    if (inputLocked || lessonFinished) return;
    const mode = lessons[current].mode;
    const beforeBall = ballOwner;
    const beforeTokens = {...tokens};
    const beforeStage = stage;

    if ((mode === 'shoot' || mode === 'tokens') && name !== 'SHOOT') {
      return demonstrateWrong(name, `${name} does not start an attack. Possession plus SHOOT does.` , false);
    }
    if (mode === 'defense' && name === 'YELLOW') {
      return demonstrateWrong(name, 'YELLOW skips a turn. It does not stop SHOOT.');
    }
    if (mode === 'defense' && name === 'TACKLE') {
      lockInputs(true);
      removeHandIndex(index);
      addCard('TACKLE', 'YOU', 'DEFENSIVE TACKLE');
      ballOwner = 'H0';
      renderPlayers();
      setDefender('H0');
      addResult('ATTACK STOPPED', 'good');
      addResult('SOCCER CARD → YOU', 'good');
      animatePlayer('H0', 'blocking');
      animatePossession('A0', 'H0');
      complete('Defensive TACKLE is also a legal response: the attack stops and you take possession.');
      setTimeout(() => lockInputs(false), 680);
      return;
    }
    if (mode === 'tackle' && name !== 'TACKLE') {
      return demonstrateWrong(name, `${name} does not take the Soccer Card from GREEN 2. TACKLE transfers possession.`, false);
    }
    if (mode === 'dribble' && name !== 'DRIBBLE PAST') {
      return demonstrateWrong(name, `${name} cannot bypass the DEFENSE already blocking this attack.`);
    }
    if (mode === 'yellow' && name !== 'YELLOW') {
      return demonstrateWrong(name, `${name} does not change turn order. GREEN 1 would still take the next turn.`, false);
    }
    if (mode === 'secondDefense' && stage === 0 && name !== 'DEFENSE') {
      return demonstrateWrong(name, `${name} does not stop the SHOOT after DRIBBLE PAST. The attack is still live.`);
    }
    if (mode === 'final') {
      if ((stage === 0 || stage === 1) && !['DEFENSE', 'TACKLE'].includes(name)) {
        return demonstrateWrong(name, `${name} leaves the incoming SHOOT active. Choose a legal defensive response.`);
      }
      if (stage === 3 && name !== 'SHOOT') {
        return demonstrateWrong(name, `${name} cannot eliminate the hidden opponent. You have possession; create an attack.`, false);
      }
      if (stage === 2 && name === 'SHOOT') {
        return demonstrateWrong(name, 'Keep SHOOT for your attack. Discard another card so the match remains playable.', false);
      }
    }

    lockInputs(true);
    coreHandleCard(name, index);
    markLatestFlow();

    if (mode === 'defense') {
      animatePlayer('H0', 'blocking');
      setPitchEvent('ATTACK STOPPED', 'good');
    } else if (mode === 'tackle') {
      animatePlayer('A1', 'bypassed');
      setPitchEvent('POSSESSION WON', 'good');
    } else if (mode === 'dribble') {
      const defenseNodes = [...$('flow').querySelectorAll('.flowNode')];
      defenseNodes.at(-2)?.classList.add('bypassed');
      animatePlayer('A0', 'bypassed');
      setPitchEvent('DEFENSE BYPASSED', 'good');
    } else if (mode === 'secondDefense' && beforeStage === 0) {
      animatePlayer('H0', 'blocking');
      setPitchEvent('SECOND DEFENSE · POSSESSION WON', 'good');
    } else if (mode === 'yellow') {
      renderTurnOrder(true);
      setPitchEvent('GREEN 1 TURN SKIPPED', 'warn');
    } else if (mode === 'final' && (beforeStage === 0 || beforeStage === 1)) {
      animatePlayer('H0', 'blocking');
      setPitchEvent(beforeStage === 0 ? 'DEFENSE PLAYED · ATTACK CONTINUES' : 'ATTACK STOPPED · POSSESSION WON', beforeStage ? 'good' : 'warn');
    }

    if (ballOwner !== beforeBall) animatePossession(beforeBall, ballOwner);
    Object.keys(tokens).forEach(key => {
      if ((tokens[key] || 0) > (beforeTokens[key] || 0)) animatePlayer(key, tokens[key] >= 3 ? 'elimination' : 'tokenPop', 900);
    });
    setTimeout(() => lockInputs(false), 680);
  };

  const coreResolveTarget = resolveTarget;
  resolveTarget = function(id) {
    if (inputLocked || lessonFinished) return;
    const beforeTokens = {...tokens};
    lockInputs(true);
    animatePlayer(id, 'attacking');
    setPitchEvent(`SHOOT → ${nameOf(id)}`, 'bad');
    coreResolveTarget(id);
    if ((tokens[id] || 0) > (beforeTokens[id] || 0)) {
      animatePlayer(id, tokens[id] >= 3 ? 'elimination' : 'tokenPop', 950);
      if (tokens[id] >= 3) {
        setPitchEvent(roleFor(id) === 'GOALKEEPER' ? 'GOALKEEPER FOUND · YOU WIN' : 'PLAYER ELIMINATED · ROLE REVEALED', 'good');
      } else setPitchEvent('+1 TOKEN', 'warn');
    }
    setTimeout(() => lockInputs(false), 900);
  };

  const coreStartFinalChallenge = startFinalChallenge;
  startFinalChallenge = function() {
    lessonFinished = false;
    coreStartFinalChallenge();
    $('lessonTitle').textContent = 'FINAL CHALLENGE';
    $('lessonSub').textContent = 'NO CARD HINTS · A short playable match';
    animatePlayer('A0', 'attacking');
    setPitchEvent('LIVE MATCH · GREEN 1 SHOOTS → YOU', 'bad');
  };

  lessons[12].title = 'FINAL CHALLENGE';
  lessons[12].sub = 'NO CARD HINTS · Win the short playable match.';
  renderCoach();
})();
