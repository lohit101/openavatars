import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement, Fragment } from 'react';
import { renderToString } from 'react-dom/server';
import { OpenAvatar } from '../src/index.js';

test('identical avatars have unique SVG IDs within the same React tree', () => {
  const html = renderToString(
    createElement(
      Fragment,
      null,
      ...Array.from({ length: 3 }, (_, i) =>
        createElement(OpenAvatar, { key: i, name: 'same-name' }),
      ),
    ),
  );
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size);
});
test('React supports accessible labels, decorative mode, and static poses', () => {
  const html = renderToString(
    createElement(OpenAvatar, {
      name: 'fern',
      animate: false,
      label: 'Fern’s profile',
      decorative: true,
      size: 32,
    }),
  );
  assert.ok(html.includes('aria-hidden="true"'));
  assert.ok(html.includes('Fern’s profile'));
  assert.ok(html.includes('width="32"'));
  assert.ok(!html.includes('@keyframes'));
});
