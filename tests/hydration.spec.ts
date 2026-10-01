import { test, expect } from '@playwright/test';

for (const path of ['/', '/docs']) {
  test(`controls wait for hydration on ${path}`, async ({ page }) => {
    let releaseScripts!: () => void;
    const scriptsReady = new Promise<void>((resolve) => {
      releaseScripts = resolve;
    });
    // Reproduce a fast user on a slow connection: SSR arrives before app JS.
    await page.route('**/_next/**', async (route) => {
      if (route.request().resourceType() === 'script') await scriptsReady;
      await route.continue();
    });
    const input =
      path === '/docs'
        ? page.getByRole('searchbox', { name: 'Search documentation' })
        : page.getByLabel('Let’s find your little friend');
    try {
      await page.goto(path, { waitUntil: 'commit' });
      await expect(input).toBeVisible();
      await expect(input).toBeDisabled();
    } finally {
      releaseScripts();
    }
    await expect(input).toBeEnabled();
    await input.fill(path === '/docs' ? 'nonce' : 'fern');
    if (path === '/docs') {
      const nav = page.getByRole('navigation', { name: 'Documentation sections' });
      await expect(nav.getByRole('link')).toHaveCount(1);
      await expect(nav.getByRole('link', { name: 'Accessibility & embedding' })).toBeVisible();
    } else {
      await expect(page.locator('.hero-avatar svg')).toHaveAccessibleName('Avatar for fern');
    }
  });
}
