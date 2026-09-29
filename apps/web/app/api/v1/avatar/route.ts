import { createHash } from 'node:crypto';
import {
  AvatarValidationError,
  renderAvatarSvg,
  type AvatarOptions,
  type Shape,
  type Expression,
} from 'openavatars';

export const runtime = 'nodejs';
const allowed = new Set(['name', 'size', 'animate', 'shape', 'expression', 'color']);
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Expose-Headers': 'ETag',
};
export function GET(request: Request): Response {
  try {
    const params = new URL(request.url).searchParams;
    for (const key of params.keys()) {
      if (!allowed.has(key)) throw new AvatarValidationError(`Unknown parameter: ${key}`);
      if (params.getAll(key).length > 1)
        throw new AvatarValidationError(`Duplicate parameter: ${key}`);
    }
    const name = params.get('name');
    if (name === null) throw new AvatarValidationError('name is required.');
    const options: AvatarOptions = {};
    if (params.has('size')) {
      const size = params.get('size')!;
      if (!/^\d+$/.test(size))
        throw new AvatarValidationError('size must be an integer from 16 to 1024.');
      options.size = Number(size);
    }
    if (params.has('animate')) {
      const animate = params.get('animate');
      if (animate !== 'true' && animate !== 'false')
        throw new AvatarValidationError('animate must be true or false.');
      options.animate = animate === 'true';
    }
    if (params.has('shape')) options.shape = params.get('shape') as Shape;
    if (params.has('expression')) options.expression = params.get('expression') as Expression;
    if (params.has('color')) options.color = params.get('color')!;
    const svg = renderAvatarSvg(name, options);
    const etag = `"${createHash('sha256').update(svg).digest('hex')}"`;
    const headers = {
      ...cors,
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
      ETag: etag,
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    };
    const matches = request.headers
      .get('If-None-Match')
      ?.split(',')
      .some((v) => v.trim().replace(/^W\//, '') === etag || v.trim() === '*');
    return new Response(matches ? null : svg, { status: matches ? 304 : 200, headers });
  } catch (error) {
    if (error instanceof AvatarValidationError)
      return Response.json(
        { error: error.message },
        { status: 400, headers: { ...cors, 'Cache-Control': 'no-store' } },
      );
    throw error;
  }
}
export function HEAD(request: Request): Response {
  const response = GET(request);
  return new Response(null, { status: response.status, headers: response.headers });
}
export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: cors });
}
