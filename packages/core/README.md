# openavatars

Dependency-free, deterministic, animated SVG avatars. MIT licensed.

```ts
import { generateAvatar, renderAvatarSvg } from 'openavatars';

const traits = generateAvatar('jamie');
const svg = renderAvatarSvg('jamie', {
  size: 128,
  shape: 'cloud',
  expression: 'happy',
  animate: true,
});
```

The same normalized username always produces the same traits. Optional `shape`, `expression`, and six-digit hex `color` overrides leave other traits unchanged. Sizes range from 16 to 1024. Set `animate: false` for a resting pose; reduced-motion preferences are respected by the animated SVG.

Exports include `SHAPES`, `EXPRESSIONS`, `PALETTE`, `normalizeName`, `AvatarValidationError`, and TypeScript types. Names are trimmed, Unicode NFC-normalized, case-sensitive, and limited to 256 code points. Similar appearances for different names remain possible.

When embedding raw SVG inline, provide a unique `idPrefix` for every instance. Use `title` to customize the accessible description. The React adapter manages instance IDs automatically.

This package is currently developed in the OpenAvatars workspace; public npm publication is pending.
