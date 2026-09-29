/** OpenAvatars v1. Keep this algorithm stable: identities are a public contract. */
export const SHAPES = [
  'round',
  'organic',
  'boxy',
  'capsule',
  'nub',
  'cloud',
  'droplet',
  'hexagon',
  'sun',
  'triangle',
] as const;
export const EXPRESSIONS = [
  'idle',
  'happy',
  'sad',
  'mad',
  'surprised',
  'wink',
  'sleepy',
  'smug',
  'unsure',
  'scared',
  'love',
  'shy',
  'sick',
  'thinking',
] as const;
export const PALETTE = [
  '#A4DFFD',
  '#BDCE82',
  '#FFC5B2',
  '#F4D194',
  '#B9DFA8',
  '#95DEDA',
  '#C7C5F6',
  '#E5B7F0',
  '#F4B5CC',
  '#E6AD7E',
  '#B5CEE9',
  '#D8D99A',
] as const;
export type Shape = (typeof SHAPES)[number];
export type Expression = (typeof EXPRESSIONS)[number];
export interface AvatarOptions {
  size?: number;
  animate?: boolean;
  shape?: Shape;
  expression?: Expression;
  /** A six-digit hex color, e.g. #A4DFFD. */
  color?: string;
}
export interface SvgOptions extends AvatarOptions {
  /** Supply a unique prefix when embedding multiple SVG strings inline. */
  idPrefix?: string;
  title?: string;
}
export interface AvatarTraits {
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
}
export class AvatarValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AvatarValidationError';
  }
}
export function normalizeName(name: string): string {
  if (typeof name !== 'string') throw new AvatarValidationError('name must be a string.');
  const normalized = name.normalize('NFC').trim();
  if (!normalized) throw new AvatarValidationError('name must not be empty.');
  if (Array.from(normalized).length > 256)
    throw new AvatarValidationError('name must be at most 256 characters.');
  return normalized;
}
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let x = Math.imul(state ^ (state >>> 15), 1 | state);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
const rounded = (n: number) => Number(n.toFixed(3));
export function generateAvatar(name: string, options: AvatarOptions = {}): AvatarTraits {
  const normalized = normalizeName(name);
  const seed = hash(`openavatars:v1:${normalized}`);
  const rng = random(seed);
  // Always consume the same sequence, even when a trait is overridden.
  const shape = SHAPES[Math.floor(rng() * SHAPES.length)];
  const expression = EXPRESSIONS[Math.floor(rng() * EXPRESSIONS.length)];
  const color = PALETTE[Math.floor(rng() * PALETTE.length)];
  if (options.shape !== undefined && !SHAPES.includes(options.shape))
    throw new AvatarValidationError('Unknown shape.');
  if (options.expression !== undefined && !EXPRESSIONS.includes(options.expression))
    throw new AvatarValidationError('Unknown expression.');
  if (options.color !== undefined && !/^#[\da-f]{6}$/i.test(options.color))
    throw new AvatarValidationError('color must be a six-digit hex color.');
  const size = options.size ?? 128;
  if (!Number.isInteger(size) || size < 16 || size > 1024)
    throw new AvatarValidationError('size must be an integer from 16 to 1024.');
  if (options.animate !== undefined && typeof options.animate !== 'boolean')
    throw new AvatarValidationError('animate must be a boolean.');
  return {
    version: 1,
    name: normalized,
    seed,
    shape: options.shape ?? shape,
    expression: options.expression ?? expression,
    color: (options.color ?? color).toUpperCase(),
    size,
    animate: options.animate ?? true,
    geometry: {
      width: rounded(0.94 + rng() * 0.1),
      height: rounded(0.95 + rng() * 0.07),
      tilt: rounded(-5 + rng() * 10),
      eyeGap: rounded(21 + rng() * 5),
      eyeSize: rounded(0.9 + rng() * 0.18),
      eyeTilt: rounded(-5 + rng() * 10),
    },
  };
}
const PATHS: Record<Shape, string> = {
  round: 'M50 10C75 10 89 26 89 50C89 75 74 90 50 90C25 90 11 75 11 50C11 25 26 10 50 10Z',
  organic:
    'M47 9C58 7 65 20 75 27C88 37 94 45 88 58C78 78 62 94 46 90C28 86 10 70 9 52C8 35 25 12 47 9Z',
  boxy: 'M27 12C37 9 66 10 76 15C86 20 87 30 86 49L84 70C83 85 73 89 58 88L30 86C16 85 12 77 12 63L13 34C14 21 17 15 27 12Z',
  capsule: 'M33 22H68C84 22 94 34 94 50C94 66 83 78 67 78H33C16 78 6 66 6 50C6 34 17 22 33 22Z',
  nub: 'M53 10C75 9 87 29 87 50C87 73 74 90 54 90C39 90 28 81 22 68C10 69 7 62 8 55C9 48 14 45 20 45C22 24 34 11 53 10Z',
  cloud:
    'M26 26C35 12 55 12 63 20C76 16 86 26 87 36C102 49 90 63 82 67C77 80 63 89 50 89C37 89 25 80 20 69C5 65 1 50 10 40C10 31 16 26 26 26Z',
  droplet:
    'M45 10Q50 3 55 10C64 24 83 41 85 58C89 79 70 94 50 94C29 94 12 79 15 59C17 42 36 23 45 10Z',
  hexagon:
    'M44 11Q50 7 56 11L81 26Q87 29 87 37L86 65Q86 73 80 77L56 91Q50 95 44 91L20 77Q13 73 13 65L14 36Q14 29 20 26Z',
  sun: 'M44 14C43 1 58 1 59 14L68 18C77 6 88 17 80 28L85 37C100 36 101 51 87 54L84 65C97 73 87 86 76 78L65 84C67 99 51 101 48 87L36 84C27 96 14 86 22 75L17 65C3 67 1 51 15 48L18 37C5 29 15 16 26 24L36 19Z',
  triangle: 'M44 14Q50 3 56 14L90 76Q97 89 82 89H18Q3 89 10 76Z',
};
interface Eye {
  w: number;
  h: number;
  angle: number;
  dy?: number;
  kind?: 'pill' | 'happy' | 'droop' | 'heart';
}
function eyes(expression: Expression): [Eye, Eye] {
  switch (expression) {
    case 'happy':
      return [
        { w: 10, h: 7, angle: -5, kind: 'happy' },
        { w: 10, h: 7, angle: 5, kind: 'happy' },
      ];
    case 'sad':
      return [
        { w: 4.5, h: 10, angle: -23, dy: 3 },
        { w: 4.5, h: 10, angle: 23, dy: 3 },
      ];
    case 'mad':
      return [
        { w: 12, h: 4, angle: 27 },
        { w: 12, h: 4, angle: -27 },
      ];
    case 'surprised':
      return [
        { w: 7.5, h: 20, angle: 0 },
        { w: 8, h: 20, angle: 0 },
      ];
    case 'wink':
      return [
        { w: 6, h: 15, angle: -3 },
        { w: 11, h: 3.5, angle: -8, dy: 1 },
      ];
    case 'sleepy':
      return [
        { w: 9, h: 3.5, angle: 2, dy: 3 },
        { w: 9, h: 3.5, angle: -2, dy: 3 },
      ];
    case 'smug':
      return [
        { w: 9, h: 5, angle: -15 },
        { w: 9, h: 5, angle: -15, dy: 2 },
      ];
    case 'unsure':
      return [
        { w: 5.5, h: 16, angle: -6, dy: -2 },
        { w: 8, h: 9, angle: -16, dy: 2 },
      ];
    case 'scared':
      return [
        { w: 5, h: 19, angle: 12 },
        { w: 5, h: 19, angle: -12 },
      ];
    case 'love':
      return [
        { w: 11, h: 11, angle: -8, kind: 'heart' },
        { w: 11, h: 11, angle: 8, kind: 'heart' },
      ];
    case 'shy':
      return [
        { w: 4, h: 8, angle: -10, dy: 4 },
        { w: 4, h: 8, angle: 8, dy: 4 },
      ];
    case 'sick':
      return [
        { w: 10, h: 6, angle: -10, dy: 3, kind: 'droop' },
        { w: 10, h: 6, angle: 10, dy: 3, kind: 'droop' },
      ];
    case 'thinking':
      return [
        { w: 6, h: 9, angle: 0, dy: -3 },
        { w: 7, h: 12, angle: 0, dy: -5 },
      ];
    default:
      return [
        { w: 6, h: 16, angle: -4 },
        { w: 6, h: 16, angle: 3 },
      ];
  }
}
function escapeXml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, '\uFFFD')
    .replace(
      /[<>&"']/g,
      (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!,
    );
}
function mix(hex: string, toward: number, amount: number): string {
  const channels = [1, 3, 5].map((i) =>
    Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - amount) + toward * amount),
  );
  return `#${channels.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
function eyeColor(color: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const n = parseInt(color.slice(i, i + 2), 16) / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.16 ? '#FFF9EB' : '#17201D';
}
function eyeMarkup(eye: Eye, index: number, a: AvatarTraits, id: string): string {
  const triangle = a.shape === 'triangle';
  const y =
    (triangle ? 66 : a.shape === 'droplet' ? 62 : a.shape === 'cloud' ? 54 : 48) + (eye.dy ?? 0);
  const x = 50 + ((index === 0 ? -1 : 1) * a.geometry.eyeGap) / 2 + (a.shape === 'nub' ? 4 : 0);
  const scale = a.geometry.eyeSize * (triangle ? 0.85 : 1);
  const w = eye.w,
    h = eye.h;
  let mark: string;
  if (eye.kind === 'happy')
    mark = `<path d="M${-w / 2} 2Q0 ${-h} ${w / 2} 2" fill="none" stroke="${eyeColor(a.color)}" stroke-width="3.6" stroke-linecap="round"/>`;
  else if (eye.kind === 'droop')
    mark = `<path d="M${-w / 2} 1Q0 ${-h / 2} ${w / 2} 1L${w / 2 - 1} 4Q0 1 ${-w / 2 + 1} 4Z"/>`;
  else if (eye.kind === 'heart')
    mark =
      '<path d="M0 5.5C-2 3.8-6 1-6-2.2C-6-6-1.6-6.5 0-3.6C1.6-6.5 6-6 6-2.2C6 1 2 3.8 0 5.5Z"/>';
  else
    mark = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${Math.min(w / 2, 2.5)}"/>`;
  return `<g transform="translate(${rounded(x)} ${rounded(y)}) rotate(${rounded(eye.angle + a.geometry.eyeTilt)}) scale(${scale})"><g clip-path="url(#${id}-lid${index})">${mark}</g></g>`;
}
/** Seeded, irregular 48–56 second loop; no clock or platform randomness affects output. */
function motionCss(a: AvatarTraits, id: string): string {
  const rng = random(hash(`${a.seed}:motion`));
  const duration = 48 + rng() * 8;
  const events: number[] = [];
  let time = 2 + rng() * 3;
  while (time < duration - 1) {
    events.push(time);
    if (rng() < 0.19 && time + 0.5 < duration - 1) events.push(time + 0.38);
    time += 3 + rng() * 4;
  }
  const pct = (s: number) => `${rounded((s / duration) * 100)}%`;
  const blink = events
    .map(
      (t) =>
        `${pct(t)}{transform:scaleY(1)}${pct(t + 0.09)}{transform:scaleY(.035)}${pct(t + 0.14)}{transform:scaleY(.035)}${pct(t + 0.25)}{transform:scaleY(1)}`,
    )
    .join('');
  const bounce = events
    .map(
      (t) =>
        `${pct(t)}{transform:translateY(0) scale(1)}${pct(t + 0.1)}{transform:translateY(.55px) scale(1.012,.981)}${pct(t + 0.24)}{transform:translateY(-.65px) scale(.995,1.008)}${pct(t + 0.36)}{transform:translateY(0) scale(1)}`,
    )
    .join('');
  const phase = rounded(-rng() * duration);
  return `<style>
#${id} .oa-lid{transform-origin:0px 0px;animation:${id}-blink ${rounded(duration)}s ${phase}s linear infinite}
#${id} .oa-bounce{transform-origin:50px 70px;animation:${id}-bounce ${rounded(duration)}s ${phase}s ease-in-out infinite}
#${id} .oa-breathe{transform-origin:50px 65px;animation:${id}-breathe ${rounded(4 + rng() * 2)}s ${rounded(-rng() * 5)}s ease-in-out infinite}
#${id} .oa-gaze{animation:${id}-gaze ${rounded(13 + rng() * 7)}s ${rounded(-rng() * 10)}s ease-in-out infinite}
@keyframes ${id}-blink{0%,100%{transform:scaleY(1)}${blink}}
@keyframes ${id}-bounce{0%,100%{transform:translateY(0) scale(1)}${bounce}}
@keyframes ${id}-breathe{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-.45px) scale(1.006,.996)}}
@keyframes ${id}-gaze{0%,24%,50%,74%,100%{transform:translate(0,0)}28%,44%{transform:translate(.8px,-.35px)}78%,94%{transform:translate(-.65px,.3px)}}
@media(prefers-reduced-motion:reduce){#${id} .oa-lid,#${id} .oa-bounce,#${id} .oa-breathe,#${id} .oa-gaze{animation:none!important;transform:none!important}}
</style>`;
}
export function renderAvatarSvg(name: string, options: SvgOptions = {}): string {
  const a = generateAvatar(name, options);
  if (options.idPrefix !== undefined && !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(options.idPrefix))
    throw new AvatarValidationError(
      'idPrefix must begin with a letter and contain only letters, numbers, underscores, or hyphens.',
    );
  const id = options.idPrefix ?? `oa-${hash(JSON.stringify(a)).toString(36)}`;
  const title = options.title === undefined ? `Avatar for ${a.name}` : options.title;
  const lids = [0, 1]
    .map(
      (i) =>
        `<clipPath id="${id}-lid${i}" clipPathUnits="userSpaceOnUse"><rect class="oa-lid" x="-16" y="-16" width="32" height="32"/></clipPath>`,
    )
    .join('');
  const [left, right] = eyes(a.expression);
  return `<svg xmlns="http://www.w3.org/2000/svg" id="${id}" width="${a.size}" height="${a.size}" viewBox="0 0 100 100" fill="none" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${escapeXml(title)}</title><defs><linearGradient id="${id}-paint" x1="20%" y1="0%" x2="80%" y2="100%"><stop stop-color="${mix(a.color, 255, 0.14)}"/><stop offset=".55" stop-color="${a.color}"/><stop offset="1" stop-color="${mix(a.color, 0, 0.07)}"/></linearGradient>${lids}</defs>${a.animate ? motionCss(a, id) : ''}<g transform="translate(50 50) rotate(${a.geometry.tilt}) scale(${a.geometry.width} ${a.geometry.height}) translate(-50 -50)"><g class="oa-breathe"><g class="oa-bounce"><path d="${PATHS[a.shape]}" fill="url(#${id}-paint)"/><g class="oa-gaze" fill="${eyeColor(a.color)}">${eyeMarkup(left, 0, a, id)}${eyeMarkup(right, 1, a, id)}</g></g></g></g></svg>`;
}
