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

  function ensureYellowOrderStyles() {
    if (document.getElementById('yellowOrderVisualStyles')) return;
    const style = document.createElement('style');
    style.id = 'yellowOrderVisualStyles';
    style.textContent = `
      .yellowOrderNo{position:absolute;z-index:30;left:-10px;top:-12px;min-width:28px;height:28px;padding:0 7px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:#071c31;color:#fff;border:2px solid #ffd557;box-shadow:0 4px 10px #0007;font-size:12px;font-weight:950;pointer-events:none}
      .yellowNextTag{position:absolute;z-index:29;right:-8px;top:-13px;padding:4px 7px;border-radius:999px;background:#ffd557;color:#543700;border:2px solid #fff3b2;box-shadow:0 4px 10px #0006;font-size:7px;font-weight:950;letter-spacing:.05em;pointer-events:none}
      .yellowSkipIcon{position:absolute;z-index:40;left:50%;top:50%;transform:translate(-50%,-50%);width:66px;height:66px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff;border:5px solid #e33d4f;color:#e33d4f;box-shadow:0 0 0 4px #ffffffaa,0 8px 20px #0008;font-size:36px;line-height:1;pointer-events:none;animation:yellowSkipPop .35s ease-out}
      .yellowSkipText{position:absolute;z-index:41;left:50%;bottom:-27px;transform:translateX(-50%);white-space:nowrap;padding:4px 8px;border-radius:999px;background:#9d2437;color:#fff;border:2px solid #fff;font-size:8px;font-weight:950;letter-spacing:.05em;pointer-events:none}
      .turnOrder.yellowExpanded{display:flex!important;align-items:center;justify-content:center;gap:5px;flex-wrap:wrap;padding:7px 5px;margin:6px 0 2px;border:1px solid #6c8194;border-radius:10px;background:#071a2d}
      .turnOrder.yellowExpanded .turnSeat{padding:5px 7px;border-radius:999px;background:#163a59;border:1px solid #416f93;color:#fff;font-size:8px;font-weight:950;white-space:nowrap}
      .turnOrder.yellowExpanded .turnSeat.next{background:#6e5411;border-color:#ffd557;color:#fff7d7;box-shadow:0 0 0 2px #ffd55755}
      .turnOrder.yellowExpanded .turnSeat.skipped{background:#8e2638;border-color:#ff7182;color:#fff;text-decoration:line-through}
      .turnOrder.yellowExpanded .turnSeat.now{background:#1e5f9d;border-color:#70b7ff}
      .turnOrder.yellowExpanded .turnArrow{font-size:14px;color:#ffd557;font-weight:950}
      .yellowOrderNote{width:100%;text-align:center;color:#bcd0e2;font-size:7px;font-weight:900;margin-top:1px}
      @keyframes yellowSkipPop{from{transform:translate(-50%,-50%) scale(.45) rotate(-15deg);opacity:.2}to{transform:translate(-50%,-50%) scale(1) rotate(0);opacity:1}}
      @media(max-width:760px){
        .yellowOrderNo{left:-7px;top:-9px;min-width:23px;height:23px;padding:0 5px;font-size:10px}
        .yellowNextTag{right:-5px;top:-10px;font-size:6px;padding:3px 5px}
        .yellowSkipIcon{width:52px;height:52px;border-width:4px;font-size:28px}
        .yellowSkipText{bottom:-23px;font-size:6.5px;padding:3px 6px}
        .turnOrder.yellowExpanded{gap:3px;padding:5px 3px}
        .turnOrder.yellowExpanded .turnSeat{font-size:6.5px;padding:4px 5px}
        .turnOrder.yellowExpanded .turnArrow{font-size:11px}
        .yellowOrderNote{font-size:6.2px}
      }
    `;
    document.head.appendChild(style);
  }

  function clearYellowFieldOrder() {
    document.querySelectorAll('.yellowOrderNo,.yellowNextTag,.yellowSkipIcon,.yellowSkipText').forEach(el => el.remove());
  }

  function renderYellowFieldOrder(skipped = false) {
    ensureYellowOrderStyles();
    clearYellowFieldOrder();
    const sequence = [['A0','1'],['H1','2'],['A1','3'],['H0','4']];
    sequence.forEach(([id, number]) => {
      const seat = player(id);
      if (!seat) return;
      const badge = document.createElement('span');
      badge.className = 'yellowOrderNo';
      badge.textContent = number;
      seat.appendChild(badge);
    });
    const green1 = player('A0');
    if (!green1) return;
    if (skipped) {
      const icon = document.createElement('span');
      icon.className = 'yellowSkipIcon';
      icon.textContent = '🚫';
      const text = document.createElement('span');
      text.className = 'yellowSkipText';
      text.textContent = 'SKIPPED';
      green1.append(icon, text);
    } else {
      const next = document.createElement('span');
      next.className = 'yellowNextTag';
      next.textContent = 'NEXT';
      green1.appendChild(next);
    }
  }

  function renderTurnOrder(skipped = false) {
    document.querySelector('.turnOrder')?.remove();
    clearYellowFieldOrder();
    if (lessons[current].mode !== 'yellow') return;
    renderYellowFieldOrder(skipped);
    const order = document.createElement('div');
    order.className = 'turnOrder yellowExpanded';
    order.innerHTML = `<span class="turnSeat ${skipped ? 'skipped' : 'next'}">① GREEN 1 · ${skipped ? 'SKIPPED' : 'NEXT'}</span><span class="turnArrow">→</span><span class="turnSeat">② BLUE 2</span><span class="turnArrow">→</span><span class="turnSeat">③ GREEN 2</span><span class="turnArrow">→</span><span class="turnSeat now">④ YOU · NOW</span><div class="yellowOrderNote">After YOU, the turn order loops back to GREEN 1.</div>`;
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
