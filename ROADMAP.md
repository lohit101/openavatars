# OpenAvatars roadmap

**Expressive eyes. Recognizable characters. Easy integration.**

OpenAvatars turns a name into a small character that feels at home in an app, dashboard, or community. The next releases should give those characters more personality, make them portable, and keep them dependable as the package grows. Preserve the soft shapes and eyes-only faces that define the project.

This is a planning document. Every milestone below is **planned**; version targets describe an intended sequence, with no promised dates. Scope and ordering can change through contributor discussion. Use the [README](README.md) for supported features, the [changelog](CHANGELOG.md) for shipped changes, and the [release guide](RELEASING.md) for publishing.

## What is available today

The current public package is `openavatars@0.1.0`:

- A deterministic SVG generator with zero runtime dependencies, ESM/CommonJS exports, and TypeScript declarations.
- Ten shapes, fourteen eye expressions, twelve pastel colors, and seeded geometry variations. Shape, expression, and color overrides are already supported.
- Seeded blinking, subtle breathing, gaze shifts, and blink-synchronized body movement. `animate: false` gives a resting pose; reduced-motion preferences are respected.
- An optional `openavatars/react` component supporting React 18/19 and server rendering.
- A live playground, developer documentation, a self-hostable SVG HTTP endpoint, and transparent SVG downloads.
- Unit tests, isolated npm archive consumer checks, and Chromium/WebKit browser suites.

The same normalized name and generation settings reproduce the same character. Different names can share an appearance.

## Milestones at a glance

| Priority         | Tentative target                           | Focus                                                                     | Completion signal                                                                   |
| ---------------- | ------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Now**          | **0.1.x — Reliable foundation**            | Browser reliability, identity fixtures, release gates, useful bug reports | Both browser jobs pass for the release commit; default v1 identities remain stable  |
| **Next**         | **0.2 — Personality and reactions**        | Opt-in motion profiles, expression transitions, bounded gaze              | Reactions preserve the character; motion controls, small sizes, and SSR work        |
| **Next**         | **0.3 — Portable characters and branding** | Versioned recipes, playground save/restore, curated palettes              | Saved characters reproduce across integrations without changing existing defaults   |
| **Later**        | **0.4 — Exports and adoption**             | Static PNG, backgrounds, batch tools, framework examples                  | Useful exports and working integrations verified against the published package      |
| **Later**        | **New collections and community tools**    | More silhouettes and eyes, a showcase, demand-led integrations            | New collections are explicit choices and meet visual and compatibility requirements |
| **Release gate** | **1.0 — Stable developer contract**        | Compatibility, support, migration, and performance policies               | Documented contracts and dependable releases, supported by consumer tests           |

## Now: 0.1.x — Reliable foundation

**Purpose:** Make maintenance predictable before expanding the character system. This work supports every later milestone.

Work to take on:

- Confirm the current WebKit environment fixes in GitHub Actions and keep the real embedded SVG animation assertions enabled. Collect a reproduction and trace for any remaining failure.
- Expand v1 identity fixtures across Unicode names, overrides, and representative shape/expression combinations. Record resting output as well as resolved traits.
- Add hydration coverage for repeated names and multiple React roots, including coordinated SVG IDs.
- Make the manual publishing workflow require successful application, archive-consumer, Chromium, and WebKit checks for the **exact tagged commit**. It currently relies on the maintainer checking the separate browser jobs.
- Add bug-report forms asking for package/browser versions, rendering method, motion preference, and a minimal reproduction. Track package regressions separately from website failures.

**Done when:** Both browser suites pass for the proposed release commit, identity fixtures are unchanged by compatible fixes, and the publishing workflow rejects a commit without the required successful checks. Update the release guide alongside the gate. Publication remains an intentional action.

**Starting contributions:** Reproduce a browser issue, add a Unicode identity fixture, document a multiple-root example, or propose a bug-report form. Avoid changing accessibility behavior to make an animation test pass.

## Next: 0.2 — Personality and reactions

**Purpose:** Give familiar characters a recognizable temperament and let apps express moments such as success, welcome, or uncertainty through their eyes.

Work to take on:

