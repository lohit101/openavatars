import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  GithubLogo,
  LinkSimple,
} from '@phosphor-icons/react/dist/ssr';
import { OpenAvatar } from 'openavatars/react';
import {
  DOC_SECTIONS,
  DOC_GROUPS,
  DOC_NAV,
  SHAPES,
  EXPRESSIONS,
  PALETTE,
  type DocBlock,
} from '../../lib/docs';
import { DocsNavigation } from '../../components/docs/navigation';
import { DocsCodeBlock } from '../../components/docs/code-block';
import { PACKAGE_VERSION } from '../../lib/package';
import './docs.css';

export const metadata: Metadata = {
  title: 'Developer documentation — OpenAvatars',
  description:
    'The complete OpenAvatars developer guide: installation, React and JavaScript integrations, SVG API, animation, accessibility, deployment, releases, maintenance, and troubleshooting.',
};

function TraitGallery({ variant }: { variant: 'shapes' | 'expressions' | 'palette' }) {
  if (variant === 'palette')
    return (
      <ul className="docs-palette" aria-label="Default avatar palette">
        {PALETTE.map((color) => (
          <li key={color}>
            <span style={{ background: color }} />
            <code>{color}</code>
          </li>
        ))}
      </ul>
    );
  const values = variant === 'shapes' ? SHAPES : EXPRESSIONS;
  return (
    <div className={`docs-trait-gallery ${variant}`}>
      {values.map((value, index) => (
        <figure key={value}>
          <OpenAvatar
            name="documentation"
            shape={variant === 'shapes' ? SHAPES[index] : 'round'}
            expression={variant === 'expressions' ? EXPRESSIONS[index] : 'idle'}
            color={variant === 'shapes' ? PALETTE[index % PALETTE.length] : '#BDCE82'}
            size={64}
            animate={false}
            decorative
          />
          <figcaption>{value}</figcaption>
        </figure>
      ))}
    </div>
  );
}
function Block({ block }: { block: DocBlock }) {
  switch (block.kind) {
    case 'paragraph':
      return <p>{block.text}</p>;
    case 'heading':
      return <h3>{block.text}</h3>;
    case 'code':
      return <DocsCodeBlock {...block} />;
    case 'note':
      return (
        <aside className="docs-callout">
          <strong>{block.title}</strong>
          <p>{block.text}</p>
        </aside>
      );
    case 'list':
      return block.ordered ? (
        <ol>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <div className="docs-table-scroll" role="region" tabIndex={0} aria-label={block.label}>
          <table>
            <thead>
              <tr>
                {block.columns.map((column) => (
                  <th scope="col" key={column}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) =>
                    cellIndex === 0 ? (
                      <th scope="row" key={cellIndex}>
                        {cell}
                      </th>
                    ) : (
                      <td key={cellIndex}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'gallery':
      return <TraitGallery variant={block.variant} />;
    case 'link':
      return (
        <a className="docs-resource-link" href={block.href} target="_blank" rel="noreferrer">
          {block.label}
          <ArrowUpRight size={14} />
        </a>
      );
  }
}
export default function DocumentationPage() {
  return (
    <div className="documentation-page">
      <a href="#docs-content" className="skip-link">
        Skip to documentation
      </a>
      <header className="docs-site-header">
        <div className="docs-header-inner">
          <Link className="brand" href="/" aria-label="OpenAvatars home">
            <OpenAvatar
              name="openavatars"
              shape="round"
              expression="idle"
              color="#BDCE82"
              size={32}
              animate={false}
              decorative
            />
            <span>openavatars</span>
          </Link>
          <span className="docs-header-divider" aria-hidden="true">
            /
          </span>
          <span className="docs-header-label">Documentation</span>
          <nav aria-label="Main navigation">
            <Link href="/" className="docs-back-link">
              <ArrowLeft size={14} /> Playground
            </Link>
            <a
              href="https://github.com/lohit101/openavatars"
              className="docs-github-link"
              target="_blank"
              rel="noreferrer"
              aria-label="OpenAvatars on GitHub"
            >
              <GithubLogo size={19} weight="fill" />
              <span>GitHub</span>
              <ArrowUpRight size={13} />
            </a>
          </nav>
        </div>
      </header>
      <div className="docs-layout">
        <DocsNavigation items={DOC_NAV} groups={DOC_GROUPS} />
        <main id="docs-content" className="docs-content">
          <div className="docs-introduction">
            <div>
              <span className="docs-kicker">
                OPENAVATARS / DEVELOPER GUIDE / v{PACKAGE_VERSION}
              </span>
              <h1>
                A little character.
                <br />A few lines of code.
              </h1>
              <p>Everything you need to give the people in your app a face of their own.</p>
              <div className="docs-intro-links">
                <a href="#installation">
                  Get started <ArrowRight size={15} />
                </a>
                <a href="#http-api">
                  Use the SVG API <ArrowUpRight size={14} />
                </a>
                <a href="#releases">
                  Releases & maintenance <ArrowRight size={15} />
                </a>
              </div>
            </div>
            <div className="docs-intro-avatar">
              <OpenAvatar
                name="docs-friend"
                shape="boxy"
                expression="happy"
                color="#BDCE82"
                size={100}
                animate={false}
                decorative
              />
            </div>
          </div>
          {DOC_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              data-doc-section
              aria-labelledby={`${section.id}-title`}
              className="docs-article-section"
            >
              <div className="docs-section-title">
                <h2 id={`${section.id}-title`} tabIndex={-1}>
                  {section.title}
                </h2>
                <a href={`#${section.id}`} aria-label={`Link to ${section.title}`}>
                  <LinkSimple size={17} />
                </a>
              </div>
              <p className="docs-section-description">{section.description}</p>
              {section.blocks.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </section>
          ))}
          <footer className="docs-page-footer">
            <div>
              <span>Still have a question?</span>
              <a
                href="https://github.com/lohit101/openavatars/issues"
                target="_blank"
                rel="noreferrer"
              >
                Let’s work it out on GitHub <ArrowUpRight size={14} />
              </a>
            </div>
            <a href="#overview">Back to top ↑</a>
          </footer>
        </main>
      </div>
    </div>
  );
}
