'use client';

import Link from 'next/link';
import { useHydrated } from '../lib/use-hydrated';
import { INSTALL_COMMAND, NPM_URL } from '../lib/package';
import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { OpenAvatar } from 'openavatars/react';
import {
  generateAvatar,
  renderAvatarSvg,
  SHAPES,
  EXPRESSIONS,
  PALETTE,
  type Shape,
  type Expression,
  type AvatarOptions,
} from 'openavatars';
import {
  ArrowUpRight,
  ArrowRight,
  Shuffle,
  SlidersHorizontal,
  DownloadSimple,
  Copy,
  Check,
  ArrowCounterClockwise,
  CaretDown,
  X,
  Code,
  BracketsCurly,
  GithubLogo,
} from '@phosphor-icons/react';

type CodeTab = 'React' | 'JavaScript' | 'Image URL';
const PEOPLE = [
  'milo',
  'sophie',
  'pixelpanda',
  'noah',
  'luna',
  'hey.oscar',
  'juniper',
  'kai',
  'olive',
  'theo',
  'samira',
  'fern',
  'nico',
  'yuki',
  'cosmo',
  'astrid',
  'benji',
  'maeve',
];
const RANDOM_NAMES = [
  'moonberry',
  'littlefern',
  'peach.exe',
  'cloudclub',
  'hello.milo',
  'sunny.side',
  'tinyplanet',
  'slow.sunday',
  'mintcondition',
  'pocketcloud',
];
const subscribeOrigin = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => '';
const getReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getServerMotion = () => false;
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function HighlightedCode({ code }: { code: string }) {
  const parts = code.split(
    /("(?:[^"\\]|\\.)*"|'[^']*'|\b(?:import|from|const|true|false)\b|<\/?[A-Z][A-Za-z]*)/g,
  );
  return (
    <code>
      {parts.map((part, i) => (
        <span
          key={i}
          className={
            /^["']/.test(part)
              ? 'code-string'
              : /^(import|from|const|true|false)$/.test(part)
                ? 'code-keyword'
                : /^</.test(part)
                  ? 'code-component'
                  : undefined
          }
        >
          {part}
        </span>
      ))}
    </code>
  );
}
function CopyButton({ value, label = 'Copy code' }: { value: string; label?: string }) {
  const hydrated = useHydrated();
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  useEffect(() => {
    if (status === 'idle') return;
    const timer = setTimeout(() => setStatus('idle'), 2400);
    return () => clearTimeout(timer);
  }, [status]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }
  return (
    <button
      disabled={!hydrated}
      className="icon-button copy-button"
      onClick={copy}
      aria-label={status === 'copied' ? 'Copied' : label}
      title={label}
    >
      {status === 'copied' ? <Check size={17} /> : <Copy size={17} />}
      <span className="copy-feedback" role="status">
        {status === 'copied' ? 'Copied!' : status === 'error' ? 'Select and copy the text' : ''}
      </span>
    </button>
  );
}

