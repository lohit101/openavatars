import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, encoding: 'utf8', maxBuffer: 8e6 });
  if (result.status !== 0)
    throw new Error(`${cmd} ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
run(process.execPath, ['scripts/pack-package.mjs'], root);
const [manifest] = JSON.parse(await readFile(root + 'artifacts/npm/pack-manifest.json', 'utf8'));
const tarball = path.join(root, 'artifacts/npm', manifest.filename);
const paths = manifest.files.map((f) => f.path);
for (const required of [
  'README.md',
  'LICENSE',
  'package.json',
  'dist/index.js',
  'dist/index.d.ts',
  'dist/react.js',
  'dist/react.d.ts',
  'dist/cjs/index.js',
  'dist/cjs/index.d.ts',
  'dist/cjs/react.js',
  'dist/cjs/react.d.ts',
  'dist/cjs/package.json',
])
  assert.ok(paths.includes(required), `Missing ${required}`);
assert.ok(
  paths.every((p) => p.startsWith('dist/') || ['README.md', 'LICENSE', 'package.json'].includes(p)),
  'Unexpected file in public package',
);
const results = [];
const fixture = await mkdtemp(path.join(tmpdir(), 'openavatars-consumer-'));
try {
  await writeFile(
    path.join(fixture, 'package.json'),
    JSON.stringify({ name: 'openavatars-consumer', private: true, type: 'module' }),
  );
  run('npm', ['install', tarball, '--ignore-scripts', '--no-audit', '--no-fund'], fixture);
  const installed = path.join(fixture, 'node_modules/openavatars');
  for (const f of ['dist/react.js', 'dist/cjs/react.js'])
    assert.match(
      await readFile(path.join(installed, f), 'utf8'),
      /^(?:['"]use strict['"];\s*)?['"]use client['"]/,
    );
  await writeFile(
    path.join(fixture, 'core.mjs'),
    `import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { generateAvatar, renderAvatarSvg, AvatarValidationError } from 'openavatars';
const require = createRequire(import.meta.url);
assert.throws(() => require.resolve('react'), {code: 'MODULE_NOT_FOUND'});
const cjs = require('openavatars');
assert.deepEqual(generateAvatar('café'), cjs.generateAvatar('cafe\\u0301'));
assert.equal(generateAvatar('lohit').seed, 1213279760);
assert.equal(renderAvatarSvg('jamie'), cjs.renderAvatarSvg('jamie'));
assert.ok(!renderAvatarSvg('jamie', {animate:false}).includes('<style>'));
assert.throws(() => renderAvatarSvg(''), AvatarValidationError);
assert.equal(require('openavatars/package.json').version, '${manifest.version}');
`,
  );
  run(process.execPath, ['core.mjs'], fixture);
  results.push('ESM and CommonJS generator with no React installed');
  const reactTest = `import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createElement, Fragment } from 'react';
import { renderToString } from 'react-dom/server';
import { OpenAvatar } from 'openavatars/react';
const require = createRequire(import.meta.url);
const html = renderToString(createElement(Fragment, null,
 createElement(OpenAvatar, {name:'jamie',animate:false,label:'Jamie profile'}),
 createElement(OpenAvatar, {name:'jamie',animate:false,decorative:true})));
const ids = [...html.matchAll(/\\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size);
assert.ok(html.includes('Jamie profile'));
assert.ok(html.includes('aria-hidden="true"'));
assert.ok(!html.includes('@keyframes'));
assert.ok(renderToString(createElement(require('openavatars/react').OpenAvatar,{name:'jamie'})).includes('<svg'));
`;
  await writeFile(path.join(fixture, 'react.mjs'), reactTest);
  for (const major of [18, 19]) {
    run(
      'npm',
      [
        'install',
        `react@${major}`,
        `react-dom@${major}`,
        `@types/react@${major}`,
        `@types/react-dom@${major}`,
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
      ],
      fixture,
    );
    run(process.execPath, ['react.mjs'], fixture);
    results.push(`React ${major}: ESM/CJS server rendering, labels, static mode, unique IDs`);
  }
  const ts = `import {generateAvatar, type AvatarOptions} from 'openavatars';
import {OpenAvatar, type OpenAvatarProps} from 'openavatars/react';
import {createElement} from 'react';
const options: AvatarOptions = {expression:'wink', animate:false};
const props: OpenAvatarProps = {name:'jamie',...options};
createElement(OpenAvatar,props);
generateAvatar('jamie', options);
// @ts-expect-error Invalid expression must remain rejected in the published declarations.
generateAvatar('jamie', {expression:'not-an-expression'});
`;
  await writeFile(path.join(fixture, 'consumer.mts'), ts);
  await writeFile(path.join(fixture, 'consumer.cts'), ts);
  for (const resolution of ['NodeNext', 'Bundler']) {
    run(
      process.execPath,
      [
        root + 'node_modules/typescript/bin/tsc',
        '--noEmit',
        '--strict',
        '--skipLibCheck',
        'false',
        '--target',
        'ES2022',
        '--module',
        resolution === 'NodeNext' ? 'NodeNext' : 'ESNext',
        '--moduleResolution',
        resolution,
        'consumer.mts',
        ...(resolution === 'NodeNext' ? ['consumer.cts'] : []),
      ],
      fixture,
    );
    results.push(`TypeScript ${resolution}: published declarations and invalid-option rejection`);
  }
  await writeFile(
    root + 'artifacts/npm/consumer-verification.json',
    JSON.stringify(
      {
        package: manifest.name,
        version: manifest.version,
        tarball: manifest.filename,
        files: paths,
        checks: results,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`Verified ${manifest.filename}\n${results.map((s) => '✓ ' + s).join('\n')}`);
} finally {
  await rm(fixture, { recursive: true, force: true });
}