- Design opt-in **calm, curious, and playful** motion profiles through blink rhythm, gaze, and restrained body movement. Keep the existing default motion intact.
- Add smooth transitions between eye expressions and a way to restore the assigned expression after a temporary reaction.
- Explore optional, bounded gaze responses for interactive avatars. Establish comfortable limits for movement before exposing controls.
- Pause interactive animation when an avatar is outside the viewport, with cleanup when the component unmounts.
- Put runtime interaction in an optional integration. Keep generated SVGs self-contained and script-free.

**Dependencies:** The foundation's identity and hydration coverage. First establish package-size and avatar-list performance baselines using the maintenance process below.

**Done when:** Reactions preserve the selected shape, color, and body geometry; personality timing uses a separate deterministic seed namespace; and existing default fixtures remain unchanged. Motion-off and reduced-motion modes show the assigned expression at rest. The adapter hydrates reliably, cleans up interaction work, and remains readable at 16–32 pixels. Document how transitions behave in the interactive adapter versus standalone SVG images.

**Starting contributions:** Sketch eye-only reaction sequences, review small-size expressions, build a focused transition prototype, or measure the cost of a list of avatars. Discuss the proposed interaction API before implementing it. Names above describe planned capabilities, not currently supported props.

## Next: 0.3 — Portable characters and branding

**Purpose:** Let a user keep a chosen character across apps and let a product fit avatars into its visual identity.

Work to take on:

- Design a versioned, validated avatar recipe that stores resolved appearance and identifies the generation algorithm and collection.
- Add save, restore, import, and export flows to the playground, plus a documented package integration.
- Keep presentation choices such as size, animation, accessibility labels, and SVG instance IDs separate from persistent appearance.
- Offer curated brand palettes and controlled trait selection as explicit options. Preserve unrelated generated traits when customizing one part.

**Dependencies:** Stable v1 fixtures and an agreed format proposal. Personality settings need a clear relationship to the recipe, without storing live animation state.

**Done when:** A saved recipe recreates the same appearance across supported integrations and compatible package releases, without requiring the original username or a network request. Unsupported versions and malformed values fail clearly. Recipe data contains no executable SVG/CSS or DOM IDs; rendering validates values and creates fresh instance IDs. Default generation remains unchanged, and import/export examples cover Unicode names and overrides.

**Starting contributions:** Describe a real save/restore use case, propose a compact format with validation examples, review a brand palette at small sizes, or prototype the playground flow. Agree on the format before adding a public API.

## Later: 0.4 — Useful exports and adoption

**Purpose:** Make characters useful in places that need static images or a ready-to-run integration.

Work to take on:

- Add static PNG export with transparent or chosen backgrounds and documented dimensions.
- Provide batch SVG/PNG generation for teams, communities, fixtures, and migration tools.
- Publish runnable examples for React, Next.js, plain JavaScript, Vue, Svelte, and Node.js. Start with examples using the existing generator before deciding whether a framework needs its own adapter.
- Explain inline SVG, image URLs, React rendering, and static export tradeoffs through concrete integration examples.

**Dependencies:** Recipe and appearance contracts for consistent batch output; a documented choice of raster conversion tooling.

**Done when:** Exports use a deliberate resting pose, respect the chosen expression and background, and have predictable dimensions. Batch tools report invalid entries clearly. Raster conversion dependencies remain separate from the core generator. Examples install the published package in isolated consumers so workspace links cannot conceal missing exports or types.

**Starting contributions:** Add a minimal framework example, identify a batch workflow, or compare static raster output across representative shapes. Include the package version and exact commands needed to run an example.

## Later: New collections and community tools

**Purpose:** Expand the character family while keeping existing avatars recognizable.

Work to take on:

- Introduce additional rounded silhouettes and expressive eyes through explicitly selected, versioned collections.
- Review each collection at 16–32 pixels, with every supported expression, motion setting, and background treatment.
- Build a community showcase of working integrations, with contributor credit and permission to display submissions.
- Consider design-tool integrations and additional adapters when concrete contributor use cases justify maintaining them.

