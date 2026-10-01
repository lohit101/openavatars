# openavatars

Little faces. Big personalities.

Free, open source, animated SVG avatars generated from any username. Ten soft silhouettes, fourteen eye expressions, a pastel palette, and small seeded variations give every name a little character. Use them in apps, dashboards, comment threads, or wherever initials need a friend.

[View on npm](https://www.npmjs.com/package/openavatars) · [Changelog](CHANGELOG.md) · [Release guide](RELEASING.md)

## Install

```sh
npm install openavatars
```

One package includes JavaScript, TypeScript, CommonJS, and React integrations. The generator has **zero runtime dependencies**. React 18 or 19 is an optional peer dependency, required only when importing `openavatars/react`. No CSS imports, API keys, or hosting are needed.

```sh
# Other package managers
pnpm add openavatars
yarn add openavatars
bun add openavatars
```

## Upgrade an application

Read the [changelog](CHANGELOG.md), then run this in your application directory:

```sh
npm install openavatars@latest
```

Review the generated avatars and your integration before committing the application lockfile. Use `npm install --save-exact openavatars@X.Y.Z` with a tested version when appearance stability matters. The npm package version and the returned algorithm `version: 1` are separate; compatible releases preserve v1 identities. A website deployment does not update the version installed in your app.

## React

```tsx
import { OpenAvatar } from 'openavatars/react';

<OpenAvatar name="jamie" size={128} />

// Keep the assigned expression in a stable resting pose.
<OpenAvatar name="jamie" animate={false} />

// Override only the traits you want to change.
<OpenAvatar
  name="jamie"
  shape="cloud"
  expression="wink"
  color="#A4DFFD"
  label="Jamie’s profile"
/>
```

Avatars include a descriptive SVG title. Pass `decorative` when nearby text already identifies the person. `className` and `style` apply to the wrapping span. The adapter supports server rendering and uses React `useId` for distinct SVG IDs.

## JavaScript

```ts
import { generateAvatar, renderAvatarSvg } from 'openavatars';

const traits = generateAvatar('jamie');
const svg = renderAvatarSvg('jamie', { size: 256, animate: true });
```

`generateAvatar` returns the normalized name, algorithm version, seed, resolved shape/expression/color, dimensions, animation setting, and geometry variations. `renderAvatarSvg` returns a complete standalone SVG with transparent background. No fonts, images, scripts, runtime dependencies, or external stylesheets are required by the SVG.

When inserting more than one SVG string directly into the same document, supply a unique `idPrefix` for **each instance**, even for repeated names. Prefixes must begin with a letter and contain only letters, digits, underscores, and hyphens. The React adapter handles this automatically. Separate `<img>` elements do not share ID namespaces.

```ts
const svg = renderAvatarSvg('jamie', {
  idPrefix: 'team-member-1',
  title: 'Jamie’s profile',
  animate: false,
});
```

## CommonJS

```js
const { renderAvatarSvg } = require('openavatars');
const svg = renderAvatarSvg('jamie', { animate: false });
```

Both entry points include ESM and CommonJS JavaScript with matching TypeScript declarations. Use `moduleResolution: "Bundler"` in bundler projects, or `"NodeNext"` with NodeNext modules for Node.js. React TypeScript applications should include the matching `@types/react` and `@types/react-dom` packages.

## Options

| Option       | Default   | Accepted values                                                                                                             |
| ------------ | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `name`       | Required  | Nonempty string, up to 256 Unicode code points                                                                              |
| `size`       | `128`     | Integer from 16 to 1024                                                                                                     |
| `animate`    | `true`    | Boolean                                                                                                                     |
| `shape`      | Generated | `round`, `organic`, `boxy`, `capsule`, `nub`, `cloud`, `droplet`, `hexagon`, `sun`, `triangle`                              |
| `expression` | Generated | `idle`, `happy`, `sad`, `mad`, `surprised`, `wink`, `sleepy`, `smug`, `unsure`, `scared`, `love`, `shy`, `sick`, `thinking` |
| `color`      | Generated | Six-digit hex, e.g. `#A4DFFD`                                                                                               |

Invalid names or options throw `AvatarValidationError`. `SHAPES`, `EXPRESSIONS`, `PALETTE`, and all public TypeScript types are exported from `openavatars`.

Names are Unicode NFC-normalized and trimmed. They remain case-sensitive: `Jamie` and `jamie` are different seeds. An override does not change unrelated generated traits. Usernames with the same normalized spelling produce the same avatar; different usernames may have similar or identical appearances. This is a deterministic identity generator, not a guaranteed unique allocation system.

## SVG API

```text
GET /api/v1/avatar?name=jamie
GET /api/v1/avatar?name=jamie&size=64&animate=false
GET /api/v1/avatar?name=jamie&shape=cloud&expression=happy&color=%23A4DFFD
```

Use the website’s hostname when embedding avatars elsewhere. Query values should be encoded with `URLSearchParams`:

```ts
const query = new URLSearchParams({ name: 'Jamie & friends', color: '#A4DFFD' });
const src = `/api/v1/avatar?${query}`;
```

Success returns `image/svg+xml; charset=utf-8`. The endpoint supports GET, HEAD, OPTIONS, public CORS, ETags, and conditional requests. Responses are cached for one day in browsers and seven days at the CDN, with one day of stale-while-revalidate. Missing, duplicate, unknown, or invalid parameters return HTTP 400 JSON with an `error` message and `Cache-Control: no-store`. There is no database or authentication.

The `/v1/` endpoint and v1 generation algorithm must retain their existing appearance mapping in compatible releases. Future algorithm changes should use a new endpoint and explicit migration guidance.

## Animation

Self-contained CSS in each SVG animates eyelid clipping, subtle breathing, small gaze shifts, and a gentle squash/rebound synchronized with blinks. Seeded 48–56 second timelines space blinks irregularly, typically 3–7 seconds apart, with occasional double blinks. The long timeline repeats; this is deliberate, deterministic variation rather than live random scheduling.

`animate: false` removes animation styles completely and retains the assigned expression at rest. `prefers-reduced-motion: reduce` also restores resting transforms. Browsers can animate the SVG both inline and through `<img>`. Static image processors and non-browser viewers may show only the resting frame; use `animate: false` for predictable static exports.

## Run the playground

Contributing or self-hosting requires Node.js 22 or newer. Package users do not need to clone this repository or install Next.js.

```sh
git clone https://github.com/lohit101/openavatars.git
cd openavatars
npm ci
npm run dev
```

Open http://localhost:3000 or the [developer guide](http://localhost:3000/docs). The playground shows copyable installation commands and examples for React, JavaScript, and image URLs.

```sh
npm run build
npm start
```

## Repository

| Location         | Purpose                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `packages/core`  | Published `openavatars` package; pure generator and optional `openavatars/react` component |
| `packages/react` | Private compatibility shim for earlier workspace imports                                   |
| `apps/web`       | Playground, documentation, and self-hosted SVG endpoint                                    |
| `scripts`        | Build, package, consumer verification, and release tools                                   |

## Verify

On macOS, run the complete local check set below. On Linux, use the Chromium commands in [CONTRIBUTING.md](CONTRIBUTING.md) and review the macOS WebKit CI job for Safari coverage.

```sh
npm run check
npm run test:package
npx playwright install chromium webkit
npm run test:e2e
```

`npm run check` runs lint, TypeScript, unit tests, and the production build. The package check packs the real npm archive and installs it into isolated JavaScript, CommonJS, TypeScript, React 18, and React 19 consumers. Unit tests cover stable identities, Unicode normalization, overrides, serialization, React IDs, and the API contract. Browser tests cover controls, downloads, mobile layouts, hydration, reduced motion, eyelid animation, and standalone image animation in Chromium and WebKit. They generate desktop/mobile screenshots and a 140-combination contact sheet in `artifacts/` for visual review. CI runs the full Chromium suite on Ubuntu 24.04 and the full WebKit suite on macOS 15 for Safari coverage. Both jobs must pass, including the image animation assertions. See [CONTRIBUTING.md](CONTRIBUTING.md) for platform-specific commands and failure trace inspection.

## Deploy on Vercel

1. Push this repository to your own Git provider and import it into Vercel.
2. Set **Root Directory** to `apps/web` and enable inclusion of source files outside that root directory.
3. Use the Next.js framework preset. The checked-in `apps/web/vercel.json` installs and builds from the workspace root.
4. Deploy. The playground and `/api/v1/avatar` will share the assigned hostname. No environment variables are required.

The endpoint is ready for hosting, but this source checkout does not create a deployment or publish packages. For a high-traffic deployment, configure Vercel’s traffic controls and monitor function usage within your hosting plan.

## Package releases

```sh
npm run pack:package    # Build and inspect the versioned archive in artifacts/npm
npm run release:check   # App checks and isolated archive consumers
```

`release:check` and `release:publish` do not run E2E tests. Review both browser CI jobs for the release commit before publishing. Ordinary pushes and tags run checks; npm publication requires the deliberate CLI command or manual publishing workflow.

The public version comes from `packages/core/package.json`. Align the website and compatibility adapter's `openavatars` dependencies and the lockfile when changing it. Website version labels and archive examples read that manifest automatically. Keep release notes in [CHANGELOG.md](CHANGELOG.md), and follow [RELEASING.md](RELEASING.md) for the complete commit, tag, publication, and verification sequence. The website and compatibility adapter are private npm workspaces. Website deployments and npm releases are separate actions.

## License

MIT. Free for personal and commercial projects, including generated avatars. Contributions are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).
