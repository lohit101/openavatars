import { test, expect } from '@playwright/test';
import {
  generateAvatar,
  renderAvatarSvg,
  SHAPES,
  EXPRESSIONS,
  PALETTE,
} from '../packages/core/src/index';

test('typing, overrides, reset, motion, and downloads work together', async ({
  page,
  context,
  browserName,
}) => {
  if (browserName === 'chromium')
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByLabel('Let’s find your little friend').fill('fern');
  const avatar = page.locator('.hero-avatar svg');
  await expect(avatar).toHaveAccessibleName('Avatar for fern');
  await page.getByRole('button', { name: 'Copy code', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
  const basePath = await avatar.locator('.oa-bounce>path').getAttribute('d');
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
  await page.getByRole('combobox', { name: 'Shape', exact: true }).selectOption('triangle');
  await page.getByRole('combobox', { name: 'Expression', exact: true }).selectOption('wink');
  expect(await avatar.locator('.oa-bounce>path').getAttribute('d')).not.toEqual(basePath);
  await expect(page.locator('#integration-code')).toContainText('shape="triangle"');
  await page.getByRole('switch', { name: 'Animation' }).click();
  await expect(avatar.locator('style')).toHaveCount(0);
  await expect(page.locator('#integration-code')).toContainText('animate={false}');
  await page.getByRole('button', { name: 'Reset to your username' }).click();
  await expect(avatar.locator('.oa-bounce>path')).toHaveAttribute('d', basePath!);
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download SVG', exact: true }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('openavatar-fern.svg');
  await page.getByRole('tab', { name: 'Image URL' }).click();
  await expect(page.locator('#integration-code')).toContainText('/api/v1/avatar?name=fern');
  await page.getByLabel('Let’s find your little friend').fill('');
  await expect(avatar).toHaveAccessibleName('Avatar for someone');
  await expect(page.locator('.avatar-caption')).toContainText('Sample avatar');
  expect(errors).toEqual([]);
});

test('gallery choices and sample usernames apply to the playground', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Use cloud shape' }).click();
  await expect(page.getByRole('combobox', { name: 'Shape', exact: true })).toHaveValue('cloud');
  await page.getByRole('button', { name: 'Expressions 14' }).click();
  await page.getByRole('button', { name: 'Use love expression' }).click();
  await expect(page.getByRole('combobox', { name: 'Expression', exact: true })).toHaveValue('love');
  await page.getByRole('button', { name: "Try yuki's avatar" }).click();
  await expect(page.getByLabel('Let’s find your little friend')).toHaveValue('yuki');
  await expect(page.getByRole('combobox', { name: 'Shape', exact: true })).toHaveValue('');
});

test('reduced motion yields the resting expression and no active animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByText('Your reduced-motion preference keeps avatars still.')).toBeVisible();
  expect(
    await page
      .locator('.hero-avatar svg')
      .evaluate((svg) => svg.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await expect(page.getByRole('switch', { name: 'Animation' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
});

test('desktop and mobile have no horizontal overflow and produce review screenshots', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [label, width, height] of [
    ['desktop', 1440, 1000],
    ['laptop', 1280, 800],
    ['mobile', 390, 844],
    ['small-mobile', 320, 740],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'openavatars.' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await page.screenshot({
      path: `artifacts/${testInfo.project.name}-${label}.png`,
      fullPage: true,
    });
  }
});

test('eyelids actually close and disabling animation restores the face', async ({ page }) => {
  await page.setContent(
    renderAvatarSvg('blink-test', {
      shape: 'round',
      expression: 'idle',
      idPrefix: 'blink',
      size: 256,
    }),
  );
  const before = await page.locator('svg').screenshot();
  const closedScale = await page.locator('svg').evaluate((svg) => {
    const animations = svg.getAnimations({ subtree: true });
    for (const animation of animations) animation.pause();
    const blink = animations.find((animation) =>
      (animation as CSSAnimation).animationName.endsWith('-blink'),
    )!;
    const frames = (blink.effect as KeyframeEffect).getKeyframes();
    const closed = frames.find((frame) => String(frame.transform).includes('0.035'))!;
    const duration = Number(blink.effect!.getTiming().duration);
    for (const animation of animations) {
      if ((animation as CSSAnimation).animationName.endsWith('-blink'))
        animation.currentTime =
          Number(animation.effect!.getTiming().delay) + duration * (1 + closed.computedOffset);
    }
    return getComputedStyle(svg.querySelector('.oa-lid')!).transform;
  });
  expect(closedScale).toContain('0.035');
  expect((await page.locator('svg').screenshot()).equals(before)).toBe(false);
  await page.setContent(
    renderAvatarSvg('blink-test', {
      shape: 'round',
      expression: 'idle',
      idPrefix: 'blink',
      size: 256,
      animate: false,
    }),
  );
  expect(
    await page.locator('svg').evaluate((svg) => svg.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await expect(page.locator('.oa-lid').first()).toHaveCSS('transform', 'none');
});

test('API SVG animates inside an image and static output stays still', async ({ page }) => {
  await page.goto('/');
  await page.setContent(
    '<body style="background:#0b0c0c"><img alt="Animated" width="256" height="256" src="/api/v1/avatar?name=motion-test&shape=round&expression=idle"><img alt="Static" width="256" height="256" src="/api/v1/avatar?name=motion-test&shape=round&expression=idle&animate=false"></body>',
  );
  const animated = page.getByAltText('Animated'),
    still = page.getByAltText('Static');
  await expect(animated).toBeVisible();
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete && img.naturalWidth > 0),
  );
  const first = await animated.screenshot();
  const stillFirst = await still.screenshot();
  await page.waitForTimeout(700);
  expect((await animated.screenshot()).equals(first)).toBe(false);
  expect((await still.screenshot()).equals(stillFirst)).toBe(true);
});

test('all shapes and expressions render valid SVG and create a visual contact sheet', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1420, height: 1100 });
  const cells = EXPRESSIONS.flatMap((expression) =>
    SHAPES.map(
      (shape, i) =>
        `<div>${renderAvatarSvg('contact-sheet', { shape, expression, color: PALETTE[i], size: 104, animate: false, idPrefix: `cell-${shape}-${expression}` })}<small>${shape} · ${expression}</small></div>`,
    ),
  );
  await page.setContent(
    `<html><body style="margin:0;padding:20px;background:#0b0c0c;color:#a9b09f;font:10px monospace"><main style="display:grid;grid-template-columns:repeat(10,1fr);gap:8px">${cells.join('')}</main><style>main>div{display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:10px}small{font-size:9px}</style></body></html>`,
  );
  await expect(page.locator('svg')).toHaveCount(140);
  expect(
    await page.evaluate(() =>
      [...document.querySelectorAll('svg')].every(
        (svg) => svg.querySelector('path')!.getBoundingClientRect().width > 0,
      ),
    ),
  ).toBe(true);
  await page.screenshot({
    path: `artifacts/${testInfo.project.name}-contact-sheet.png`,
    fullPage: true,
  });
  for (const shape of SHAPES) expect(generateAvatar('matrix', { shape }).shape).toBe(shape);
});
