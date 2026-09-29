import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderAvatarSvg } from 'openavatars';
import { GET, HEAD, OPTIONS } from './route.js';
const request = (query: string, headers?: HeadersInit) =>
  new Request(`http://localhost/api/v1/avatar?${query}`, { headers });
test('API output is identical to library output', async () => {
  const response = GET(
    request('name=fern&shape=cloud&expression=happy&color=%23AABBCC&animate=false&size=64'),
  );
  assert.equal(response.status, 200);
  assert.equal(
    await response.text(),
    renderAvatarSvg('fern', {
      shape: 'cloud',
      expression: 'happy',
      color: '#AABBCC',
      animate: false,
      size: 64,
    }),
  );
  assert.match(response.headers.get('Content-Type')!, /image\/svg\+xml/);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
  assert.match(response.headers.get('Cache-Control')!, /s-maxage/);
});
test('conditional requests and HEAD do not send image bodies', async () => {
  const response = GET(request('name=fern'));
  const etag = response.headers.get('ETag')!;
  for (const tag of [etag, `W/${etag}`, `"other", ${etag}`, '*']) {
    const cached = GET(request('name=fern', { 'If-None-Match': tag }));
    assert.equal(cached.status, 304);
    assert.equal(await cached.text(), '');
  }
  assert.equal(await HEAD(request('name=fern')).text(), '');
  assert.equal(OPTIONS().status, 204);
});
test('malformed parameters return useful uncached errors', async () => {
  for (const query of [
    '',
    'name=',
    'name=x&size=0',
    'name=x&size=1.5',
    'name=x&animate=no',
    'name=x&shape=no',
    'name=x&expression=no',
    'name=x&color=red',
    'name=x&name=y',
    'name=x&unknown=true',
    `name=${'x'.repeat(257)}`,
  ]) {
    const response = GET(request(query));
    assert.equal(response.status, 400, query);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(typeof (await response.json()).error, 'string');
  }
});