export default function Playground() {
  const hydrated = useHydrated();
  const [name, setName] = useState('jamie');
  const [animate, setAnimate] = useState(true);
  const [shape, setShape] = useState<Shape | ''>('');
  const [expression, setExpression] = useState<Expression | ''>('');
  const [color, setColor] = useState('');
  const [customize, setCustomize] = useState(false);
  const [codeTab, setCodeTab] = useState<CodeTab>('React');
  const origin = useSyncExternalStore(subscribeOrigin, getOrigin, getServerOrigin);
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, getServerMotion);
  const [notice, setNotice] = useState('');
  const [galleryMode, setGalleryMode] = useState<'shapes' | 'expressions'>('shapes');
  const inputRef = useRef<HTMLInputElement>(null);
  const effectiveName = name.normalize('NFC').trim() || 'someone';
  const options: AvatarOptions = {
    animate,
    ...(shape && { shape }),
    ...(expression && { expression }),
    ...(color && { color }),
  };
  const traits = generateAvatar(effectiveName, options);
  const automaticTraits = generateAvatar(effectiveName);
  const customized = Boolean(shape || expression || color);
  const params = new URLSearchParams({
    name: effectiveName,
    ...(!animate && { animate: 'false' }),
    ...(shape && { shape }),
    ...(expression && { expression }),
    ...(color && { color }),
  });
  const apiPath = `/api/v1/avatar?${params.toString()}`;
  const apiUrl = `${origin}${apiPath}`;
  const props = [
    `  name={${JSON.stringify(effectiveName)}}`,
    '  size={128}',
    `  animate={${animate}}`,
    ...(shape ? [`  shape="${shape}"`] : []),
    ...(expression ? [`  expression="${expression}"`] : []),
    ...(color ? [`  color="${color}"`] : []),
  ];
  const snippets: Record<CodeTab, string> = {
    React: `import { OpenAvatar } from "openavatars/react";\n\n<OpenAvatar\n${props.join('\n')}\n/>`,
    JavaScript: `import { renderAvatarSvg } from "openavatars";\n\nconst svg = renderAvatarSvg(\n  ${JSON.stringify(effectiveName)},\n  ${JSON.stringify({ size: 128, ...options }, null, 2).replace(/\n/g, '\n  ')}\n);`,
    'Image URL': `<img\n  src="${apiUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"\n  width="128"\n  height="128"\n  alt="Profile avatar"\n/>`,
  };
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3200);
    return () => clearTimeout(timer);
  }, [notice]);
  function resetTraits() {
    setShape('');
    setExpression('');
    setColor('');
  }
  function selectPerson(person: string) {
    setName(person);
    resetTraits();
    document
      .getElementById('playground')
      ?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
  }
  function randomize() {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    setName(`${RANDOM_NAMES[value[0] % RANDOM_NAMES.length]}${Math.floor(value[0] / 100) % 100}`);
    resetTraits();
  }
  function download() {
    const svg = renderAvatarSvg(effectiveName, { ...options, size: 512 });
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `openavatar-${effectiveName.replace(/[^a-z0-9_-]/gi, '-').slice(0, 60) || 'avatar'}.svg`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Your little friend is ready to go. SVG downloaded.');
  }
  function chooseTrait(value: string) {
    if (galleryMode === 'shapes') setShape(value as Shape);
    else setExpression(value as Expression);
    setCustomize(true);
    document
      .getElementById('playground')
      ?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
  }
  return (
    <>
      <a href="#playground" className="skip-link">
        Skip to playground
      </a>
      <header className="site-header shell">
        <a className="brand" href="#" aria-label="OpenAvatars home">
          <OpenAvatar
            name="openavatars"
            shape="round"
            expression="idle"
            color="#BDCE82"
            size={34}
            animate={false}
            decorative
          />
          <span>openavatars</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#collection">The collection</a>
          <Link href="/docs">Documentation</Link>
          <a
            className="nav-source"
            href="https://github.com/lohit101/openavatars"
            target="_blank"
            rel="noreferrer"
          >
            <GithubLogo size={17} weight="fill" aria-hidden="true" /> Open source{' '}
            <ArrowUpRight size={14} />
          </a>
        </nav>
      </header>
      <main>
        <section id="playground" className="hero shell">
          <div className="hero-main">
            <h1>
              openavatars<span className="wordmark-period">.</span>
            </h1>
            <p className="hero-description">
              Little faces. Big personalities.
              <br />
              <span>Free, animated avatars from any username.</span>
            </p>
            <div className="username-section">
              <label htmlFor="username">Let’s find your little friend</label>
              <div className="username-control">
                <span className="input-prefix" aria-hidden="true">
                  @
                </span>
                <input
                  disabled={!hydrated}
                  ref={inputRef}
                  id="username"
                  value={name}
                  onChange={(event) =>
                    setName(Array.from(event.target.value).slice(0, 256).join(''))
                  }
                  placeholder="your username"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                <button
                  disabled={!hydrated}
                  className="icon-button"
                  onClick={randomize}
                  aria-label="Try a random username"
                  title="Try a random username"
                >
                  <Shuffle size={19} />
                </button>
              </div>
            </div>
            <div className="avatar-stage">
              <OpenAvatar name={effectiveName} {...options} size={260} className="hero-avatar" />
              <div className="size-previews" aria-label="Avatar size previews">
                <OpenAvatar name={effectiveName} {...options} size={24} decorative />
                <OpenAvatar name={effectiveName} {...options} size={40} decorative />
                <OpenAvatar name={effectiveName} {...options} size={64} decorative />
                <span>Fits in anywhere.</span>
              </div>
              <span className="avatar-caption">
                {name.trim() ? `@${traits.name}` : 'Sample avatar · type a username'}
              </span>
            </div>
            <div className="playground-toolbar">
              <button
                disabled={!hydrated}
                className={`customize-button ${customize ? 'active' : ''}`}
                aria-expanded={customize}
                aria-controls="trait-controls"
                onClick={() => setCustomize(!customize)}
              >
                <SlidersHorizontal size={16} /> Customize{' '}
                <CaretDown size={12} className={customize ? 'rotated' : ''} />
              </button>
              <div className="motion-control">
                <span id="motion-label">Animation</span>
                <button
                  disabled={!hydrated}
                  type="button"
                  role="switch"
                  aria-checked={animate}
                  aria-labelledby="motion-label"
                  className={`switch ${animate ? 'on' : ''}`}
                  onClick={() => setAnimate(!animate)}
                >
                  <span />
                </button>
              </div>
              <button
                disabled={!hydrated}
                className="icon-button download-button"
                onClick={download}
                aria-label="Download SVG"
                title="Download SVG"
              >
                <DownloadSimple size={19} />
              </button>
            </div>
            {reducedMotion && (
              <p className="motion-note">Your reduced-motion preference keeps avatars still.</p>
            )}
            {customize && (
              <div id="trait-controls" className="trait-controls">
                <div className="trait-selects">
                  <label>
                    Shape
                    <select
                      disabled={!hydrated}
                      value={shape}
                      onChange={(event) => setShape(event.target.value as Shape | '')}
                    >
                      <option value="">Automatic · {automaticTraits.shape}</option>
                      {SHAPES.map((value) => (
                        <option key={value} value={value}>
                          {capitalize(value)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Expression
                    <select
                      disabled={!hydrated}
                      value={expression}
                      onChange={(event) => setExpression(event.target.value as Expression | '')}
                    >
                      <option value="">Automatic · {automaticTraits.expression}</option>
                      {EXPRESSIONS.map((value) => (
                        <option key={value} value={value}>
                          {capitalize(value)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="palette-row">
                  <span>Color</span>
                  <div className="swatches">
                    {PALETTE.map((value) => (
                      <button
                        disabled={!hydrated}
                        key={value}
                        className={`swatch ${traits.color === value ? 'selected' : ''}`}
                        style={{ background: value }}
                        aria-label={`Use color ${value}`}
                        aria-pressed={color === value}
                        onClick={() => setColor(value)}
                      />
                    ))}
                  </div>
                </div>
                <button
                  disabled={!hydrated || !customized}
                  className="text-button reset-button"
                  onClick={resetTraits}
                >
                  <ArrowCounterClockwise size={14} /> Reset to your username
                </button>
              </div>
            )}
          </div>
          <div className="integration">
            <div className="integration-heading">
              <span>
                <Code size={17} /> Yours in a few lines
              </span>
              <span className="mono">YourAvatar.tsx</span>
            </div>
            {codeTab !== 'Image URL' && (
              <div className="package-install">
                <div className="package-install-command">
                  <code>{INSTALL_COMMAND}</code>
                  <CopyButton value={INSTALL_COMMAND} label="Copy install command" />
                </div>
                <p>
                  <a href={NPM_URL} target="_blank" rel="noreferrer">
                    One package. JavaScript + React. <ArrowUpRight size={12} />
                  </a>
                </p>
              </div>
            )}
            <div className="code-panel">
              <div className="code-tabs" role="tablist" aria-label="Integration language">
                {(['React', 'JavaScript', 'Image URL'] as const).map((tab) => (
                  <button
                    disabled={!hydrated}
                    key={tab}
                    id={`tab-${tab.replace(' ', '-')}`}
                    role="tab"
                    aria-selected={codeTab === tab}
                    aria-controls="integration-code"
                    tabIndex={codeTab === tab ? 0 : -1}
                    onClick={() => setCodeTab(tab)}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                        const tabs: CodeTab[] = ['React', 'JavaScript', 'Image URL'];
                        const index =
                          (tabs.indexOf(codeTab) + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
                        setCodeTab(tabs[index]);
                        document.getElementById(`tab-${tabs[index].replace(' ', '-')}`)?.focus();
                      }
                    }}
                  >
                    {tab}
                  </button>
                ))}
                <CopyButton value={snippets[codeTab]} />
              </div>
              <pre
                id="integration-code"
                role="tabpanel"
                aria-labelledby={`tab-${codeTab.replace(' ', '-')}`}
                tabIndex={0}
              >
                <HighlightedCode code={snippets[codeTab]} />
              </pre>
              <div className="code-footer">
                <span>
                  {codeTab === 'Image URL'
                    ? 'Works wherever images do'
                    : codeTab === 'React'
                      ? 'TypeScript ready'
                      : 'Zero runtime dependencies'}
                </span>
                <span>
                  .{codeTab === 'React' ? 'tsx' : codeTab === 'JavaScript' ? 'js' : 'html'}
                </span>
              </div>
            </div>
            <p className="integration-note">
              One name is all it takes. The same username always
              <br className="desktop-break" /> brings back the same face. No account. No API key.
            </p>
            <Link href="/docs" className="docs-link">
              Installation & docs <ArrowRight size={15} />
            </Link>
            <div className="trait-readout">
              <span>THIS LITTLE FRIEND</span>
              <dl>
                <div>
                  <dt>Shape</dt>
                  <dd>{traits.shape}</dd>
                </div>
                <div>
                  <dt>Mood</dt>
                  <dd>{traits.expression}</dd>
                </div>
                <div>
                  <dt>Color</dt>
                  <dd>
                    <i style={{ background: traits.color }} />
                    {traits.color.toLowerCase()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
        <section className="wall-section shell" aria-labelledby="wall-title">
          <div className="section-heading">
            <h2 id="wall-title">Everyone gets a face.</h2>
            <p>A few friendly faces from a few ordinary names. Try one on.</p>
          </div>
          <div className="avatar-wall">
            {PEOPLE.map((person) => (
              <button
                disabled={!hydrated}
                key={person}
                className={`person ${name === person ? 'selected' : ''}`}
                onClick={() => selectPerson(person)}
                aria-label={`Try ${person}'s avatar`}
              >
                <OpenAvatar name={person} size={92} animate={animate} decorative />
                <span>{person}</span>
              </button>
            ))}
          </div>
          <div className="wall-footnote">
            <span>Made from a name. Full of character.</span>
            <span>
              Always the same you <ArrowUpRight size={13} />
            </span>
          </div>
        </section>
        <section id="collection" className="collection-section shell">
          <div className="section-heading">
            <span className="eyebrow">A LITTLE DIFFERENT BY DESIGN</span>
            <h2>
              Small details.
              <br />A whole lot of personality.
            </h2>
            <p>
              Soft around the edges. Expressive in the eyes.
              <br />
              Every little friend has a thing of its own.
            </p>
          </div>
          <div className="gallery-toolbar">
            <div className="segmented-control" role="group" aria-label="Collection view">
              <button
                disabled={!hydrated}
                aria-pressed={galleryMode === 'shapes'}
                className={galleryMode === 'shapes' ? 'selected' : ''}
                onClick={() => setGalleryMode('shapes')}
              >
                Shapes <span>10</span>
              </button>
              <button
                disabled={!hydrated}
                aria-pressed={galleryMode === 'expressions'}
                className={galleryMode === 'expressions' ? 'selected' : ''}
                onClick={() => setGalleryMode('expressions')}
              >
                Expressions <span>14</span>
              </button>
            </div>
            <span className="gallery-hint">
              Pick a little personality <ArrowUpRight size={14} />
            </span>
          </div>
          <div className={`trait-gallery ${galleryMode}`}>
            {(galleryMode === 'shapes' ? SHAPES : EXPRESSIONS).map((value, index) => (
              <button
                disabled={!hydrated}
                className="gallery-item"
                key={value}
                onClick={() => chooseTrait(value)}
                aria-label={`Use ${value} ${galleryMode === 'shapes' ? 'shape' : 'expression'}`}
              >
                <OpenAvatar
                  name="collection"
                  shape={galleryMode === 'shapes' ? (value as Shape) : 'round'}
                  expression={galleryMode === 'expressions' ? (value as Expression) : 'idle'}
                  color={
                    galleryMode === 'shapes'
                      ? PALETTE[(index + 2) % PALETTE.length]
                      : value === 'mad'
                        ? '#E6AD7E'
                        : value === 'love'
                          ? '#F4B5CC'
                          : value === 'sick'
                            ? '#B9DFA8'
                            : '#BDCE82'
                  }
                  size={112}
                  animate={animate}
                  decorative
                />
                <span>{value}</span>
              </button>
            ))}
          </div>
        </section>
        <section id="docs" className="docs-section shell">
          <div className="section-heading">
            <span className="eyebrow">BUILT TO BELONG ANYWHERE</span>
            <h2>Your app. Their little corner.</h2>
            <p>For sidebars, comment sections, team lists, and everything in between.</p>
          </div>
          <div className="documentation-grid">
            <div className="docs-explanation">
              <BracketsCurly size={28} weight="light" />
              <h3>
                Bring a name.
                <br />
                We’ll bring the character.
              </h3>
              <p>
                Use the React component, generate an SVG in JavaScript, or point an image at the
                API. Everything comes from the same tiny, dependency-free generator.
              </p>
              <div className="docs-facts">
                <span>10 shapes</span>
                <span>14 expressions</span>
                <span>Endless character</span>
              </div>
              <Link href="/docs" className="button-outline">
                Read the documentation <ArrowRight size={16} />
              </Link>
            </div>
            <div className="docs-reference">
              <h3>A few things to know</h3>
              <details open>
                <summary>
                  Same name, same friend <CaretDown size={15} />
                </summary>
                <p>
                  Names are case-sensitive, trimmed, and Unicode-normalized. Shape, expression,
                  color, and proportions are generated consistently. Different names can look
                  similar; uniqueness is not guaranteed.
                </p>
              </details>
              <details>
                <summary>
                  Motion is optional <CaretDown size={15} />
                </summary>
                <p>
                  Pass <code>animate={'{false}'}</code> in React, or <code>animate=false</code> in
                  the URL. Your avatar returns to its resting pose and keeps its expression.
                  Reduced-motion preferences are respected automatically.
                </p>
              </details>
              <details>
                <summary>
                  A little creative control <CaretDown size={15} />
                </summary>
                <p>
                  Override <code>shape</code>, <code>expression</code>, or <code>color</code>{' '}
                  independently. Colors accept six-digit hex values; sizes range from 16 to 1024
                  pixels. Exports have transparent backgrounds.
                </p>
              </details>
              <details>
                <summary>
                  Use the image API <CaretDown size={15} />
                </summary>
                <p>
                  <code>GET /api/v1/avatar?name=someone</code> returns an animated SVG. Add{' '}
                  <code>size</code>, <code>animate</code>, or trait overrides. Encode names and hex
                  colors with <code>URLSearchParams</code>. No authentication required.
                </p>
              </details>
              <details>
                <summary>
                  Run it, remix it, make it yours <CaretDown size={15} />
                </summary>
                <p>
                  The source includes the core library, React component, and this Next.js website.
                  Run <code>npm install</code> and <code>npm run dev</code> at the repository root.
                  Or add avatars directly to your app with <code>npm install openavatars</code>.
                  Import the component from <code>openavatars/react</code>, or use the JavaScript
                  generator.
                </p>
              </details>
            </div>
          </div>
        </section>
        <section id="open-source" className="open-source-section shell">
          <div className="closing-friends">
            <OpenAvatar
              name="see-you"
              shape="round"
              expression="happy"
              color="#BDCE82"
              size={70}
              animate={animate}
              decorative
            />
            <OpenAvatar
              name="soon"
              shape="organic"
              expression="wink"
              color="#C7C5F6"
              size={64}
              animate={animate}
              decorative
            />
          </div>
          <h2>
            A little more human.
            <br />A little less initials.
          </h2>
          <p>Free to use. Open to everyone. Yours to make your own.</p>
          <a
            href="#playground"
            className="button-primary"
            onClick={() => inputRef.current?.focus()}
          >
            Find your avatar <ArrowUpRight size={16} />
          </a>
        </section>
      </main>
      <footer className="site-footer shell">
        <a className="brand" href="#">
          <span>openavatars</span>
          <span className="footer-dot">.</span>
        </a>
        <p>Made for the people behind the usernames.</p>
        <a
          className="footer-github"
          href="https://github.com/lohit101/openavatars"
          target="_blank"
          rel="noreferrer"
          aria-label="OpenAvatars on GitHub · MIT licensed"
        >
          <GithubLogo size={16} weight="fill" aria-hidden="true" /> GitHub · MIT licensed
        </a>
      </footer>
      <div className={`toast ${notice ? 'visible' : ''}`} role="status">
        {notice}
        <button
          disabled={!hydrated}
          onClick={() => setNotice('')}
          aria-label="Dismiss notification"
          tabIndex={notice ? 0 : -1}
        >
          <X size={15} />
        </button>
      </div>
    </>
  );
}
