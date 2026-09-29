import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(root + 'artifacts/npm', { recursive: true });
const result = spawnSync(
  'npm',
  ['pack', '-w', 'openavatars', '--pack-destination', root + 'artifacts/npm', '--json'],
  { cwd: root, encoding: 'utf8' },
);
if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}
// Lifecycle build output goes to stderr on current npm; the package manifest is JSON.
const start = result.stdout.indexOf('[\n');
const packed = JSON.parse(result.stdout.slice(start < 0 ? 0 : start));
await writeFile(root + 'artifacts/npm/pack-manifest.json', JSON.stringify(packed, null, 2) + '\n');
console.log(
  `Packed ${packed[0].filename}: ${packed[0].entryCount} files, ${packed[0].size} bytes compressed.`,
);
