# Private React compatibility adapter

This directory keeps earlier workspace imports from `@openavatars/react` working. It is private and is not published to npm.

The public component is included in the `openavatars` package:

```sh
npm install openavatars
```

```tsx
import { OpenAvatar } from 'openavatars/react';

<OpenAvatar name="jamie" size={48} />;
```

See the [package README](../core/README.md) for all props and supported environments.
