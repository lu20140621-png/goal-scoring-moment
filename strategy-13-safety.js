/* Strategy 13 safety fixes: keep the tutorial solvable and mobile-friendly. */
(() => {
  'use strict';
  if (window.__gsmStrategy13SafetyInstalled) return;
  window.__gsmStrategy13SafetyInstalled = true;

  // SECOND DEFENSE lesson: the learner now plays BOTH the first and second
  // DEFENSE cards. Keep two DEFENSE cards plus valid discard choices.
  try {
    if (typeof lessons !== 'undefined' && lessons[10]) {
      lessons[10].hand = ['DEFENSE', 'DEFENSE', 'YELLOW', 'TACKLE'];
    }
  } catch (_) {}

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