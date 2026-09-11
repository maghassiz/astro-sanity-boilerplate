# Astro + Sanity + Cloudflare boilerplate

A starter for static marketing/content sites: Astro renders every page at
build time — there is no server, no SSR route, and no per-request Sanity
traffic. Content changes go live by rebuilding, not by a runtime fetch.

**Extracted from a real production project** (a hotel-industry marketing
site) with all business-specific content, copy, and design tokens stripped
out — the architecture, conventions, and wiring are unchanged. Search this
repo for `TODO` and `REPLACE` to find every spot that needs project-specific
values before first deploy.

## Stack

- **Astro** (`output: "static"`) — pages in `src/pages/`, components in
  `src/components/`, one `BaseLayout.astro` wrapping every page.
- **React** only for the few interactive islands (e.g. `ContactForm.tsx`,
  `Navigation.tsx`) via `@astrojs/react`.
- **Tailwind v4** via `@tailwindcss/vite` — no separate Tailwind config file,
  configured directly in `astro.config.mjs`.
- **Sanity** — the CMS. Studio is embedded at `/studio` in this same Astro
  app (not a separate deploy), via `@sanity/astro`.
- **Cloudflare R2** — hosts every content image (logos, photos, icons).
  Content schemas store a plain `url` field pointing at R2, **not** Sanity's
  native `image` asset type — every schema field that does this says so in
  its own comment ("Hosted on R2, not a Sanity asset").
- **Cloudflare Pages** — hosting. GitHub Actions builds and deploys via
  `wrangler pages deploy` (Cloudflare Pages isn't Git-connected to this repo;
  see `.github/workflows/deploy-cloudflare.yml`).

## First steps in a new project

1. `npm install`.
2. Create a Sanity project (sanity.io/manage) and an R2 bucket, fill in
   `.env` from `.env.example`.
3. Run `npm run typegen` once — extracts the schema and generates
   `sanity.types.ts`. Until then, query results are typed `any` (see the
   comment in `src/pages/index.astro`) — replace with the generated result
   types afterward.
4. Run `node --env-file=.env scripts/seed-example-page.mjs` to create the
   example `page`/`siteSettings`/`faq` documents so the homepage has
   something to render.
5. `astro dev --background` and open `/` and `/studio`.
6. Replace the placeholder brand tokens in `src/styles/global.css`, the nav
   links in `Navigation.tsx`, and the footer content in `Footer.astro`.
