/* Official rule correction: DEFENSE stops SHOOT; TACKLE only takes possession. */
(() => {
  'use strict';
  if (window.__gsmStrategyRuleCorrection) return;
  window.__gsmStrategyRuleCorrection = true;

  if (typeof lessons !== 'undefined') {
    // Lesson 8 — DEFENSE
    if (lessons[7]) {
      lessons[7].rule = 'DEFENSE stops an incoming SHOOT. A teammate may also play DEFENSE to protect the target. A successful DEFENSE ends the attack and gives the Soccer Card to the defender.';
      lessons[7].prompt = 'GREEN 1 SHOOTS you. Play DEFENSE to stop the attack.';
    }

    // Lesson 9 — TACKLE
    if (lessons[8]) {
      lessons[8].rule = 'TACKLE takes the Soccer Card from another player and gives you possession. TACKLE does not stop an incoming SHOOT.';
      lessons[8].prompt = 'GREEN 2 has possession. Use TACKLE to take the Soccer Card.';
    }

    // Lesson 10 — DRIBBLE PAST
    if (lessons[9]) {
      lessons[9].rule = 'DRIBBLE PAST bypasses a DEFENSE response and continues the same attack. Another DEFENSE may still follow.';
    }
  }

  // Enforce the corrected rule in live card handling, including Final Challenge.
  if (typeof handleCard === 'function') {
    const previousHandleCard = handleCard;
    handleCard = function(name, index) {
      const mode = lessons?.[current]?.mode;

      if (mode === 'defense' && name !== 'DEFENSE') {
        if (name === 'TACKLE') {
          return wrong('TACKLE only takes the Soccer Card from a player. It does not stop an incoming SHOOT. Use DEFENSE.');
        }
        return wrong(`${name} does not stop this SHOOT. Use DEFENSE.`);
      }

      if (mode === 'final' && (stage === 0 || stage === 1) && name !== 'DEFENSE') {
        if (name === 'TACKLE') {
          return wrong('TACKLE is for taking possession. It cannot stop this incoming SHOOT. Use DEFENSE.');
        }
        return wrong(`${name} is not a defensive response to this SHOOT. Use DEFENSE.`);
      }

      return previousHandleCard(name, index);
    };
  }

  // Keep lesson text/course list synced if the patch loads while a lesson is visible.
  try {
    if (typeof renderCoach === 'function') renderCoach();
    if (typeof buildCourses === 'function') buildCourses();
  } catch (_) {}
})();
