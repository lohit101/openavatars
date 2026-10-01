# openavatars

**Little faces. Big personalities.**

Free, open source, animated SVG avatars for apps, dashboards, comments, and profile pictures. Ten soft shapes, fourteen expressive eye styles, twelve pastel colors, and a stable character generated from any username.

## Install

```sh
npm install openavatars
```

Or `pnpm add openavatars`, `yarn add openavatars`, or `bun add openavatars`.

One package. Zero runtime dependencies for the generator. React 18 or 19 is an optional peer dependency, needed only for the React component. There is no CSS file, network request, API key, or account requirement.

## React / Next.js

```tsx
import { OpenAvatar } from 'openavatars/react';

export function Profile() {
  return <OpenAvatar name="jamie" size={48} />;
}
```

```tsx
<OpenAvatar
  name="jamie"
  size={64}
  shape="cloud"
  expression="wink"
  color="#A4DFFD"
  animate={false}
  label="Jamie’s profile"
/>
```

Only `name` is required. Add `decorative` when nearby text already identifies the user. `className` and `style` apply to the wrapping span. SVG IDs are unique per component instance through React `useId`; server rendering and hydration are supported. The built React entry preserves its `use client` boundary for Next.js App Router consumers.

Use your application's existing React installation. New React apps need `react` and `react-dom`; TypeScript React apps also need matching `@types/react` and `@types/react-dom` development dependencies. Install **openavatars**, not `openavatars/react`—the latter is an import path.

## JavaScript / TypeScript

```ts
import { generateAvatar, renderAvatarSvg } from 'openavatars';

const traits = generateAvatar('jamie');
const svg = renderAvatarSvg('jamie', {
  size: 128,
  animate: false,
  title: 'Jamie’s profile',
  idPrefix: 'profile-jamie',
});
```

The generator works in browsers, Node.js, workers, and other frameworks. `renderAvatarSvg` returns a complete SVG string with a transparent background. Display it through a Blob URL or inline SVG; provide a unique `idPrefix` for **each inline instance**. The React component handles IDs automatically.

```js
const { renderAvatarSvg } = require('openavatars');
const svg = renderAvatarSvg('jamie', { animate: false });
```

Both `openavatars` and `openavatars/react` support ESM and CommonJS, with matching TypeScript declarations. Use TypeScript `moduleResolution: "Bundler"`, or `module: "NodeNext"` with `moduleResolution: "NodeNext"`.

## Options

| Option       | Default   | Values                                                                                                                      |
| ------------ | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `name`       | Required  | Nonempty string, at most 256 Unicode code points                                                                            |
| `size`       | `128`     | Integer from 16 to 1024                                                                                                     |
| `animate`    | `true`    | `false` removes animation styles and restores a resting pose                                                                |
| `shape`      | Generated | `round`, `organic`, `boxy`, `capsule`, `nub`, `cloud`, `droplet`, `hexagon`, `sun`, `triangle`                              |
| `expression` | Generated | `idle`, `happy`, `sad`, `mad`, `surprised`, `wink`, `sleepy`, `smug`, `unsure`, `scared`, `love`, `shy`, `sick`, `thinking` |
| `color`      | Generated | Six-digit hex color, e.g. `#A4DFFD`                                                                                         |

The React component also accepts `label`, `decorative`, `className`, and `style`. Raw SVG rendering additionally accepts `title` and `idPrefix`.

Animations include irregular seeded blinks, subtle breathing, gaze shifts, and a small body movement around each blink. Animated SVG respects `prefers-reduced-motion`. Static renderers may show the resting frame; use `animate: false` when a stable export is required.

## Deterministic identities

Names are trimmed and Unicode NFC-normalized, and remain case-sensitive. The same normalized name, version, and options give the same appearance. Override one trait without changing the others. Different names may still have similar or identical appearances; this is not a unique-ID allocation service.

Use a stable user ID as `name` if the avatar should survive display-name changes, and supply a separate accessible label.

## Exports

- `generateAvatar`, `renderAvatarSvg`, `normalizeName`, `AvatarValidationError`
- `SHAPES`, `EXPRESSIONS`, `PALETTE`
- Types: `AvatarOptions`, `SvgOptions`, `AvatarTraits`, `Shape`, `Expression`
- From `openavatars/react`: `OpenAvatar`, `OpenAvatarProps`, `AvatarOptions`, `Shape`, `Expression`

Invalid input throws `AvatarValidationError`. Inline SVG prefixes must start with a letter and contain only letters, digits, underscores, or hyphens.

## Documentation and source

[Repository and full guide](https://github.com/lohit101/openavatars#readme) · [Changelog](https://github.com/lohit101/openavatars/blob/main/CHANGELOG.md) · [Issues](https://github.com/lohit101/openavatars/issues)

The repository includes a playground and a full `/docs` page, plus an optional self-hosted SVG HTTP endpoint. Installing this package does not require the website or its server.

## Upgrade and maintenance

Review the [changelog](https://github.com/lohit101/openavatars/blob/main/CHANGELOG.md), then run `npm install openavatars@latest` in your application. Test the integration and commit your application's lockfile. Pin a tested version with `npm install --save-exact openavatars@X.Y.Z` when appearance stability matters; replace `X.Y.Z` with the release you reviewed.

The npm package version is separate from the avatar algorithm's `version: 1`. Compatible releases preserve the same v1 identity mapping. Continue using stable seed names when upgrading.

Contributors can follow the [contribution guide](https://github.com/lohit101/openavatars/blob/main/CONTRIBUTING.md) and [release guide](https://github.com/lohit101/openavatars/blob/main/RELEASING.md). GitHub pushes run checks. npm publication is a deliberate maintainer action; it does not happen automatically on push. Website docs and deployments are maintained separately from the immutable README in each published package archive.

## License

MIT. Free for personal and commercial projects, including generated avatars.
