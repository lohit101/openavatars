# Contributing

Install Node.js 22+, run `npm install`, then `npm run dev`.

Keep the v1 name-to-trait algorithm stable. Changes to hashing, random-number order, normalization, shape geometry, or expression geometry can change existing identities. Treat intentional appearance changes as a versioned API change and document migration behavior.

Keep the core independent of browsers, React, external assets, and runtime dependencies. New shapes should be smooth, legible at 24 pixels, safely contain every expression, and leave enough viewBox padding for animated motion. Avatars only have eyes; preserve the minimal character language.

Before submitting a change:

```sh
npm run check
npm run test:package
npx playwright install chromium webkit
npm run test:e2e
```

Review the generated contact sheet and desktop/mobile screenshots under `artifacts/`. Pay particular attention to eyelid closure, motion-off resting poses, transparent backgrounds, readable small sizes, and reduced-motion behavior. Include screenshots with visual changes.

The public package is `openavatars`. Its root entry stays independent of React; the optional component lives at `openavatars/react`. The old `@openavatars/react` directory is a private workspace compatibility adapter. Do not publish it separately.

`npm run pack:package` rebuilds the package and writes its archive and contents manifest to `artifacts/npm`. `npm run test:package` verifies the archive in isolated consumer projects. See [RELEASING.md](RELEASING.md) before publishing a release.
