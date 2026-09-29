# openavatars

Little faces. Big personalities.

Free, open source, animated SVG avatars generated from any username. Ten soft silhouettes, fourteen eye expressions, a pastel palette, and small seeded variations give every name a little character. Use them in apps, dashboards, comment threads, or wherever initials need a friend.

## Run the playground

Requires Node.js 22 or newer and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000, or visit [the developer guide](http://localhost:3000/docs). Type a username, choose a shape or expression, toggle animation, copy an integration snippet, or download the SVG. All live previews are generated locally in your browser.

```sh
npm run build     # Build both packages and the production website
npm start         # Serve the production website and API
```

## Workspace

| Package                                 | Purpose                                                |
| --------------------------------------- | ------------------------------------------------------ |
| `packages/core` · `openavatars`         | Dependency-free SVG generator and deterministic traits |
| `packages/react` · `@openavatars/react` | Typed React component with collision-free instance IDs |
| `apps/web`                              | Next.js playground and public SVG endpoint             |

The package names are provisional and **not published on npm**. Imports below work in this workspace. To use the packages in another project before publication, build them and create local tarballs with `npm pack -w openavatars` and `npm pack -w @openavatars/react`; install both tarballs together in the destination project. The library is ESM and the React adapter supports React 18+.

## React

```tsx
import { OpenAvatar } from '@openavatars/react';

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

## Verify

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

Unit tests cover stable identities, Unicode normalization, overrides, serialization, React IDs, and the API contract. Browser tests cover controls, downloads, mobile layouts, reduced motion, eyelid animation, and standalone image animation in Chromium and WebKit. They generate desktop/mobile screenshots and a 140-combination contact sheet in `artifacts/` for visual review. CI runs the same checks.

## Deploy on Vercel

1. Push this repository to your own Git provider and import it into Vercel.
2. Set **Root Directory** to `apps/web` and enable inclusion of source files outside that root directory.
3. Use the Next.js framework preset. The checked-in `apps/web/vercel.json` installs and builds from the workspace root.
4. Deploy. The playground and `/api/v1/avatar` will share the assigned hostname. No environment variables are required.

The endpoint is ready for hosting, but this source checkout does not create a deployment or publish packages. For a high-traffic deployment, configure Vercel’s traffic controls and monitor function usage within your hosting plan.

## License

MIT. Free for personal and commercial projects, including generated avatars. Contributions are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).
