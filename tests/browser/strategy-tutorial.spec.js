const {test, expect} = require('@playwright/test');

const viewports = [
  {width: 320, height: 700},
  {width: 375, height: 812},
  {width: 390, height: 844},
  {width: 430, height: 932},
  {width: 1366, height: 768},
  {width: 1440, height: 900},
  {width: 1920, height: 1080},
];

const criticalCards = /(?:soccer|shoot|defense|tackle)(?:-card)?\.(?:webp|png)/i;

async function loadTutorial(page) {
  const javascriptErrors = [];
  const failedCriticalImages = [];
  page.on('pageerror', error => javascriptErrors.push(error.message));
  page.on('response', response => {
    if (criticalCards.test(response.url()) && !response.ok()) {
      failedCriticalImages.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('requestfailed', request => {
    if (criticalCards.test(request.url())) failedCriticalImages.push(request.url());
  });

  const response = await page.goto('/strategy-cards.html');
  expect(response?.ok()).toBeTruthy();
  const iframe = page.locator('#game');
  await expect(iframe).toBeVisible();
  await expect.poll(() => page.frames().some(candidate => /strategy-13\.html/.test(candidate.url()))).toBeTruthy();
  const frame = page.frameLocator('#game');
  await expect(frame.locator('#introModal')).toBeVisible();
  await expect(frame.locator('.player')).toHaveCount(4);
  await frame.locator('#startBtn').click();
  await expect(frame.locator('#introModal')).not.toBeVisible();
  return {frame, javascriptErrors, failedCriticalImages};
}

async function openLesson(frame, number) {
  await frame.locator('#coursesBtn').click();
  const course = frame.locator('.courseBtn').nth(number - 1);
  await expect(course).toBeVisible();
  await course.click();
  await expect(frame.locator('#progressLabel')).toHaveText(`LESSON ${number} OF 13`);
}

async function expectNoRuntimeFailures(javascriptErrors, failedCriticalImages) {
  expect(javascriptErrors, 'uncaught JavaScript errors').toEqual([]);
  expect(failedCriticalImages, 'failed critical card image requests').toEqual([]);
}

async function validateLayout(page, frame, viewport) {
  const wrapperLayout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  expect(wrapperLayout.scrollWidth).toBeLessThanOrEqual(viewport.width);
  expect(wrapperLayout.bodyScrollWidth).toBeLessThanOrEqual(viewport.width);

  const layout = await frame.locator('body').evaluate(body => {
    const rect = element => {
      const box = element.getBoundingClientRect();
      return {left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height};
    };
    const pitch = rect(document.querySelector('.pitch'));
    const coach = rect(document.querySelector('.coach'));
    const players = [...document.querySelectorAll('.player')].map(rect);
    const tokens = [...document.querySelectorAll('.tokens')].map(element => ({box: rect(element), scrollWidth: element.scrollWidth, clientWidth: element.clientWidth}));
    const ball = document.querySelector('.ballMark');
    const hand = document.querySelector('.hand');
    const flow = document.querySelector('.flow');
    const rule = rect(document.querySelector('.ruleBox'));
    const move = rect(document.querySelector('.moveBox'));
    return {
      documentWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyWidth: body.scrollWidth,
      pitch,
      coach,
      players,
      tokens,
      ball: ball ? {...rect(ball), visibility: getComputedStyle(ball).visibility, opacity: getComputedStyle(ball).opacity} : null,
      hand: {...rect(hand), overflowX: getComputedStyle(hand).overflowX},
      flow: {...rect(flow), overflowX: getComputedStyle(flow).overflowX},
      rule,
      move,
    };
  });

  expect(layout.documentWidth).toBeLessThanOrEqual(layout.clientWidth);
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.clientWidth);
  for (const card of layout.players) {
    expect(card.left).toBeGreaterThanOrEqual(layout.pitch.left - 1);
    expect(card.right).toBeLessThanOrEqual(layout.pitch.right + 1);
    expect(card.top).toBeGreaterThanOrEqual(layout.pitch.top - 1);
    expect(card.bottom).toBeLessThanOrEqual(layout.pitch.bottom + 1);
    const overlapsCoach = card.left < layout.coach.right && card.right > layout.coach.left && card.top < layout.coach.bottom && card.bottom > layout.coach.top;
    expect(overlapsCoach, 'RULE / YOUR MOVE must not overlap a player').toBeFalsy();
  }
  expect(layout.rule.bottom <= layout.pitch.top || layout.rule.left >= layout.pitch.right || layout.rule.right <= layout.pitch.left).toBeTruthy();
  expect(layout.move.bottom <= layout.pitch.top || layout.move.left >= layout.pitch.right || layout.move.right <= layout.pitch.left).toBeTruthy();
  expect(layout.ball).not.toBeNull();
  expect(layout.ball.visibility).not.toBe('hidden');
  expect(Number(layout.ball.opacity)).toBeGreaterThan(0);
  for (const token of layout.tokens) expect(token.scrollWidth).toBeLessThanOrEqual(token.clientWidth + 1);
  expect(layout.hand.height).toBeGreaterThan(0);
  expect(layout.flow.height).toBeGreaterThan(0);
  if (viewport.width <= 430) expect(layout.hand.overflowX).toBe('auto');

  const cards = frame.locator('.cardBtn');
  expect(await cards.count()).toBeGreaterThan(0);
  await expect(cards.first()).toBeEnabled();

  await frame.locator('#coursesBtn').click();
  const modal = frame.locator('#coursesModal .modalBox');
  await expect(modal).toBeVisible();
  const modalLayout = await modal.evaluate(element => {
    const box = element.getBoundingClientRect();
    return {left: box.left, right: box.right, top: box.top, bottom: box.bottom, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight, overflowY: getComputedStyle(element).overflowY};
  });
  expect(modalLayout.left).toBeGreaterThanOrEqual(0);
  expect(modalLayout.right).toBeLessThanOrEqual(viewport.width);
  expect(modalLayout.top).toBeGreaterThanOrEqual(0);
  expect(modalLayout.bottom).toBeLessThanOrEqual(viewport.height);
  if (modalLayout.scrollHeight > modalLayout.clientHeight) expect(['auto', 'scroll']).toContain(modalLayout.overflowY);
  await frame.locator('#closeCourses').click();
}

for (const viewport of viewports) {
  test(`layout and loading at ${viewport.width}x${viewport.height}`, async ({page}) => {
    await page.setViewportSize(viewport);
    const state = await loadTutorial(page);
    await openLesson(state.frame, 8);
    await validateLayout(page, state.frame, viewport);
    await expectNoRuntimeFailures(state.javascriptErrors, state.failedCriticalImages);
  });
}

test('representative lessons provide distinct playable interactions', async ({page}) => {
  await page.setViewportSize({width: 1440, height: 900});
  const state = await loadTutorial(page);
  const {frame} = state;

  await openLesson(frame, 5);
  await frame.locator('[data-player="H1"]').click();
  await expect(frame.locator('#pitchEvent')).toContainText('SOCCER CARD');

  await openLesson(frame, 6);
  await frame.locator('.cardBtn[data-card="SHOOT"]').click();
  await frame.locator('[data-player="A0"]').click();
  await expect(frame.locator('#feedback')).toContainText('Token');

  await openLesson(frame, 8);
  await frame.locator('.cardBtn[data-card="YELLOW"]').click();
  await expect(frame.locator('.wrongDemo')).toContainText('does not stop SHOOT');
  await expect(frame.locator('.result.bad')).toHaveText('SHOOT STILL ACTIVE');
  await expect(frame.locator('.wrongDemo')).toHaveCount(0, {timeout: 2_000});
  await frame.locator('.cardBtn[data-card="DEFENSE"]').click();
  await expect(frame.locator('#feedback')).toContainText('stopped the attack');

  await openLesson(frame, 9);
  await frame.locator('.cardBtn[data-card="TACKLE"]').click();
  await expect(frame.locator('.result.good').last()).toContainText('SOCCER CARD');

  await openLesson(frame, 10);
  await frame.locator('.cardBtn[data-card="DRIBBLE PAST"]').click();
  await expect(frame.locator('.flowNode.bypassed')).toHaveCount(1);
  await expect(frame.locator('#feedback')).toContainText('bypassed');

  await openLesson(frame, 11);
  await frame.locator('.cardBtn[data-card="DEFENSE"]').first().click();
  await page.waitForTimeout(700);
  await frame.locator('.cardBtn[data-card="YELLOW"]').click();
  await expect(frame.locator('#feedback')).toContainText('full chain');

  await openLesson(frame, 12);
  await expect(frame.locator('.turnSeat.next')).toContainText('GREEN 1');
  await frame.locator('.cardBtn[data-card="YELLOW"]').click();
  await expect(frame.locator('.turnSeat.skipped')).toContainText('GREEN 1');

  await expectNoRuntimeFailures(state.javascriptErrors, state.failedCriticalImages);
});

test('rapid input cannot duplicate token, card, completion, or next action', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  const {frame, javascriptErrors, failedCriticalImages} = await loadTutorial(page);
  await openLesson(frame, 7);
  const shoot = frame.locator('.cardBtn[data-card="SHOOT"]');
  await shoot.evaluate(button => { for (let i = 0; i < 8; i += 1) button.click(); });
  await expect(frame.locator('.flowNode img[alt="SHOOT"]')).toHaveCount(1);
  const target = frame.locator('[data-player="A0"]');
  await target.evaluate(button => { for (let i = 0; i < 8; i += 1) button.click(); });
  await page.waitForTimeout(1_000);
  await expect(frame.locator('[data-player="A0"] .tokens')).toHaveText(/● ● ●/);
  await expect(frame.locator('#contextActions .actionBtn')).toHaveCount(1);
  await expect(frame.locator('#contextActions .actionBtn')).toHaveText('NEXT LESSON');
  await expectNoRuntimeFailures(javascriptErrors, failedCriticalImages);
});

test('final challenge has a complete solvable path to goalkeeper win', async ({page}) => {
  await page.setViewportSize({width: 430, height: 932});
  const {frame, javascriptErrors, failedCriticalImages} = await loadTutorial(page);
  await openLesson(frame, 13);
  await frame.locator('#gkContinue').click();
  await expect(frame.locator('#lessonTitle')).toHaveText('FINAL CHALLENGE');
  await expect(frame.locator('#lessonSub')).toContainText('NO CARD HINTS');
  await frame.locator('.cardBtn[data-card="DEFENSE"]').first().click();
  await page.waitForTimeout(700);
  await frame.locator('.cardBtn[data-card="DEFENSE"]').first().click();
  await page.waitForTimeout(700);
  await frame.locator('.cardBtn[data-card="YELLOW"]').click();
  await page.waitForTimeout(700);
  await frame.locator('.cardBtn[data-card="SHOOT"]').click();
  await page.waitForTimeout(700);
  await frame.locator('[data-player="A1"]').click();
  await expect(frame.locator('#pitchEvent')).toContainText('GOALKEEPER FOUND');
  await expect(frame.locator('.result.good').last()).toHaveText('GREEN TEAM LOSES');
  await expect(frame.locator('[data-player="A1"] .role')).toContainText('GOALKEEPER');
  await expectNoRuntimeFailures(javascriptErrors, failedCriticalImages);
});

const screenshots = [
  {width: 320, height: 700, lesson: 8},
  {width: 390, height: 844, lesson: 11},
  {width: 430, height: 932, lesson: 13},
  {width: 1440, height: 900, lesson: 8},
  {width: 1920, height: 1080, lesson: 13},
];

for (const shot of screenshots) {
  test(`screenshot ${shot.width}px Lesson ${shot.lesson}`, async ({page}) => {
    await page.setViewportSize({width: shot.width, height: shot.height});
    const {frame} = await loadTutorial(page);
    await openLesson(frame, shot.lesson);
    if (shot.lesson === 13) await frame.locator('#gkContinue').click();
    await page.screenshot({path: `test-results/screenshots/${shot.width}px-lesson-${shot.lesson}.png`, fullPage: true});
  });
}
