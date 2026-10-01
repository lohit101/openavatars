# Contributing

Use Node.js 22+ and the checked-in npm lockfile:

```sh
npm ci
npm run dev
```

The public npm package is `openavatars` in `packages/core`. Its root generator stays independent of browsers, React, external assets, and runtime dependencies. The optional component lives at `openavatars/react`. `packages/react` is a private compatibility adapter for earlier workspace imports; do not publish it separately.

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

CI runs the complete Chromium suite on Ubuntu 24.04 (`check`) and the complete WebKit suite on macOS 15 (`webkit`). Both jobs must pass before a package release. WebKit on macOS is the project's Safari gate; Linux's WebKit image renderer can differ from native macOS behavior. See [Playwright's WebKit platform guidance](https://playwright.dev/docs/browsers#webkit).

CI tests the production build. With `CI=true`, Playwright starts the production server and requires a prior build; `test:e2e` alone only rebuilds the package workspaces.

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

## Keep documentation and releases aligned

Update usage examples when APIs change, and record package changes under **Unreleased** in [CHANGELOG.md](CHANGELOG.md). Website, testing, and repository-only changes should be identified as such. Generated `dist`, `.next`, archives, and review artifacts remain ignored.

Pushing commits or tags runs CI but does not publish a new npm version. Repository documentation and CI updates can ship without a package release when the published archive is unchanged. Changes to `packages/core/README.md` reach npm users only through a new package version.

Follow [RELEASING.md](RELEASING.md) for version updates, the lockfile, CI gates, tagging, publication, and registry verification. It is the authoritative release checklist. See the [README](README.md) for public installation and API usage.
