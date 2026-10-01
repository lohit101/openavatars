/** Compare SVG image rendering without starting Next or changing production SVGs. */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { arch, release } from 'node:os';
import { chromium, webkit, type BrowserType, type BrowserContext } from '@playwright/test';
import { GET } from '../apps/web/app/api/v1/avatar/route.js';
import { SVG_MOTION_PROBE } from './svg-motion-probe.js';

const browserName =
  process.argv.find((arg) => arg.startsWith('--browser='))?.split('=')[1] ?? 'webkit';
const browserTypes: Record<string, BrowserType> = { chromium, webkit };
if (!browserTypes[browserName]) throw new Error('Use --browser=webkit or --browser=chromium.');
const isolated = process.argv.includes('--isolated');
const output = resolve('artifacts/svg-motion-diagnostic', browserName, isolated ? 'isolated' : '.');

async function main() {
  await mkdir(output, { recursive: true });
  const response = GET(
    new Request(
      'http://openavatars.test/api/v1/avatar?name=motion-test&shape=round&expression=idle',
    ),
  );
  const avatar = await response.text();
  const csp = response.headers.get('Content-Security-Policy')!;
  const still = await GET(
    new Request(
      'http://openavatars.test/api/v1/avatar?name=motion-test&shape=round&expression=idle&animate=false',
    ),
  ).text();
  // Remove only the final media block in this diagnostic variant. Production
  // output and the E2E assertion still respect reduced motion.
  const withoutMedia = avatar.replace(
    /@media\(prefers-reduced-motion:reduce\)\{[^<]*?\}\}\s*(?=<\/style>)/,
    '',
  );
  if (withoutMedia === avatar) throw new Error('Could not locate the avatar reduced-motion block.');
  const svg = (content: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 100 100">${content}</svg>`;
  const mediaProbe = SVG_MOTION_PROBE;
  const fixtures = [
    { id: 'api', label: 'API avatar + response CSP', body: avatar, csp },
    { id: 'no-csp', label: 'Same avatar without CSP', body: avatar },
    { id: 'no-media-csp', label: 'Same avatar without media block + CSP', body: withoutMedia, csp },
    { id: 'no-media', label: 'Same avatar without media block', body: withoutMedia },
    { id: 'static', label: 'API animate=false', body: still, csp },
    {
      id: 'css-fill',
      label: 'Minimal CSS fill animation',
      body: svg(
        '<style>@keyframes color{0%,100%{fill:#00ff00}50%{fill:#0000ff}}rect{animation:color 2s linear infinite}</style><rect width="100" height="100" fill="#ff0000"/>',
      ),
    },
    {
      id: 'css-transform',
      label: 'Minimal CSS transform animation',
      body: svg(
        '<style>@keyframes move{0%,100%{transform:translateX(0)}50%{transform:translateX(40px)}}rect{animation:move 2s linear infinite}</style><rect x="10" y="10" width="30" height="80" fill="#00ff00"/>',
      ),
    },
    {
      id: 'smil',
      label: 'Minimal SVG attribute animation',
      body: svg(
        '<rect x="10" y="10" width="30" height="80" fill="#00ff00"><animate attributeName="x" values="10;50;10" dur="2s" repeatCount="indefinite"/></rect>',
      ),
    },
    { id: 'probe-csp', label: 'Styles / motion probe + CSP', body: mediaProbe, csp },
    { id: 'probe', label: 'Styles / motion probe without CSP', body: mediaProbe },
  ];
  const html = (source: (id: string, body: string) => string) =>
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>SVG motion diagnosis</title><link rel="icon" href="data:,"><style>body{margin:0;background:#0b0c0c;color:white;font:13px monospace}main{display:grid;grid-template-columns:repeat(4,256px);gap:12px;padding:12px}figure{margin:0}figcaption{height:36px}img,.inline svg{display:block;width:256px;height:256px}.inline{width:256px;height:256px}</style></head><body><main>${fixtures.map((f) => `<figure><figcaption>${f.label}</figcaption><img id="${f.id}" alt="${f.label}" width="256" height="256" src="${source(f.id, f.body)}"></figure>`).join('')}<figure><figcaption>Same avatar inline (host timeline)</figcaption><div id="inline" class="inline">${avatar}</div></figure></main></body></html>`;
  await writeFile(
    resolve(output, 'preview.html'),
    html(
      (_id, body) => `data:image/svg+xml;base64,${Buffer.from(body).toString('base64')}`,
    ).replace(
      '<body>',
      '<body><p style="margin:12px">Offline preview: response CSP is not applied to any fixture below.</p>',
    ),
  );
  if (process.argv.includes('--fixtures-only')) {
    console.log(`Fixtures written to ${output}/preview.html. Data URLs do not carry response CSP.`);
    return;
  }
  const browser = await browserTypes[browserName].launch({
    headless: !process.argv.includes('--headful'),
  });
  let context: BrowserContext | undefined;
  let tracing = false;
  try {
    context = await browser.newContext({
      viewport: isolated ? { width: 1280, height: 720 } : { width: 1100, height: 1000 },
      reducedMotion: 'no-preference',
      colorScheme: 'light',
      locale: 'en-US',
      forcedColors: 'none',
      contrast: 'no-preference',
    });
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
    tracing = true;
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.route('http://openavatars.test/**', async (route) => {
      const id = new URL(route.request().url()).pathname.slice(1).replace(/\.svg$/, '');
      const fixture = fixtures.find((f) => f.id === id);
      if (fixture) {
        await route.fulfill({
          contentType: 'image/svg+xml',
          body: fixture.body,
          headers: fixture.csp ? { 'Content-Security-Policy': fixture.csp } : {},
        });
      } else if (id === '') {
        await route.fulfill({
          contentType: 'text/html',
          body: isolated
            ? '<!doctype html><html lang="en"><head><title>Isolated SVG images</title><link rel="icon" href="data:,"></head><body style="background:#0b0c0c"><img id="api" alt="Animated" width="256" height="256" src="/api.svg"><img id="static" alt="Static" width="256" height="256" src="/static.svg"></body></html>'
            : html((id) => `/${id}.svg`),
        });
      } else await route.abort();
    });
    await page.goto('http://openavatars.test/');
    await page.waitForFunction(() =>
      Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0),
    );
    if (isolated) {
      async function sample(label: string) {
        const initial = new Map<string, Buffer>();
        const changes = new Map([
          ['api', false],
          ['static', false],
        ]);
        for (const id of changes.keys()) {
          initial.set(
            id,
            await page.locator(`#${id}`).screenshot({
              animations: 'allow',
              path: resolve(output, `${label}-${id}-first.png`),
            }),
          );
        }
        const started = Date.now();
        for (const elapsed of [200, 600, 1400, 2600, 4200, 6500, 9000, 10000]) {
          await page.waitForTimeout(Math.max(0, elapsed - (Date.now() - started)));
          for (const id of changes.keys()) {
            if (changes.get(id) && id === 'api') continue;
            const frame = await page.locator(`#${id}`).screenshot({
              animations: 'allow',
              path: resolve(output, `${label}-${id}-latest.png`),
            });
            changes.set(id, changes.get(id)! || !frame.equals(initial.get(id)!));
          }
        }
        return Object.fromEntries(changes);
      }
      const alone = await sample('alone');
      // Deliberate diagnostic intervention, outside the avatar capture area.
      // The production SVG and the E2E test do not gain a host animation.
      await page.evaluate(() => {
        const style = document.createElement('style');
        style.textContent =
          '@keyframes diagnostic-clock{0%,100%{background:#ff0000}50%{background:#0000ff}}#diagnostic-clock{position:fixed;right:8px;bottom:8px;width:16px;height:16px;animation:diagnostic-clock 1s linear infinite}';
        document.head.append(style);
        const clock = document.createElement('div');
        clock.id = 'diagnostic-clock';
        document.body.append(clock);
      });
      const withHostAnimation = await sample('host-animation');
      const report = {
        browser: browserName,
        version: browser.version(),
        os: { platform: process.platform, release: release(), arch: arch() },
        executable: browserTypes[browserName].executablePath(),
        headless: !process.argv.includes('--headful'),
        csp,
        alone,
        withHostAnimation,
        errors,
      };
      await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
      console.log(JSON.stringify(report, null, 2));
      console.log(`Artifacts: ${output}`);
      return;
    }
    const ids = [...fixtures.map((f) => f.id), 'inline'];
    const initial = new Map<string, Buffer>();
    const changes = new Map(ids.map((id) => [id, false]));
    for (const id of ids) {
      initial.set(
        id,
        await page
          .locator(`#${id}`)
          .screenshot({ animations: 'allow', path: resolve(output, `${id}-first.png`) }),
      );
    }
    const started = Date.now();
    for (const elapsed of [250, 650, 1250, 2100, 3400, 5500, 8000, 10000]) {
      await page.waitForTimeout(Math.max(0, elapsed - (Date.now() - started)));
      for (const id of ids) {
        if (changes.get(id) && id !== 'static') continue;
        const frame = await page
          .locator(`#${id}`)
          .screenshot({ animations: 'allow', path: resolve(output, `${id}-latest.png`) });
        changes.set(id, changes.get(id)! || !frame.equals(initial.get(id)!));
      }
    }
    const probes = await page.evaluate(() => {
      const pixels: Record<string, number[]> = {};
      const probeErrors: string[] = [];
      // These two probes are static. Canvas reads their computed color, rather
      // than trying to use drawImage as an animated-image frame clock.
      for (const id of ['probe-csp', 'probe']) {
        const image = document.getElementById(id) as HTMLImageElement;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d')!;
        try {
          ctx.drawImage(image, 0, 0, 1, 1);
          pixels[id] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
        } catch (error) {
          probeErrors.push(`${id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      return {
        pixels,
        probeErrors,
        hostReducedMotion: matchMedia('(prefers-reduced-motion:reduce)').matches,
        inlineAnimations: document.querySelector('#inline svg')!.getAnimations({ subtree: true })
          .length,
      };
    });
    const report = {
      browser: browserName,
      version: browser.version(),
      os: { platform: process.platform, release: release(), arch: arch() },
      executable: browserTypes[browserName].executablePath(),
      headless: !process.argv.includes('--headful'),
      csp,
      ...probes,
      changedCaptures: Object.fromEntries(changes),
      errors,
    };
    await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
    console.log(`Artifacts: ${output}`);
    console.log(
      'Probe green = CSS applied / no reduced motion; blue = reduced motion; red = stylesheet did not apply.',
    );
  } finally {
    if (context && tracing) {
      await context.tracing.stop({ path: resolve(output, 'trace.zip') }).catch((error) => {
        console.error('Could not save the diagnostic trace:', error);
      });
    }
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