**Dependencies:** A collection/version proposal, portable recipes, and visual review criteria. Integrations need an owner and a maintenance plan.

**Done when:** Existing calls and recipes keep their appearance. New collections have stable identifiers, deterministic fixtures, compatible licenses, adequate animation padding, accessible labels, and legible resting poses. Additions pass the real package consumer checks. Contributors can find integration examples and understand which tools are maintained.

**Starting contributions:** Propose one silhouette or eye expression with a contact sheet, submit a working integration example, or explain an unmet design-tool workflow. Keep the eyes-only character language.

## Release gate: 1.0 — Stable developer contract

**Purpose:** Make long-term adoption straightforward for developers depending on OpenAvatars.

**Done when:** The public generator, rendering, and integration APIs have documented compatibility rules; saved formats and collections have support and migration policies; browser/framework support is explicit; and published archive consumers verify the supported environments. Establish repeatable performance budgets from measured baselines and demonstrate a dependable release process with changelogs and registry verification.

Complete the contracts for features included in 1.0. Optional future integrations and collections can continue afterward. Readiness for 1.0 depends on stable contracts and a dependable release process.

**Starting contributions:** Find gaps in upgrade instructions, test a published release in a supported environment, or review a migration proposal.

## Rules that apply to every milestone

### Preserve existing identities

- Freeze v1 normalization, hashing, random-number generation and consumption order, default trait selection, and geometry.
- **Appending to the current default `SHAPES`, `EXPRESSIONS`, or `PALETTE` arrays changes name-to-trait selection.** New traits and palettes need explicit opt-in collections or settings with independent selection logic.
- Separate the npm package version, generation algorithm version, HTTP endpoint version, and future recipe schema version. Document intentional changes and migrations for the affected contract.
- Derive new motion or collection randomness independently of the existing identity sequence. Keep default-call regression fixtures unchanged.

### Keep integrations dependable

- Keep the core generator deterministic, independent of browsers and frameworks, and at zero runtime dependencies. Interaction and raster conversion belong in optional integrations.
- Verify inline SVG, embedded image motion, static output, reduced motion, React hydration, repeated instances, multiple roots, and the actual npm archive as relevant to a change.
- Review eyes, contrast, clipping, transparent backgrounds, and allowed custom colors at 16–32 pixels. Accessibility labels and safe SVG serialization remain part of the rendering contract.
- Establish comparable measurements for packed package bytes, SVG bytes, generation speed, and lists of 100/500 avatars. Record runtime, hardware, motion settings, and rendering method; use measured baselines to set budgets.

### Maintain releases and community feedback

- Review dependencies monthly through focused pull requests, with release notes and relevant checks. Introduce update automation only with a clear review policy.
- Ship documentation, runnable examples, and changelog entries alongside API changes. Keep generated builds, archives, and review artifacts out of Git.
- Require successful checks for the release commit and isolated archive consumers. Follow [RELEASING.md](RELEASING.md); ordinary pushes and tags do not publish npm packages.
- Use issue reports, working integrations, and reported use cases to guide priorities. Explain supported behavior clearly and avoid promising unique avatars for every person.

## How contributors can help

Read [CONTRIBUTING.md](CONTRIBUTING.md), choose a milestone, and search [existing issues](https://github.com/lohit101/openavatars/issues) before starting substantial work. Propose or claim a task in an issue so contributors can coordinate.

Include the use case, a small scope, completion criteria, and the effect on existing avatars or APIs. Attach a minimal reproduction for a bug, or small-size screenshots for a visual proposal. Discuss substantial API, recipe, or identity changes with a maintainer before implementation. Documentation corrections and focused fixes can go straight to a pull request.

Good first contributions include reproduction examples, framework recipes, small-size visual reviews, documentation improvements, and reproducible benchmarks. A narrow, reviewable contribution is useful even when its broader milestone is still planned.

## Keep this roadmap current

Review priorities at each release. When work starts, change its status to **In progress** and link the tracking issue or pull request; when it ships, mark it **Shipped**, link the release, and move its details into the changelog. Record changed scope or ordering here so contributors can plan around the same information. [CHANGELOG.md](CHANGELOG.md) remains the release history.
