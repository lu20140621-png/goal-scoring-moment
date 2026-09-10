/* Move lesson completion / next navigation into the coach dialogue. */
(() => {
  'use strict';
  if (window.__gsmNextInCoachInstalled) return;
  window.__gsmNextInCoachInstalled = true;

  if (typeof nextButton !== 'function') return;
  const originalNextButton = nextButton;

  function coachAdvance(message = 'Lesson complete.') {
    const scene = document.querySelector('.guideScene');
    const output = scene?.querySelector('.guideText');
    const button = scene?.querySelector('.guideContinue');
    const actions = typeof $ === 'function' ? $('contextActions') : null;

    if (!scene || !output || !button) {
      originalNextButton(message);
      return;
    }

    if (actions) actions.innerHTML = '';

    const guideState = window.StrategyIntroGuide?.state;
    if (guideState?.timer) clearTimeout(guideState.timer);
    if (guideState) {
      guideState.typing = false;
      guideState.locked = false;
      guideState.waitForAction = false;
    }

    const isFinal = current === lessons.length - 1;
    const label = isFinal ? 'FINISH TUTORIAL →' : 'NEXT LESSON →';
    let text;
    if (current === 9) {
      text = 'Great — you learned DRIBBLE PAST. This lesson ends here. In the next lesson we start a NEW attack from the beginning: GREEN 1 plays SHOOT, YOU play the first DEFENSE, GREEN 1 uses DRIBBLE PAST, then YOU play the second DEFENSE. You will perform the whole defensive chain yourself.';
    } else {
      text = message && message !== 'Lesson complete.'
        ? `Nice work. ${message}`
        : 'Nice work. You completed this lesson.';
    }

    button.hidden = true;
    button.textContent = label;
    button.classList.add('wide');
    output.textContent = '';

    let i = 0;
    const tick = () => {
      output.textContent = text.slice(0, ++i);
      if (i < text.length) {
        if (guideState) guideState.timer = setTimeout(tick, 14);
        else setTimeout(tick, 14);
      } else {
        button.hidden = false;
      }
    };
    tick();

    button.onclick = event => {
      event.preventDefault();
      event.stopPropagation();
      button.onclick = null;
      button.hidden = true;

      if (isFinal) {
        $('completeModal').classList.add('show');
        return;
      }

      current++;
      setupLesson();
    };
  }

  nextButton = coachAdvance;
})();