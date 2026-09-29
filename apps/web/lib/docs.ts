import { SHAPES, EXPRESSIONS, PALETTE } from 'openavatars';

export type DocBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'code'; label: string; language: string; code: string }
  | { kind: 'note'; title: string; text: string }
  | { kind: 'list'; items: string[]; ordered?: boolean }
  | { kind: 'table'; columns: string[]; rows: string[][]; label: string }
  | { kind: 'gallery'; variant: 'shapes' | 'expressions' | 'palette' }
  | { kind: 'link'; label: string; href: string };
export interface DocSection {
  id: string;
  title: string;
  group: string;
  description: string;
  blocks: DocBlock[];
}
const p = (text: string): DocBlock => ({ kind: 'paragraph', text });
const h = (text: string): DocBlock => ({ kind: 'heading', text });
const code = (label: string, language: string, code: string): DocBlock => ({
  kind: 'code',
  label,
  language,
  code,
});
const note = (title: string, text: string): DocBlock => ({ kind: 'note', title, text });
const table = (label: string, columns: string[], rows: string[][]): DocBlock => ({
  kind: 'table',
  label,
  columns,
  rows,
});

export const DOC_SECTIONS: DocSection[] = [
  {
    id: 'overview',
    title: 'Meet OpenAvatars',
    group: 'Get started',
    description: 'A name goes in. A little character comes out.',
    blocks: [
      p(
        'OpenAvatars turns a string into a soft, expressive SVG avatar. Ten shapes, fourteen eye expressions, twelve pastel colors, and seeded geometry variations create a consistent identity for each name. Every avatar has a transparent background and scales cleanly from a compact sidebar to a large profile.',
      ),
      table(
        'Choose an integration',
        ['Use case', 'Integration', 'What you get'],
        [
          [
            'A React application',
            '@openavatars/react',
            'A typed component with accessible labels and automatic SVG ID scoping.',
          ],
          [
            'JavaScript, TypeScript, or a server',
            'openavatars',
            'Pure functions that return avatar traits or a standalone SVG string.',
          ],
          [
            'Any app that displays images',
            'GET /api/v1/avatar',
            'A cacheable SVG URL, with no account or API key.',
          ],
        ],
      ),
      note(
        'Available from source',
        'The repository is public and MIT licensed. The package names are not yet published on npm. Use the workspace or install locally packed tarballs as shown below. API examples use your running OpenAvatars instance; no shared production hostname is assumed.',
      ),
      p(
        'The generator has no runtime dependencies. React is only needed for the React adapter, and Next.js is only needed to run this website and its HTTP endpoint. You can use the library entirely locally, without sending usernames to a service.',
      ),
      {
        kind: 'link',
        label: 'Explore the source on GitHub',
        href: 'https://github.com/lohit101/openavatars',
      },
    ],
  },
  {
    id: 'installation',
    title: 'Installation & quickstart',
    group: 'Get started',
    description: 'Run the playground, build the packages, or bring them into your app.',
    blocks: [
      h('Run the project'),
      p(
        'Use Node.js 22 or newer and npm. Run these commands from your terminal. The development command builds both library packages before starting the website at http://localhost:3000.',
      ),
      code(
        'Terminal',
        'shell',
        `git clone https://github.com/lohit101/openavatars.git
cd openavatars
npm install
npm run dev`,
      ),
      p(
        'The playground, documentation, and SVG endpoint all run together. No database, API keys, accounts, or environment variables are needed. Changes to the Next.js application reload automatically; after changing library source, rerun npm run build:packages or restart npm run dev.',
      ),
      h('Use the packages in a separate project'),
      p(
        'Until npm publication, build and pack both packages in the cloned repository. This produces two versioned .tgz files in the repository root.',
      ),
      code(
        'In the OpenAvatars repository',
        'shell',
        `npm run build:packages
npm pack -w openavatars
npm pack -w @openavatars/react`,
      ),
      p(
        'Copy those two archives to your application directory, then install them together. The React adapter depends on the core package, so installing both local archives in one command avoids attempting to resolve the unpublished core package from npm. For a JavaScript-only integration, install just the core archive.',
      ),
      code(
        'In your application, beside the copied archives',
        'shell',
        `npm install ./openavatars-0.1.0.tgz ./openavatars-react-0.1.0.tgz`,
      ),
      p(
        'The React adapter needs React 18 or later in your application. Both packages ship ESM JavaScript and TypeScript declarations. There is no CSS file to import: each rendered SVG contains its own gradients and animation styles.',
      ),
      h('Build for production'),
      code(
        'Terminal',
        'shell',
        `npm run build
npm start`,
      ),
    ],
  },
  {
    id: 'react',
    title: 'React component',
    group: 'Integrations',
    description: 'One component for profiles, sidebars, comments, and team lists.',
    blocks: [
      code(
        'ProfileAvatar.tsx',
        'tsx',
        `import { OpenAvatar } from '@openavatars/react';

export function ProfileAvatar() {
  return <OpenAvatar name="jamie" size={48} />;
}`,
      ),
      p(
        'Only name is required. The default size is 128 pixels and animation is on. The component renders a span containing an inline SVG; className and style apply to that span. Use size to change the actual SVG dimensions rather than styling only the wrapper.',
      ),
      code(
        'An avatar beside a name',
        'tsx',
        `import { OpenAvatar } from '@openavatars/react';

export function TeamMember() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <OpenAvatar name="jamie" size={40} decorative />
      <span>Jamie</span>
    </div>
  );
}`,
      ),
      h('Override a trait'),
      code(
        'Keep the identity, change the mood',
        'tsx',
        `<OpenAvatar
  name="jamie"
  size={64}
  shape="cloud"
  expression="wink"
  color="#A4DFFD"
  animate={false}
  label="Jamie’s profile"
/>`,
      ),
      p(
        'Overrides are independent. Changing expression keeps the generated color, shape, proportions, and eye spacing unless those are also overridden. An avatar with animation disabled retains its expression in a resting pose.',
      ),
      h('Server rendering and Next.js'),
      p(
        'The adapter includes a use client boundary, so it can be imported into a Next.js App Router page. It supports server rendering and scopes SVG gradients, clipping paths, and keyframes with React useId. Keep the same name and options between the server render and hydration. Do not generate a random name during rendering.',
      ),
      p(
        'For multiple independent React roots on one page, configure distinct React identifierPrefix values when creating and hydrating the roots. That keeps useId values unique across the entire document. For ordinary lists in one root, a stable React key and the component’s built-in IDs are sufficient.',
      ),
      h('React-only props'),
      table(
        'React component props',
        ['Prop', 'Type / default', 'Behavior'],
        [
          [
            'label',
            'string · Avatar for {name}',
            'Sets the SVG title used as the accessible image description.',
          ],
          [
            'decorative',
            'boolean · false',
            'Adds aria-hidden to the wrapper when adjacent content already identifies the avatar.',
          ],
          ['className', 'string · omitted', 'Applied to the wrapping span.'],
          [
            'style',
            'CSSProperties · omitted',
            'Merged into the wrapper’s inline-flex layout and dimensions.',
          ],
        ],
      ),
      p(
        'OpenAvatarProps is exported from @openavatars/react. Shape, Expression, and AvatarOptions are also re-exported there. DOM event handlers and arbitrary HTML attributes are not forwarded; put interactive behavior on a surrounding button or link.',
      ),
    ],
  },
  {
    id: 'javascript',
    title: 'JavaScript & TypeScript',
    group: 'Integrations',
    description: 'Use the generator in a browser, a server, or another framework.',
    blocks: [
      code(
        'Generate an SVG',
        'typescript',
        `import { generateAvatar, renderAvatarSvg } from 'openavatars';

const traits = generateAvatar('jamie');
const svg = renderAvatarSvg('jamie', {
  size: 128,
  animate: false,
});`,
      ),
      table(
        'Core exports',
        ['Export', 'Returns', 'Purpose'],
        [
          [
            'generateAvatar(name, options?)',
            'AvatarTraits',
            'Resolve a normalized name into versioned, deterministic appearance data.',
          ],
          [
            'renderAvatarSvg(name, options?)',
            'string',
            'Render a complete, self-contained SVG document.',
          ],
          [
            'normalizeName(name)',
            'string',
            'Trim and NFC-normalize a name using the same validation as generation.',
          ],
          [
            'AvatarValidationError',
            'Error subclass',
            'Identify invalid names or unsupported option values.',
          ],
          [
            'SHAPES / EXPRESSIONS / PALETTE',
            'readonly arrays',
            'Build selectors from the supported trait values.',
          ],
        ],
      ),
      h('Render into an image element'),
      p(
        'A Blob URL is a convenient way to display locally generated SVG without an HTTP request. Set an alt description on the image and release the URL when it is no longer needed. The function below returns a cleanup callback for your component or view lifecycle.',
      ),
      code(
        'Framework-independent browser integration',
        'typescript',
        `import { renderAvatarSvg } from 'openavatars';

export function mountAvatar(image: HTMLImageElement, name: string) {
  const svg = renderAvatarSvg(name, { size: 64 });
  const url = URL.createObjectURL(
    new Blob([svg], { type: 'image/svg+xml' }),
  );

  image.src = url;
  image.alt = 'Profile avatar';
  image.width = 64;
  image.height = 64;

  return () => {
    image.removeAttribute('src');
    URL.revokeObjectURL(url);
  };
}`,
      ),
      h('Embed inline SVG'),
      p(
        'Each inline instance needs its own idPrefix, even if two instances represent the same username. The default prefix is deterministic and is suitable for a standalone SVG file or an image element, whose ID namespace is isolated. Reusing a prefix inline can cause gradients or clips to resolve to another avatar.',
      ),
      code(
        'Unique identifiers for inline instances',
        'typescript',
        `const sidebarSvg = renderAvatarSvg('jamie', {
  idPrefix: 'sidebar-jamie',
  title: 'Jamie’s profile',
});

const commentSvg = renderAvatarSvg('jamie', {
  idPrefix: 'comment-42-jamie',
  title: 'Jamie’s profile',
});`,
      ),
      p(
        'The returned SVG contains generated markup with escaped title text and validated color values. Insert only the generator’s output into your framework’s raw HTML mechanism; do not append untrusted markup. SVG title text replaces characters that XML cannot represent.',
      ),
      h('Read the traits'),
      code(
        'Public result type',
        'typescript',
        `import type { Shape, Expression } from 'openavatars';

interface AvatarTraits {
  version: 1;
  name: string;
  seed: number;
  shape: Shape;
  expression: Expression;
  color: string;
  size: number;
  animate: boolean;
  geometry: {
    width: number;
    height: number;
    tilt: number;
    eyeGap: number;
    eyeSize: number;
    eyeTilt: number;
  };
}`,
      ),
      p(
        'Geometry is generated output, not an options interface. Width, height, and eyeSize are scale factors; tilt and eyeTilt are degrees; eyeGap is measured in the 100-unit SVG viewBox. Keep it for inspection or debugging. Pass the original name and supported options to render an avatar.',
      ),
    ],
  },
  {
    id: 'options',
    title: 'Options reference',
    group: 'Reference',
    description: 'Every shared option, default, and accepted value.',
    blocks: [
      table(
        'Shared avatar options',
        ['Option', 'Type / default', 'Accepted values'],
        [
          [
            'name',
            'string · required',
            'Nonempty after trimming; at most 256 Unicode code points after NFC normalization.',
          ],
          [
            'size',
            'number · 128',
            'An integer from 16 to 1024. Sets both SVG width and height in pixels.',
          ],
          [
            'animate',
            'boolean · true',
            'true or false. false removes animation styles and restores the resting pose.',
          ],
          ['shape', 'Shape · generated', SHAPES.join(', ')],
          ['expression', 'Expression · generated', EXPRESSIONS.join(', ')],
          [
            'color',
            'string · generated',
            'Six-digit hex including #, such as #A4DFFD. Output is uppercase.',
          ],
        ],
      ),
      p(
        'In JavaScript, name is the first function argument and the other fields belong to AvatarOptions. In React, all are props on OpenAvatar. The HTTP endpoint accepts the same names as query parameters, with size encoded as decimal digits and animate encoded as the exact string true or false.',
      ),
      table(
        'SVG serialization options',
        ['Option', 'Default', 'Behavior'],
        [
          [
            'idPrefix',
            'Generated from resolved traits',
            'Must start with a letter and contain only letters, digits, underscores, or hyphens. Use a unique value per inline instance.',
          ],
          [
            'title',
            'Avatar for {normalized name}',
            'Plain text for the SVG title. XML-special characters are escaped.',
          ],
        ],
      ),
      p(
        'idPrefix and title are specific to renderAvatarSvg. They are not accepted by the HTTP endpoint. React supplies its own ID prefix and exposes label for the title. Background colors, PNG output, animation speed, gaze targets, and custom path geometry are not configurable in this release.',
      ),
      code(
        'Type-safe configuration',
        'typescript',
        `import { renderAvatarSvg } from 'openavatars';
import type { AvatarOptions, SvgOptions } from 'openavatars';

const options = {
  size: 48,
  expression: 'happy',
  animate: false,
} satisfies AvatarOptions;

const inlineOptions: SvgOptions = {
  ...options,
  idPrefix: 'settings-avatar',
};

const svg = renderAvatarSvg('jamie', inlineOptions);`,
      ),
    ],
  },
  {
    id: 'traits',
    title: 'Shapes, expressions & colors',
    group: 'Reference',
    description: 'The complete visual vocabulary, straight from the generator.',
    blocks: [
      h('Ten silhouettes'),
      p(
        'Each shape has rounded contours and tuned eye placement. The seed also varies width, height, and resting tilt within small bounds. All ten silhouettes support every expression.',
      ),
      { kind: 'gallery', variant: 'shapes' },
      h('Fourteen expressions'),
      p(
        'Emotion comes entirely from the eyes: their curvature, angle, openness, size, and asymmetry. Expression is an assigned trait; avatars blink and glance without automatically cycling through different moods.',
      ),
      { kind: 'gallery', variant: 'expressions' },
      h('Twelve base colors'),
      p(
        'The default palette uses soft pastels. A subtle directional gradient is derived from the selected base color, and the generator chooses dark or light eyes based on the color’s luminance. Transparent regions remain transparent.',
      ),
      { kind: 'gallery', variant: 'palette' },
      code(
        'Build your own trait controls',
        'typescript',
        `import { SHAPES, EXPRESSIONS, PALETTE } from 'openavatars';
import type { Shape, Expression } from 'openavatars';

const availableShapes: readonly Shape[] = SHAPES;
const availableExpressions: readonly Expression[] = EXPRESSIONS;
const availableColors: readonly string[] = PALETTE;`,
      ),
    ],
  },
  {
    id: 'identity',
    title: 'Identity & determinism',
    group: 'Reference',
    description: 'Understand what makes an avatar stay the same.',
    blocks: [
      p(
        'Generation starts with NFC normalization and trimming. The normalized string is hashed with a v1 namespace and used to seed a deterministic random sequence. That sequence selects the shape, expression, color, and geometry. No clock, network call, or runtime randomness participates in the appearance.',
      ),
      code(
        'Normalization examples',
        'typescript',
        `import { normalizeName, generateAvatar } from 'openavatars';

normalizeName('  jamie  ');        // 'jamie'
normalizeName('cafe\\u0301');      // 'café'
normalizeName('Jamie');           // 'Jamie' (case is preserved)

// These produce the same resolved traits.
generateAvatar('  jamie  ');
generateAvatar('jamie');`,
      ),
      p(
        'Changing the normalized seed string changes the identity. If display names can change but avatars should not, use a stable user ID as name and provide a readable label in React. Avoid using a mutable display name as the seed in that situation.',
      ),
      code(
        'Stable identity, readable label',
        'tsx',
        `<OpenAvatar
  name="user-7f1a"
  label="Jamie’s profile"
  size={48}
/>`,
      ),
      note(
        'Deterministic does not mean unique',
        'The generator is not a registry of allocated avatars. Hash collisions and similar appearances are possible. Never use an avatar, its color, or its seed as proof of identity, an authentication token, or a unique database key.',
      ),
      h('Version compatibility'),
      p(
        'The current algorithm reports version: 1 and the HTTP route is /api/v1/avatar. There is no version option in the library. Keep package versions pinned when appearance stability matters. Future changes to identity mapping or visual geometry should introduce explicit versioning and migration guidance; existing v1 behavior is covered by regression tests.',
      ),
      p(
        'Overriding one trait does not consume a different random sequence, so unrelated traits stay stable. Changing size or animate also leaves the appearance traits unchanged. SVG markup can differ between instances because IDs or labels differ while the visible identity remains the same.',
      ),
    ],
  },
  {
    id: 'animation',
    title: 'Animation & reduced motion',
    group: 'Reference',
    description: 'Natural little movements, with a reliable off switch.',
    blocks: [
      p(
        'Animated SVGs include eyelid clipping, a small body squash and rebound synchronized with blinks, subtle breathing, and occasional eye movement. Each username receives seeded timing and phase offsets, so a group of different avatars does not blink in unison.',
      ),
      p(
        'The timeline lasts roughly 48–56 seconds and repeats. Normal blink events are about 3–7 seconds apart, with occasional double blinks. This is an intentionally irregular deterministic loop, not a live random scheduler. Repeated instances of the same username share timing parameters, but their playback phases can differ when mounted at different times.',
      ),
      code(
        'Turn motion off',
        'tsx',
        `<OpenAvatar name="jamie" expression="wink" animate={false} />`,
      ),
      code(
        'JavaScript and image URLs',
        'typescript',
        `renderAvatarSvg('jamie', { animate: false });

const staticAvatarUrl = '/api/v1/avatar?name=jamie&animate=false';`,
      ),
      p(
        'Disabling animation removes the SVG animation styles completely. The body returns to its resting transform and the eyes keep their assigned expression; a wink stays a wink. This does not reset the avatar to idle eyes.',
      ),
      note(
        'Respect the viewer’s preference',
        'Animated SVGs include a prefers-reduced-motion: reduce rule that disables their motion automatically. This applies even when animate is true. There is no prop that forces motion over the viewer’s preference.',
      ),
      p(
        'Animations are self-contained and work in inline SVG and browser image elements. Rasterizers, email clients, native image controls, or other SVG viewers may not animate them. For static exports and screenshots, request animate: false. GIF, video, and PNG export are not included.',
      ),
    ],
  },
  {
    id: 'http-api',
    title: 'HTTP / SVG API',
    group: 'Integrations',
    description: 'An image URL for any frontend. No JavaScript package required.',
    blocks: [
      code('Endpoint', 'http', 'GET /api/v1/avatar?name=jamie'),
      p(
        'The endpoint lives on the same host as this website. Use a relative path in an app that serves the endpoint; for another app or domain, prepend the origin of your deployed OpenAvatars instance. No authorization header, API key, or account is required.',
      ),
      code(
        'HTML image',
        'html',
        `<img
  src="/api/v1/avatar?name=jamie&amp;size=64&amp;animate=false"
  width="64"
  height="64"
  alt="Jamie’s profile"
/>`,
      ),
      {
        kind: 'link',
        label: 'Open a live example from this instance',
        href: '/api/v1/avatar?name=jamie&size=128&shape=cloud&expression=happy',
      },
      h('Encode query parameters'),
      p(
        'Use URLSearchParams for all user-provided values. In particular, a literal # begins a URL fragment and is not sent to the server; a hex color must be encoded as %23. For HTML markup, escape query separators as &amp;.',
      ),
      code(
        'A correctly encoded URL',
        'typescript',
        `const params = new URLSearchParams({
  name: 'Jamie & friends',
  size: '64',
  animate: 'false',
  shape: 'cloud',
  expression: 'happy',
  color: '#A4DFFD',
});

const imageUrl = '/api/v1/avatar?' + params.toString();`,
      ),
      table(
        'HTTP query parameters',
        ['Parameter', 'Default', 'HTTP format'],
        [
          [
            'name',
            'Required',
            'A URL-encoded string, normalized and validated as described in Options.',
          ],
          ['size', '128', 'Decimal integer digits from 16 to 1024.'],
          [
            'animate',
            'true',
            'The exact lowercase string true or false; 0 and 1 are not accepted.',
          ],
          ['shape / expression', 'Generated', 'One of the case-sensitive supported names.'],
          ['color', 'Generated', 'URL-encoded six-digit hex, including the # prefix.'],
        ],
      ),
      p(
        'Only those six parameter names are supported. Unknown parameters, repeated parameters, missing names, and invalid values return a 400 response. Do not add a cache-busting parameter or pass React-only props in the URL.',
      ),
      table(
        'HTTP methods and responses',
        ['Request / status', 'Behavior'],
        [
          ['GET · 200', 'SVG body with Content-Type: image/svg+xml; charset=utf-8.'],
          ['GET · 304', 'No body when If-None-Match matches the current ETag.'],
          ['GET · 400', 'JSON body with an error string; Cache-Control: no-store.'],
          ['HEAD', 'Same validation and response headers as GET, without a body.'],
          ['OPTIONS · 204', 'Public method and CORS information, with no body.'],
        ],
      ),
      h('Caching and cross-origin use'),
      code(
        'Successful response headers',
        'http',
        `Content-Type: image/svg+xml; charset=utf-8
Cache-Control: public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Expose-Headers: ETag
X-Content-Type-Options: nosniff`,
      ),
      p(
        'Successful responses also include an ETag derived from the SVG bytes and a restrictive Content-Security-Policy for the image document. Browsers can cache for one day and supporting CDNs for seven days, with one day of stale-while-revalidate. Deployment infrastructure controls whether those CDN directives are honored.',
      ),
      p(
        'If-None-Match supports matching strong or weak entity tags, comma-separated tags, and *. The built-in CORS policy permits anonymous cross-origin image use and simple fetch requests. It does not advertise Access-Control-Allow-Headers for custom cross-origin request headers. Let the browser handle ordinary image revalidation; configure CORS explicitly if your integration needs custom preflight headers.',
      ),
      h('Fetch with error handling'),
      code(
        'Read an SVG from the API',
        'typescript',
        `export async function fetchAvatar(name: string) {
  const params = new URLSearchParams({ name, animate: 'false' });
  const response = await fetch('/api/v1/avatar?' + params);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? 'Avatar request failed: ' + response.status);
  }

  return response.text();
}`,
      ),
    ],
  },
  {
    id: 'accessibility',
    title: 'Accessibility & embedding',
    group: 'Production',
    description: 'Keep profile identities clear, readable, and comfortable.',
    blocks: [
      p(
        'React avatars and raw SVGs include role="img", a title, and aria-labelledby. The default title is Avatar for followed by the normalized name. If the seed is an internal ID, override the accessible description with label in React or title in renderAvatarSvg.',
      ),
      code(
        'Meaningful and decorative avatars',
        'tsx',
        `<OpenAvatar name="user-7f1a" label="Jamie’s profile" />

<div>
  <OpenAvatar name="user-7f1a" decorative />
  <span>Jamie</span>
</div>`,
      ),
      p(
        'For an SVG loaded through an img tag, set alt on the image element; do not rely on the internal SVG title as the page’s image description. Use alt="" when the image is decorative. Supply width and height to reserve space before loading.',
      ),
      p(
        'If an avatar opens a profile, use a real link or button with a clear accessible name and keyboard focus style. The avatar component itself does not implement clicks, focus handling, or tooltips. Keep the person’s name visible where recognition matters instead of relying only on color or expression.',
      ),
      h('Content Security Policy'),
      p(
        'A strict host-page CSP can block the inline style element used by animated inline SVG. For an integration that cannot allow those styles, use an API image under an allowed img-src origin or request animate: false. Local Blob URLs require blob: in img-src. The library does not currently expose a CSP nonce option.',
      ),
      h('Performance and formats'),
      p(
        'Prefer the small library for local generation or cacheable image URLs for image-based integrations. Set animate: false for dense lists when motion is unnecessary. Use standard image loading controls, such as loading="lazy", for offscreen img elements. The React component does not automatically pause itself when offscreen.',
      ),
      p(
        'The core emits SVG only. It has no native React Native renderer, WebGL scene, PNG encoder, or image optimizer. In other environments, load the SVG using a compatible image renderer or convert a static SVG in your own asset pipeline. Animated behavior depends on that renderer’s SVG support.',
      ),
    ],
  },
  {
    id: 'errors',
    title: 'Validation & errors',
    group: 'Reference',
    description: 'Handle invalid input without losing the rest of your interface.',
    blocks: [
      p(
        'Core generation and React rendering throw AvatarValidationError for invalid names or supported option values. Validate user-provided configuration before rendering a React component, or use your application’s error boundary. The playground’s empty-name sample is a UI fallback; the library itself does not silently replace an empty name.',
      ),
      code(
        'Handle input validation',
        'typescript',
        `import { generateAvatar, AvatarValidationError } from 'openavatars';

export function validateAvatarName(name: string) {
  try {
    return { ok: true as const, traits: generateAvatar(name) };
  } catch (error) {
    if (error instanceof AvatarValidationError) {
      return { ok: false as const, message: error.message };
    }
    throw error;
  }
}`,
      ),
      table(
        'Common validation errors',
        ['Input', 'Message or result'],
        [
          ['Missing HTTP name', 'name is required.'],
          ['Empty / whitespace-only name', 'name must not be empty.'],
          ['Name longer than 256 normalized code points', 'name must be at most 256 characters.'],
          ['Fractional or out-of-range size', 'size must be an integer from 16 to 1024.'],
          ['Unsupported shape / expression', 'Unknown shape. / Unknown expression.'],
          ['Named, short, or malformed color', 'color must be a six-digit hex color.'],
          ['HTTP animate=0', 'animate must be true or false.'],
          [
            'Duplicate or unknown query key',
            'Duplicate parameter: {key} / Unknown parameter: {key}',
          ],
        ],
      ),
      code('Example HTTP 400 body', 'json', '{\n  "error": "name must not be empty."\n}'),
      p(
        'TypeScript declarations catch unsupported option names at compile time. At runtime, the core validates its recognized values but does not reject every extra object property; the HTTP route explicitly rejects unknown query keys. Treat the documented interfaces as the supported contract.',
      ),
    ],
  },
  {
    id: 'deployment',
    title: 'Deployment & self-hosting',
    group: 'Production',
    description: 'Host the website and image endpoint together, or use the library alone.',
    blocks: [
      h('Deploy on Vercel'),
      {
        kind: 'list',
        ordered: true,
        items: [
          'Import your fork of lohit101/openavatars into Vercel.',
          'Set the project Root Directory to apps/web and enable inclusion of source files outside that directory.',
          'Select the Next.js framework preset. The checked-in apps/web/vercel.json runs npm ci and npm run build from the workspace root.',
          'Deploy, then open /docs and /api/v1/avatar?name=jamie on the assigned hostname to verify both the site and SVG route.',
        ],
      },
      p(
        'No environment variables are required for the default application. The route uses the Node.js runtime for its ETag hash. A static export of the website alone cannot serve this runtime endpoint.',
      ),
      h('Run a Node.js server'),
      code(
        'Production server',
        'shell',
        `npm ci
npm run build
npm start`,
      ),
      p(
        'Run from the repository root with Node.js 22 or newer. The default server listens on port 3000. Put it behind your usual HTTPS reverse proxy or hosting platform. Keep the workspace packages and their built dist directories available when running the server.',
      ),
      h('Operational considerations'),
      {
        kind: 'list',
        items: [
          'The API is stateless and needs no database. It has no built-in authentication, request quotas, or rate limiter; configure traffic controls at your hosting layer if needed.',
          'Requests can expose the seed name in URLs and standard server logs. Prefer a stable non-sensitive user ID over an email address. Client-side generation avoids sending the name to the avatar endpoint.',
          'Monitor HTTP errors, function usage, latency, and cache behavior using your platform’s tooling. No analytics or monitoring service is bundled.',
          'Keep the /api/v1/ mapping stable when deploying updates. Invalidate stale assets deliberately if changing an implementation bug that affects generated output.',
        ],
      },
    ],
  },
  {
    id: 'contributing',
    title: 'Development & contributing',
    group: 'Project',
    description: 'The workspace, quality checks, and compatibility expectations.',
    blocks: [
      table(
        'Repository structure',
        ['Location', 'Responsibility'],
        [
          [
            'packages/core',
            'The pure TypeScript generator. No browser, React, or runtime dependencies.',
          ],
          ['packages/react', 'The React component and its TypeScript props.'],
          ['apps/web', 'The Next.js playground, documentation, and SVG endpoint.'],
          ['tests', 'Chromium and WebKit integration tests and visual review artifacts.'],
        ],
      ),
      code(
        'Run all quality checks',
        'shell',
        `npm run check
npx playwright install chromium webkit
npm run test:e2e`,
      ),
      p(
        'npm run check runs ESLint, type checking, unit tests, and the production build. Browser tests cover the playground, docs, motion, reduced motion, standalone SVG images, downloads, and responsive layouts. Screenshots and the 140-combination contact sheet are written to the ignored artifacts directory.',
      ),
      p(
        'Keep v1 identity mapping stable. A change to hashing, random-value order, normalization, silhouette geometry, or eye geometry may change existing avatars. Add regression coverage and explicit versioning when a change is intentional. Review every shape and expression at small sizes as well as at profile size.',
      ),
      p(
        'For package releases, build both packages, inspect the contents with npm pack --dry-run, and test the local archives in a separate consumer project. Public publication requires registry access and package-name availability. Cloning or deploying the website does not publish packages.',
      ),
      {
        kind: 'link',
        label: 'Read the contribution guide',
        href: 'https://github.com/lohit101/openavatars/blob/main/CONTRIBUTING.md',
      },
      {
        kind: 'link',
        label: 'Report an issue on GitHub',
        href: 'https://github.com/lohit101/openavatars/issues',
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting & FAQ',
    group: 'Project',
    description: 'Quick answers to the things most likely to get in your way.',
    blocks: [
      h('npm cannot find openavatars'),
      p(
        'The packages are not published yet. Clone the repository and use the local tarball installation steps. Install the core and React archives together, and ensure your application already has a compatible React version.',
      ),
      h('My avatar is not moving'),
      p(
        'Check animate, the viewer’s reduced-motion preference, and whether the SVG viewer supports CSS animation. A sanitizer may remove the embedded style element, and a host CSP may block it for inline SVG. Try the API image directly in a browser or use an intentionally static avatar.',
      ),
      h('Colors or eyes are wrong when several avatars are inline'),
      p(
        'Check for duplicate SVG IDs. Raw renderAvatarSvg output needs a unique idPrefix for every inline instance. Use the React component to manage this automatically, or use separate img elements.',
      ),
      h('The API ignores my hex color'),
      p(
        'A literal # starts a URL fragment. Build the query with URLSearchParams so # becomes %23, and use a full six-digit hex value. Check the HTTP response for a 400 error rather than treating an invalid image as a generation failure.',
      ),
      h('A username changed and so did the avatar'),
      p(
        'The normalized name is the seed. Use a stable user ID if the avatar should survive display-name changes, and set a separate accessible label. Remember that case is preserved.',
      ),
      h('Can I use this commercially or modify the artwork?'),
      p(
        'Yes. The source is MIT licensed and the project permits personal and commercial use of generated avatars. Preserve the MIT copyright and permission notice when redistributing the software. No visible attribution badge is required in your app.',
      ),
      {
        kind: 'link',
        label: 'Read the MIT license',
        href: 'https://github.com/lohit101/openavatars/blob/main/LICENSE',
      },
      h('Can I request PNGs, custom shapes, or different animation speeds?'),
      p(
        'The current interface exports SVG and supports the documented traits. There are no PNG, custom-path, or animation-speed options. Convert static SVGs in your own pipeline or propose a focused feature through the GitHub issue tracker.',
      ),
    ],
  },
];

export const DOC_GROUPS = ['Get started', 'Integrations', 'Reference', 'Production', 'Project'];
DOC_SECTIONS.sort((a, b) => DOC_GROUPS.indexOf(a.group) - DOC_GROUPS.indexOf(b.group));
export const DOC_NAV = DOC_SECTIONS.map(({ id, title, group, description, blocks }) => ({
  id,
  title,
  group,
  description,
  searchText: [
    title,
    description,
    JSON.stringify(blocks),
    id === 'traits' ? [...SHAPES, ...EXPRESSIONS, ...PALETTE].join(' ') : '',
  ]
    .join(' ')
    .toLowerCase(),
}));
export { SHAPES, EXPRESSIONS, PALETTE };
