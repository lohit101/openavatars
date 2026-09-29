import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  AvatarValidationError,
  EXPRESSIONS,
  PALETTE,
  SHAPES,
  generateAvatar,
  normalizeName,
  renderAvatarSvg,
} from '../src/index.js';

test('v1 identity stays stable across releases', () => {
  assert.deepEqual(generateAvatar('lohit'), {
    version: 1,
    name: 'lohit',
    seed: 1213279760,
    shape: 'nub',
    expression: 'sad',
    color: '#F4B5CC',
    size: 128,
    animate: true,
    geometry: {
      width: 0.971,
      height: 1.02,
      tilt: 4.174,
      eyeGap: 23.669,
      eyeSize: 0.914,
      eyeTilt: 2.988,
    },
  });
  assert.equal(renderAvatarSvg('lohit'), renderAvatarSvg('lohit'));
});
test('canonical Unicode and surrounding whitespace share an identity; case is preserved', () => {
  assert.deepEqual(generateAvatar('  cafe\u0301  '), generateAvatar('café'));
  assert.notEqual(generateAvatar('Alex').seed, generateAvatar('alex').seed);
  assert.equal(normalizeName(' 🪴 '), '🪴');
  assert.doesNotThrow(() => generateAvatar('🪴'.repeat(256)));
  assert.throws(() => generateAvatar('🪴'.repeat(257)), AvatarValidationError);
});
test('overrides preserve unrelated generated traits', () => {
  const base = generateAvatar('yuki');
  assert.deepEqual(generateAvatar('yuki', { shape: 'round' }), { ...base, shape: 'round' });
  assert.deepEqual(generateAvatar('yuki', { expression: 'love' }), { ...base, expression: 'love' });
  assert.deepEqual(generateAvatar('yuki', { color: '#aabbcc' }), { ...base, color: '#AABBCC' });
  assert.deepEqual(generateAvatar('yuki', { animate: false, size: 32 }), {
    ...base,
    animate: false,
    size: 32,
  });
});
test('invalid options and SVG identifiers are rejected', () => {
  for (const name of ['', '  ', 'x'.repeat(257)])
    assert.throws(() => generateAvatar(name), AvatarValidationError);
  for (const size of [0, 15, 1025, 1.5, NaN, Infinity])
    assert.throws(() => generateAvatar('x', { size }), AvatarValidationError);
  for (const color of ['red', '#fff', 'url(https://example.com)', '"/><script/>', '#xyzxyz'])
    assert.throws(() => generateAvatar('x', { color }), AvatarValidationError);
  assert.throws(() => generateAvatar('x', { shape: 'unknown' as never }), AvatarValidationError);
  assert.throws(
    () => generateAvatar('x', { expression: 'unknown' as never }),
    AvatarValidationError,
  );
  assert.throws(() => generateAvatar('x', { animate: 'false' as never }), AvatarValidationError);
  assert.throws(() => renderAvatarSvg('x', { idPrefix: '"/>' }), AvatarValidationError);
});
test('SVG escapes labels and does not embed executable or external content', () => {
  const svg = renderAvatarSvg('<script>alert("x")</script>');
  assert.ok(svg.includes('&lt;script&gt;'));
  assert.ok(renderAvatarSvg('invalid\u0000xml\uD800').includes('invalid\uFFFDxml\uFFFD'));
  assert.ok(renderAvatarSvg('🪴').includes('🪴'));
  assert.ok(!svg.includes('<script>'));
  assert.ok(!/href=|onload=|foreignObject|@import/.test(svg));
  assert.ok(renderAvatarSvg('x', { title: '<unsafe>&"' }).includes('&lt;unsafe&gt;&amp;&quot;'));
});
test('static avatars retain their expression and geometry but contain no motion', () => {
  const a = generateAvatar('june', { expression: 'wink' });
  assert.deepEqual(generateAvatar('june', { expression: 'wink', animate: false }), {
    ...a,
    animate: false,
  });
  const svg = renderAvatarSvg('june', { expression: 'wink', animate: false });
  assert.ok(!svg.includes('<style>'));
  assert.ok(!svg.includes('@keyframes'));
  assert.ok(svg.includes('oa-lid'));
});
test('every shape and expression produces self-contained SVG with valid references', () => {
  const signatures = new Set<string>();
  for (const shape of SHAPES)
    for (const expression of EXPRESSIONS) {
      const svg = renderAvatarSvg('matrix', { shape, expression, color: PALETTE[0] });
      const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
      assert.equal(ids.length, new Set(ids).size);
      for (const [, ref] of svg.matchAll(/url\(#([^)]*)\)/g))
        assert.ok(ids.includes(ref), `${shape}/${expression}: ${ref}`);
      assert.ok(svg.includes('prefers-reduced-motion:reduce'));
      signatures.add(createHash('sha256').update(svg).digest('hex'));
    }
  assert.equal(signatures.size, 140);
});
test('a realistic name corpus covers the full trait sets', () => {
  const avatars = Array.from({ length: 1000 }, (_, i) => generateAvatar(`user-${i}`));
  assert.equal(new Set(avatars.map((a) => a.shape)).size, SHAPES.length);
  assert.equal(new Set(avatars.map((a) => a.expression)).size, EXPRESSIONS.length);
  assert.equal(new Set(avatars.map((a) => a.color)).size, PALETTE.length);
  assert.equal(new Set(avatars.map((a) => JSON.stringify(a.geometry))).size, 1000);
});