7. Set up the GitHub Actions secrets referenced in
   `.github/workflows/deploy-cloudflare.yml` and a Cloudflare Pages project
   (see that workflow's `--project-name`), then wire a Sanity webhook to fire
   a `repository_dispatch` (`sanity-publish` type) at GitHub's API so
   publishing in Studio triggers a rebuild.

## Content → live site flow

1. An editor publishes a document in Sanity Studio (`/studio`).
2. A Sanity webhook fires a `repository_dispatch` (`sanity-publish` type)
   directly at GitHub's API — no intermediate serverless function.
3. `.github/workflows/deploy-cloudflare.yml` runs: `npm ci` → `npm run build`
   (which fetches fresh content straight from Sanity's API, `useCdn: false`
   — deliberately, to avoid CDN propagation lag racing this near-instant
   webhook and baking in stale pre-publish content) → `wrangler pages deploy`.
4. The workflow also runs on every push to `main` and via manual
   `workflow_dispatch`.

There is no live-preview/draft-mode route in this pattern — publishing and
seeing it live both take the same ~1 minute round-trip through this
pipeline. Adding real live preview would require switching at least one
route to SSR — a deliberate architecture change, not something to add
casually.

## Environment variables

See `.env.example` for the full annotated list. Summary:

| Var | Used by | Notes |
|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET` | site + Studio | `PUBLIC_` prefix required — bundled into Studio's client code |
| `SANITY_API_TOKEN` | one-off seed scripts only | write-access token, never shipped to the browser |
| `R2_PUBLIC_URL` | site (asset URLs, via `astro:env/client` in `src/lib/cdn.ts`) | schema-validated — no hardcoded copy to keep in sync |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | `scripts/*.mjs` only | never exposed to the browser |
| `PUBLIC_CONTACT_FORM_ENDPOINT` | `ContactForm.tsx` | webhook-style form backend URL (see `scripts/google-apps-script-contact-form.gs`); empty disables submission |
| `PUBLIC_SITE_URL` | `astro.config.mjs` | canonical URL / sitemap / OG base; falls back to a placeholder pages.dev URL until a custom domain is attached |

The 4 `PUBLIC_*`/`R2_PUBLIC_URL`/`PUBLIC_CONTACT_FORM_ENDPOINT` vars are
schema-validated in `astro.config.mjs`'s `env.schema` — a build fails loudly
if one is missing, rather than silently shipping broken content. Every
`scripts/*.mjs` script validates its own required vars the same way
(check-and-`process.exit(1)` before doing anything) — match that pattern in
any new script.

## Sanity schema conventions

Schema lives entirely under `src/sanity/`. That directory only imports from
within itself or external packages — never from `src/components/` or other
Astro code — so it would stay liftable to a different frontend later.

**Document roles** (each is a deliberate, fixed contract — don't blur them):

- **Page** (`page.ts`) — owns a route via `slug`, composed from the page
  builder's closed `sections` array (see below).
- **Singleton** — exactly one instance, create/delete locked via
  `__experimental_actions: ['update', 'publish']` (a real Studio feature,
  undertyped by Sanity's own `defineType` — needs a `@ts-expect-error`
  comment where used). Example: `siteSettings.ts`.
- **Collection** — an ordinary list of interchangeable documents, usually
  with a manual `order` number field + an `orderAsc` ordering. Example:
  `faq.ts` — copy this shape for testimonials, blog posts, team members, etc.

**Field factories** (`src/sanity/fields.ts`) — reusable field shapes
(`imageUrlField`, `altTextField`, `linkField`, `stringListField`) instead of
copy-pasting a field definition across schemas. If a new field shape gets
copy-pasted into a second schema file, turn it into a factory here instead —
that's what keeps a later change (e.g. "make alt text required") a one-line
edit instead of a hunt across every schema.

**Page builder** (`page.ts` + `sections.ts`) — `page.sections` is a closed,
curated array of section object types. This boilerplate ships two examples
that demonstrate the two recurring patterns:

- `heroSection` — an ordinary *content* section, edited directly in Studio.
- `faqSection` — a *marker* section with no fields of its own. It just marks
  *where* on the page the Astro `Faq` component (which queries the separate
  `faq` collection directly) should render, making section order editable
  without new schema.

Adding a new section type is a design decision (does this belong in the
system?), not a quick schema addition.

**Validation lives in the schema, not the frontend.** If a component needs a
field to always be present, add `.required()` (and `.min(1)` for arrays) to
that field in its schema — don't paper over a possibly-missing value with a
fallback in the component. This is also what makes TypeGen (below) generate
non-nullable types for that field.

## Fetching content from Astro

Every GROQ query lives in `src/sanity/queries.ts` as a `defineQuery(...)`
export — **not** inlined as a template string in a page/component's
frontmatter. Two reasons: it keeps every query in one place, and Sanity's
typegen can only statically discover queries in `.ts`/`.tsx`/`.js`/`.jsx`
files — it never scans `.astro` frontmatter.

```ts
import { sanityClient } from 'sanity:client';
import { faqsQuery } from '../../sanity/queries';

const faqs = await sanityClient.fetch(faqsQuery);
```

Run `npm run typegen` after adding or changing a query or schema field. It
extracts the schema (`sanity schema extract --enforce-required-fields`,
config in `sanity.cli.ts`) and regenerates `sanity.types.ts`, which should be
committed to the repo (no typegen step in CI — it runs entirely against
files already checked in). Import result types from there instead of
hand-writing an `interface` for what a query returns:

```ts
import type { PageBySlugQueryResult } from '../../sanity.types';
```

`--enforce-required-fields` only narrows a field to non-nullable when the
query uses an explicit `{ ... }` projection — a bare `[0]` fetch with no
projection falls back to the generic document shape and everything comes
back nullable.

Sanity content is nullable-by-default in generated types even where the
frontend treats a value as always present (e.g. an optional button label).
Convert `null` → `undefined`/a fallback at the exact call site that fetches
the data (the page or the component doing the `sanityClient.fetch`) — don't
loosen a shared component's prop types (e.g. `BaseLayout`) to accept `null`
just to satisfy one caller.

## Key scripts (`scripts/*.mjs`)

- `upload-to-r2.mjs` — uploads content images/fonts to R2; run after
  adding/replacing an image referenced by a `url` field in Sanity.
- `set-r2-cors.mjs` — one-time setup: allows cross-origin GET on the bucket,
  needed if you self-host a font from R2 (browsers enforce CORS on
  cross-origin fonts, unlike images).
- `generate-redirects.mjs` — regenerates `public/_redirects` from the
  `redirect` collection in Sanity; wired as an npm `prebuild` step. Don't
  hand-edit `public/_redirects`.
- `seed-example-page.mjs` — one-off/idempotent seed for the example `page`
  (slug `"home"`), `siteSettings` singleton, and two `faq` documents.
  Reference for the pattern any future seed script should follow.
- `google-apps-script-contact-form.gs` — backend for `ContactForm.tsx` on a
  static (serverless) site; see its header comment for one-time deploy steps.

## Dev tooling

- `npm run lint` — ESLint (`eslint.config.mjs`, flat config,
  `eslint-plugin-astro` + `typescript-eslint`, recommended rulesets). A
  `simple-git-hooks` pre-commit hook runs `lint-staged` (`eslint --fix` on
  staged files) automatically after `npm install`.
- `npx astro check` — full TypeScript type-checking across `.astro` files.
  **`npm run build` does not do this** — its esbuild/Vite transform strips
  types without checking them, so a type error can pass `build` and still be
  a real bug. Run `astro check` to actually verify type correctness.

## Development

Start the dev server in background mode: `astro dev --background`. Manage
it with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Astro documentation

Full docs: https://docs.astro.build

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
