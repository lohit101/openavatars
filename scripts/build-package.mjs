import { spawnSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = new URL('../packages/core/', import.meta.url);
await rm(new URL('dist/', pkg), { recursive: true, force: true });
for (const extra of [
  [],
  ['--module', 'CommonJS', '--moduleResolution', 'Node', '--outDir', 'dist/cjs'],
]) {
  const result = spawnSync(
    process.execPath,
    [root + 'node_modules/typescript/bin/tsc', '-p', 'tsconfig.json', ...extra],
    { cwd: fileURLToPath(pkg), stdio: 'inherit' },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
await mkdir(new URL('dist/cjs/', pkg), { recursive: true });
await writeFile(new URL('dist/cjs/package.json', pkg), '{"type":"commonjs"}\n');
