/* Strategy 13 safety fixes: keep the tutorial solvable and mobile-friendly. */
(() => {
  'use strict';
  if (window.__gsmStrategy13SafetyInstalled) return;
  window.__gsmStrategy13SafetyInstalled = true;

  // Lesson 11: BLUE 2 already used the first DEFENSE, so YOU only need one DEFENSE
  // plus two valid discard choices. This mirrors the taught chain exactly.
  try {
    if (typeof lessons !== 'undefined' && lessons[10]) {
      lessons[10].hand = ['DEFENSE', 'YELLOW', 'TACKLE'];
    }
  } catch (_) {}

  // Final challenge must remain solvable: keep SHOOT for the attack after the
  // required second-defense discard.
  try {
    if (typeof handleFinalCard === 'function') {
      const originalHandleFinalCard = handleFinalCard;
      handleFinalCard = function(name, index) {
        if (typeof stage !== 'undefined' && stage === 2 && name === 'SHOOT') {
          if (typeof wrong === 'function') {
            wrong('Keep SHOOT for the attack after this discard. Choose another remaining card.');
          }
          return;
        }
        return originalHandleFinalCard(name, index);
      };
    }
  } catch (e) {
    console.error('Strategy 13 final-challenge safety patch failed', e);
  }

  // On phones, every new lesson starts with the RULE / YOUR MOVE panel visible
  // instead of leaving the player scrolled down at the previous hand.
  try {
    if (typeof setupLesson === 'function') {
      const originalSetupLesson = setupLesson;
      setupLesson = function() {
        const result = originalSetupLesson();
        if (window.matchMedia('(max-width:760px)').matches) {
          requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
        }
        return result;
      };
    }
  } catch (e) {
    console.error('Strategy 13 mobile lesson reset patch failed', e);
  }
})();
