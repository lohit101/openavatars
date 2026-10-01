# Contributing

Use Node.js 22+ and the checked-in npm lockfile:

```sh
npm ci
npm run dev
```

The public npm package is `openavatars` in `packages/core`. Its root generator stays independent of browsers, React, external assets, and runtime dependencies. The optional component lives at `openavatars/react`. `packages/react` is a private compatibility adapter for earlier workspace imports; do not publish it separately.

## Choose and coordinate work

The [roadmap](ROADMAP.md) describes upcoming milestones, their completion criteria, and approachable starting tasks. Its version targets are tentative; supported features live in the [README](README.md), and shipped changes live in the [changelog](CHANGELOG.md).

Search [existing issues](https://github.com/lohit101/openavatars/issues) before starting substantial work. Propose or claim a task in an issue with its use case, scope, completion criteria, and impact on existing identities or APIs. Discuss substantial API, recipe-format, and identity changes with a maintainer before implementation. Include a reproduction for bugs or small-size screenshots for visual proposals. Focused fixes and documentation corrections can go straight to a pull request.

Good first contributions include reproduction examples, framework recipes, small-size visual reviews, documentation improvements, and reproducible benchmarks. When an accepted roadmap task starts or ships, update its status and link the tracking issue, pull request, or release. Review priorities at each release.

## Preserve identities and visual behavior

Keep the v1 name-to-trait algorithm stable. Changes to hashing, random-value order, normalization, trait lists, shape geometry, or expression geometry can change existing identities. Add regression coverage for relevant fixes. Intentional identity changes need explicit algorithm versioning and migration guidance; the npm package version and the `/api/v1/avatar` route are separate contracts.

New shapes should be smooth, legible at 24 pixels, safely contain every expression, and leave enough viewBox padding for animated motion. Avatars only have eyes; preserve the minimal character language. Review the contact sheet and desktop/mobile screenshots under `artifacts/`, especially eyelid closure, motion-off resting poses, transparent backgrounds, small sizes, and reduced-motion behavior. Include screenshots with visual changes.

## Check a change

Run the application and package checks before submitting:

```sh
npm run check
npm run test:package
```

`check` runs lint, type checking, unit tests, and the production build. `test:package` packs the actual public archive and installs it into isolated JavaScript, CommonJS, TypeScript, React 18, and React 19 consumers. `npm run pack:package` also saves an archive and its contents manifest in `artifacts/npm` for inspection.

For everyday browser testing, install the browser you need and run its project. Playwright starts the development server locally, or reuses an existing server on port 3000:

```sh
npx playwright install chromium
npm run test:e2e -- --project=chromium
```

On macOS, install `webkit` and run `--project=webkit` for Safari coverage. To run both projects on macOS, install `chromium webkit` and run `npm run test:e2e`. Keep the full tests enabled, including SVG animation inside `<img>`.

## Reproduce GitHub Actions

CI runs the complete Chromium suite on Ubuntu 24.04 (`check`) and the complete WebKit suite on macOS 15 (`webkit`). Both jobs must pass before a package release. WebKit on macOS is the project's Safari gate, following [Playwright's WebKit platform guidance](https://playwright.dev/docs/browsers#webkit). A browser-specific failure needs a reproduction; changing the operating system does not establish or fix its cause.

CI tests the production build. With `CI=true`, Playwright starts the production server and requires a prior build; `test:e2e` alone only rebuilds the package workspaces.

GitHub's [macOS runner setup](https://raw.githubusercontent.com/actions/runner-images/main/images/macos/scripts/build/configure-system.sh) enables native Reduce Motion. The WebKit job disables that preference on its temporary runner before launching browsers and verifies the value. Embedded SVG images use an internal document that can read the native preference instead of Playwright's host-page media override. The image E2E test checks the embedded preference with a static color probe before asserting visible motion. Production avatars still honor reduced motion, and the separate reduced-motion test remains enabled. A local run with native Reduce Motion enabled can therefore stop at the environment assertion; use a disposable test environment with native Reduce Motion off when testing animation rather than changing the generator's accessibility behavior.

```sh
# Ubuntu: match the Chromium browser job
npm ci
npm run check
npm run test:package
npx playwright install --with-deps chromium
CI=true npm run test:e2e -- --project=chromium
```

```sh
# macOS: match the WebKit browser job
npm ci
npm run build
npx playwright install webkit
CI=true npm run test:e2e -- --project=webkit
```

Download the matching `visual-review-chromium` or `visual-review-webkit` Actions artifact when a test fails. Each job uploads its screenshots and available failure traces. Open a downloaded trace with `npx playwright show-trace /path/to/trace.zip`; use the failing assertion and screenshot to distinguish a behavior regression from a platform or timing issue. Browser failures remain release blockers.

For an SVG image animation failure, run `npm run diagnose:svg -- --browser=webkit` (or `--browser=chromium`). This comparison uses the real API handler's SVG and CSP, identical SVGs without CSP and without the reduced-motion block, minimal CSS and SVG attribute animations, static output, and an inline avatar. It needs no Next server. The JSON report, screenshots, and trace are saved under `artifacts/svg-motion-diagnostic/<browser>/`. Static color probes check whether CSS applies and whether the embedded image sees reduced motion; the host's emulated media setting alone does not prove the embedded SVG uses it. Diagnostic variants do not change the production generator or the E2E assertions. Add `--headful` to compare a visible browser, or `--fixtures-only` to write a local HTML preview without launching one; the preview's data URLs cannot reproduce response CSP.

Also run `npm run diagnose:svg -- --browser=webkit --isolated` when the comparison page animates but the E2E image pair freezes. This mode first samples just the animated/static image pair, then adds a visible host CSS animation on the same page and samples again. Its separate report and trace are saved under `artifacts/svg-motion-diagnostic/webkit/isolated/`. The comparison page contains other animations and cannot by itself prove that an embedded avatar schedules rendering independently. Neither mode replaces the real API E2E gate.

## Keep documentation and releases aligned

Update usage examples when APIs change, and record package changes under **Unreleased** in [CHANGELOG.md](CHANGELOG.md). Website, testing, and repository-only changes should be identified as such. Generated `dist`, `.next`, archives, and review artifacts remain ignored.

Pushing commits or tags runs CI but does not publish a new npm version. Repository documentation and CI updates can ship without a package release when the published archive is unchanged. Changes to `packages/core/README.md` reach npm users only through a new package version.

Follow [RELEASING.md](RELEASING.md) for version updates, the lockfile, CI gates, tagging, publication, and registry verification. It is the authoritative release checklist. See the [README](README.md) for public installation and API usage.
