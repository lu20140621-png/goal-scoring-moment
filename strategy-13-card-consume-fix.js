/* Keep the visible hand synchronized with the real handCards array.
   Core lesson handlers consume cards in state, but some lesson completions did not repaint the hand. */
(() => {
  'use strict';
  if (window.__gsmStrategy13CardConsumeFixInstalled) return;
  window.__gsmStrategy13CardConsumeFixInstalled = true;

  if (typeof handleCard !== 'function') return;

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
})();
