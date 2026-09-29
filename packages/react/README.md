# @openavatars/react

A typed React 18+ component for OpenAvatars. MIT licensed.

```tsx
import { OpenAvatar } from '@openavatars/react';

<OpenAvatar name="jamie" size={128} />
<OpenAvatar name="jamie" shape="cloud" expression="wink" animate={false} />
```

The same username consistently generates the same character. Override `shape`, `expression`, or `color` independently. `animate` defaults to `true`; `false` restores the resting pose while preserving the expression. Reduced-motion preferences are respected automatically.

Use `label` for a custom accessible description or `decorative` when adjacent text already identifies the avatar. `className` and `style` apply to the wrapping span. SVG identifiers are scoped with React `useId`, including during server rendering.

Requires `openavatars` and a React peer dependency. This package is currently developed in the OpenAvatars workspace; public npm publication is pending.
