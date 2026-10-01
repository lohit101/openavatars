# Changelog

This file records package releases and relevant repository maintenance. **Unreleased** entries do not indicate a published npm version. See [RELEASING.md](RELEASING.md) for the release checklist.

## Unreleased

### Website, testing, and documentation

- Added a contributor roadmap for personality and reactions, portable characters, exports, new collections, and the path to 1.0, with identity compatibility rules and maintenance criteria.
- Playground and documentation controls wait for hydration before accepting input.
- Hydration regression tests cover the playground and documentation. Standalone SVG image tests use an isolated page and wait for visible animation.
- CI tests the production build, running the full Chromium suite on Ubuntu 24.04 and the full WebKit suite on macOS 15. Each browser job uploads separate review artifacts.
- A standalone SVG rendering diagnostic compares response CSP, embedded reduced-motion preferences, CSS/SVG animation, and inline rendering without changing the production generator or browser assertions.
- WebKit CI disables GitHub's native Reduce Motion default before browser launch. The image E2E test records its environment and checks the embedded SVG's motion preference before asserting animation; production reduced-motion behavior is preserved.
- Maintenance documentation explains platform reproduction, release gates, version updates, manual npm publication, and verification of published packages.
- The website includes a releases and maintenance section, upgrade guidance, and version labels and archive examples that read the package manifest.

### Package documentation

- The source package README adds changelog links and upgrade guidance for tested, pinned versions. This README reaches npm consumers with the next package release.

These changes have not created a new npm release.

## 0.1.0 — 2026-09-29

### Initial npm release

- Published a single `openavatars` package with a dependency-free SVG generator and optional `openavatars/react` component.
- Added ESM and CommonJS exports with matching TypeScript declarations, React 18/19 support, and the Next.js client boundary.
- Included deterministic v1 identities, ten shapes, fourteen eye expressions, a pastel palette, configurable traits, seeded animation, static output, and reduced-motion support.
- Added isolated archive verification for JavaScript, CommonJS, TypeScript, and React consumers.

[View this release on npm](https://www.npmjs.com/package/openavatars/v/0.1.0).
