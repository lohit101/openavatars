# Releasing openavatars

The only public npm package is **openavatars**, from `packages/core`. It includes the root generator and the optional `openavatars/react` component. The root workspace, website, and legacy React compatibility adapter are private.

**Pushing commits or tags to GitHub does not publish to npm.** Publication happens only when a maintainer runs `npm run release:publish` or manually starts the **Publish openavatars** workflow. Website deployment is a separate hosting action.

## Decide whether an npm release is needed

Changes to the generator, React component, package exports, declarations, bundled license, or `packages/core/README.md` need a new npm version to reach installed consumers. A published name/version cannot be overwritten.

Website, root documentation, and CI changes can be committed and deployed without an npm release when the package archive is unchanged. Record those changes under **Unreleased** in [CHANGELOG.md](CHANGELOG.md); do not invent an npm release for a repository update.

Use patch versions for compatible fixes, minor versions for compatible additions, and major versions for breaking public API changes. The npm package version is separate from the generation algorithm's `version: 1` and the `/api/v1/avatar` route. Preserve the v1 mapping across compatible releases. Changes to normalization, hashing, random-value order, trait lists, or geometry can change existing avatars; intentional identity changes need explicit algorithm versioning and migration guidance. A new npm version does not itself version the HTTP endpoint.

## Prepare the release

Use Node.js 22+ and run commands from the repository root.

1. Update the public version in `packages/core/package.json`.
2. Set `apps/web/package.json`'s `openavatars` dependency to that exact version. Update `packages/react/package.json`'s `openavatars` dependency range to start at that version, preserving its `^` range. The private workspaces' own version fields do not need to match the public package.
3. Run `npm install` to update `package-lock.json` and workspace links. Include the lockfile with the manifest changes.
4. Update examples and version-specific documentation. Move package changes from **Unreleased** into a dated version entry in [CHANGELOG.md](CHANGELOG.md). Review these changes before creating the release commit and tag.

The website's version labels and archive examples read the public package manifest automatically. Review its upgrade guidance and release links when changing the package; do not add another hardcoded version to the site.

Then prepare and inspect the archive:

```sh
npm run release:check
npm run pack:package
```

`release:check` runs lint, types, unit tests, the production site build, and isolated consumer checks against the real npm archive. It checks:

- The published file allowlist, MIT license, README, ESM/CommonJS exports, and declarations.
- JavaScript and CommonJS consumers without React installed.
- React 18 and 19 server rendering, accessible labels, static output, and repeated SVG IDs.
- The Next.js `use client` boundary.
- TypeScript NodeNext import/require and bundler resolution.

The archive, contents manifest, and consumer report are written to the ignored `artifacts/npm` directory. The archive filename follows the public package version. `npm pack` and `npm publish` rebuild the package; installing the archive requires no build scripts.

## Verify the release commit in CI

**`release:check` and `release:publish` do not run browser tests.** Before tagging or publishing, push the reviewed release commit and confirm both jobs in **Check OpenAvatars** pass for that exact commit:

| Job      | Platform                 | Checks                                                                            |
| -------- | ------------------------ | --------------------------------------------------------------------------------- |
| `check`  | Ubuntu 24.04, Node.js 22 | Lint, types, unit tests, production build, archive consumers, full Chromium suite |
| `webkit` | macOS 15, Node.js 22     | Production build and full WebKit suite, including animated SVG inside `<img>`     |

CI starts the built production server for browser tests. Reproduce a browser job with a production build first:

```sh
# Ubuntu: Chromium
npm ci
npm run build
npx playwright install --with-deps chromium
CI=true npm run test:e2e -- --project=chromium
```

```sh
# macOS: WebKit / Safari coverage
npm ci
npm run build
npx playwright install webkit
CI=true npm run test:e2e -- --project=webkit
```

Use macOS for the project's Safari release gate. Read [CONTRIBUTING.md](CONTRIBUTING.md) for local development and browser platform details. Both suites retain their animation assertions. CI uploads `visual-review-chromium` and `visual-review-webkit` artifacts containing review screenshots and failure traces when present. Inspect the failing test, screenshot, and trace before changing behavior or assertions.

After both jobs pass, confirm `HEAD` is that reviewed commit, then create and push an annotated release tag:

```sh
release_version=$(node -p "require('./packages/core/package.json').version")
git tag -a "v$release_version" -m "openavatars $release_version"
git push origin "v$release_version"
```

Any change after verification needs a new reviewed commit and checks. Do not move a published release tag.

## Publish using the CLI

Authenticate in your terminal using the npm account authorized to publish `openavatars`:

```sh
npm login
npm whoami
npm view openavatars version --registry=https://registry.npmjs.org/
npm run release:publish
```

Complete npm's authentication or 2FA prompts. Keep credentials out of repository files. The command reruns the non-browser release checks and publishes only the public `openavatars` workspace. It is a publishing command, not a dry run; use `npm run pack:package` for archive inspection.

## Or use trusted GitHub Actions publishing

Configure a trusted publisher on npm before using the workflow:

- Organization/user: `lohit101`
- Repository: `openavatars`
- Workflow: `publish.yml`

In GitHub Actions, manually start **Publish openavatars** and supply the existing `vX.Y.Z` release tag. The workflow accepts stable numeric tags only, requires the tag to match `packages/core/package.json`, runs `release:check`, and publishes with provenance using npm's GitHub OIDC integration. It uses Node.js 24 and does not need a repository npm token secret.

The publishing workflow does not run E2E tests or enforce the separate CI jobs automatically. Confirm both CI jobs passed for the tagged commit before starting it. Use either the CLI or this workflow for a version; a second publication of the same version will fail.

## Verify the published version

From the repository root, read the prepared version and verify that exact release. Install it in a fresh directory outside the workspace so local package links cannot mask a registry problem:

```sh
release_version=$(node -p "require('./packages/core/package.json').version")
npm view "openavatars@$release_version" version dist.integrity --registry=https://registry.npmjs.org/
consumer_dir=$(mktemp -d)
npm --prefix "$consumer_dir" install --ignore-scripts "openavatars@$release_version" --registry=https://registry.npmjs.org/
cd "$consumer_dir"
node --input-type=module -e "import { renderAvatarSvg } from 'openavatars'; console.log(renderAvatarSvg('release-check', { animate: false }).startsWith('<svg'));"
```

The final command should print `true`. Confirm the registry version matches the release tag, then create the GitHub release from the reviewed changelog entry and deploy the updated website. Announcements should name the version confirmed by the registry. The npm README changes with a newly published package; website documentation changes with a website deployment.

References: [npm publication](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/), [trusted publishers](https://docs.npmjs.com/trusted-publishers/), and [package metadata](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/).
