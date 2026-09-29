import { test, expect } from '@playwright/test';

test('documentation is reachable and every section has a working anchor', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Open source', exact: true })).toHaveAttribute(
    'href',
    'https://github.com/lohit101/openavatars',
  );
  await page.getByRole('link', { name: 'Documentation', exact: true }).click();
  await expect(page).toHaveURL(/\/docs$/);
  await expect(page).toHaveTitle('Developer documentation — OpenAvatars');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A little character.A few lines of code.',
  );
  const links = await page
    .locator('a[href^="#"]')
    .evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')!.slice(1)));
  for (const id of new Set(links)) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
  await expect(page.locator('[data-doc-section]')).toHaveCount(14);
  await expect(
    page.getByRole('navigation', { name: 'Documentation sections' }).getByRole('link'),
  ).toHaveCount(14);
  expect(errors).toEqual([]);
});

test('documentation search indexes article content and copy buttons work', async ({
  page,
  context,
  browserName,
}) => {
  if (browserName === 'chromium')
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/docs');
  const search = page.getByRole('searchbox', { name: 'Search documentation' });
  const nav = page.getByRole('navigation', { name: 'Documentation sections' });
  await search.fill('nonce');
  await expect(nav.getByRole('link')).toHaveCount(1);
  await expect(nav.getByRole('link', { name: 'Accessibility & embedding' })).toBeVisible();
  await search.fill('zzzz-no-topic');
  await expect(page.getByText('No matching sections.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Clear documentation search' }).click();
  await expect(nav.getByRole('link')).toHaveCount(14);
  await nav.getByRole('link', { name: 'Installation & quickstart' }).click();
  await expect(page).toHaveURL(/#installation$/);
  const example = page.locator('#installation .docs-code-block').first();
  await example.getByRole('button', { name: 'Copy Terminal', exact: true }).click();
  await expect(example.getByRole('status')).toHaveText('Copied!');
  if (browserName === 'chromium')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
      'git clone https://github.com/lohit101/openavatars.git',
    );
});

test('mobile menu, deep links, and responsive documentation stay usable', async ({
  page,
}, testInfo) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/docs');
  await page.screenshot({
    caret: 'initial',
    path: `artifacts/${testInfo.project.name}-docs-desktop.png`,
  });
  await page.goto('/docs#options');
  await expect(page.locator('#options-title')).toBeInViewport();
  await page.screenshot({
    caret: 'initial',
    path: `artifacts/${testInfo.project.name}-docs-reference.png`,
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/docs');
    await expect(
      page.getByRole('button', { name: 'Documentation menu', exact: false }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Documentation menu', exact: false }).click();
    await page
      .getByRole('navigation', { name: 'Documentation sections' })
      .getByRole('link', { name: 'HTTP / SVG API', exact: true })
      .click();
    await expect(page).toHaveURL(/#http-api$/);
    await expect(
      page.getByRole('button', { name: 'Documentation menu', exact: false }),
    ).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#http-api-title')).toBeInViewport();
    await expect(page.locator('.docs-mobile-current')).toHaveText('HTTP / SVG API');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await page.screenshot({
      caret: 'initial',
      path: `artifacts/${testInfo.project.name}-docs-mobile-${width}.png`,
    });
  }
  expect(consoleErrors).toEqual([]);
});
