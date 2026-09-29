'use client';

import { useEffect, useRef, useState } from 'react';
import { MagnifyingGlass, List, X, ArrowUpRight, GithubLogo } from '@phosphor-icons/react';

type NavigationItem = {
  id: string;
  title: string;
  group: string;
  description: string;
  searchText: string;
};
export function DocsNavigation({ items, groups }: { items: NavigationItem[]; groups: string[] }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('overview');
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = items.filter((item) => terms.every((term) => item.searchText.includes(term)));

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-doc-section]'));
    const observer = new IntersectionObserver(
      () => {
        const current = sections.find((section) => section.getBoundingClientRect().bottom > 160);
        if (current) setActive(current.id);
      },
      { rootMargin: '-160px 0px -50% 0px', threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function select(id: string) {
    setActive(id);
    setOpen(false);
    if (window.matchMedia('(max-width: 900px)').matches) {
      document.getElementById(`${id}-title`)?.focus({ preventScroll: true });
    }
  }
  return (
    <aside className="docs-sidebar" aria-label="Documentation navigation">
      <button
        ref={mobileToggle}
        type="button"
        className="docs-mobile-toggle"
        aria-expanded={open}
        aria-controls="docs-menu"
        onClick={() => setOpen(!open)}
      >
        <List size={17} />
        <span>Documentation menu</span>
        {open ? (
          <X size={16} />
        ) : (
          <span className="docs-mobile-current">
            {items.find((item) => item.id === active)?.title}
          </span>
        )}
      </button>
      <div
        id="docs-menu"
        className={`docs-menu ${open ? 'is-open' : ''}`}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && open) {
            setOpen(false);
            mobileToggle.current?.focus();
          }
        }}
      >
        <div className="docs-search">
          <MagnifyingGlass size={16} />
          <input
            ref={input}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search docs…"
            aria-label="Search documentation"
            aria-controls="docs-nav-results"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                input.current?.focus();
              }}
              aria-label="Clear documentation search"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <div className="docs-result-count" role="status">
          {query
            ? `${results.length} ${results.length === 1 ? 'section' : 'sections'} found`
            : 'DEVELOPER GUIDE'}
        </div>
        <nav id="docs-nav-results" aria-label="Documentation sections">
          {groups.map((group) => {
            const matching = results.filter((item) => item.group === group);
            if (!matching.length) return null;
            return (
              <div className="docs-nav-group" key={group}>
                <h2>{group}</h2>
                {matching.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => select(item.id)}
                    aria-current={active === item.id ? 'location' : undefined}
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            );
          })}
          {results.length === 0 && (
            <p className="docs-empty-search">
              No matching sections. Try “animation”, “React”, or “color”.
            </p>
          )}
        </nav>
        <a
          className="docs-sidebar-source"
          href="https://github.com/lohit101/openavatars"
          target="_blank"
          rel="noreferrer"
        >
          <GithubLogo size={17} weight="fill" /> View on GitHub <ArrowUpRight size={13} />
        </a>
      </div>
    </aside>
  );
}
