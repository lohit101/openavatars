# Releasing openavatars

The only public package is **openavatars**, from `packages/core`. It includes the root generator and `openavatars/react`. The repository, website, and legacy React compatibility adapter are private npm workspaces.

## Prepare an archive

Requires Node.js 22+ and npm in the repository checkout:

```sh
npm ci
npm run release:check
npm run pack:package
```

`release:check` runs lint, types, unit tests, the production site build, and isolated consumer checks against the actual npm tarball. Those checks cover:

- The published file allowlist, MIT license, README, ESM/CJS entry points, and declarations.
- JavaScript and CommonJS consumers without React installed.
- React 18 and 19 server rendering, accessible labels, static output, and repeated SVG IDs.
- The preserved Next.js `use client` boundary.
- TypeScript NodeNext import/require and bundler resolution.

The archive, file manifest, and consumer verification report are in `artifacts/npm`. `npm pack` and `npm publish` rebuild the package, so stale `dist` output is not shipped. Installing the archive requires no build scripts.

## Publish a release

Authenticate in your own terminal; do not commit credentials or put them in repository files:

```sh
npm login
npm whoami
npm view openavatars version --registry=https://registry.npmjs.org/
```

A registry 404 means no public package was returned; npm still makes the final decision about name availability when publishing. If a package already exists, check ownership before proceeding. `openavatars@0.1.0` is already public under the lohit101 npm account. For a new version, update the package version before publishing.

```sh
npm run release:publish
```

This command reruns the release checks, then publishes only the `openavatars` workspace with public access. Complete npm's authentication/2FA prompts in the terminal. It does not publish the website or require an `@openavatars` organization.

Verify the registry release from a separate directory:

```sh
npm view openavatars@0.1.0 version dist.integrity
npm install openavatars@0.1.0
```

After verification, update the package version references in the documentation and deploy the updated site. The website links to the public npm package. Keep any release announcements consistent with the version confirmed by the registry.

## Subsequent versions

1. Update `packages/core/package.json` and the website/compatibility adapter's dependency versions together. Keep the v1 identity algorithm stable.
2. Run `npm install --package-lock-only`, update examples and release notes, then run `npm run release:check` and the browser tests.
3. Commit the reviewed changes and create the matching `vX.Y.Z` tag. A published name/version cannot be reused.
4. Publish through the authenticated CLI, or use the trusted workflow below.

`npm run release:publish` is a publishing command, not a dry run. Use `npm run pack:package` to inspect the release without publishing.

## Trusted publishing through GitHub Actions

After the initial release, configure a trusted publisher on npm for:

- Organization/user: `lohit101`
- Repository: `openavatars`
- Workflow: `publish.yml`

The checked-in workflow is **manual**. Run it for an existing `vX.Y.Z` tag that matches the package version. It verifies the version, runs checks, and publishes through npm's GitHub OIDC integration with provenance. No repository token secret is needed. Configure the npm trusted publisher before using this workflow.

References: [npm publication](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/), [trusted publishers](https://docs.npmjs.com/trusted-publishers/), and [package metadata](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/).
