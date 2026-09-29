# Contributing

Install Node.js 22+, run `npm install`, then `npm run dev`.

Keep the v1 name-to-trait algorithm stable. Changes to hashing, random-number order, normalization, shape geometry, or expression geometry can change existing identities. Treat intentional appearance changes as a versioned API change and document migration behavior.

Keep the core independent of browsers, React, external assets, and runtime dependencies. New shapes should be smooth, legible at 24 pixels, safely contain every expression, and leave enough viewBox padding for animated motion. Avatars only have eyes; preserve the minimal character language.

Before submitting a change:

```sh
npm run check
npx playwright install chromium webkit
npm run test:e2e
```

Review the generated contact sheet and desktop/mobile screenshots under `artifacts/`. Pay particular attention to eyelid closure, motion-off resting poses, transparent backgrounds, readable small sizes, and reduced-motion behavior. Include screenshots with visual changes.

The provisional `openavatars` and `@openavatars/react` package names have not been published. Package publication requires registry access and verification of names at release time. Build and smoke-test local tarballs before publishing.
