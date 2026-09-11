# Astro + Sanity + Cloudflare boilerplate

A starter for static marketing/content sites, extracted from a real
production project. Astro (static output) + Sanity CMS (embedded Studio at
`/studio`) + Cloudflare R2 (images/fonts) + Cloudflare Pages (hosting via
GitHub Actions).

See [CLAUDE.md](./CLAUDE.md) for the full architecture writeup, environment
variables, schema conventions, and first-steps checklist for a new project.

## Using this as a template for a new project

This repo is marked as a GitHub template repository — **don't clone it and
push back into it**, and don't work directly inside a folder still connected
to this repo's git history. Instead, for every new project:

1. On GitHub, open this repo and click **Use this template → Create a new
   repository**. Pick a name and owner for the new project. (Or via the CLI:
   `gh repo create <owner>/<new-project-name> --private --template maghassiz/astro-sanity-boilerplate`.)
   This creates a brand-new repo with its own history — a clean starting
   point, not a fork of this one.
2. Clone *that* new repo and work there:
   ```sh
   gh repo clone <owner>/<new-project-name>
   cd <new-project-name>
   ```
3. Follow the Quick start below, then work through CLAUDE.md's "First steps
   in a new project" checklist and the `TODO`/`REPLACE` markers throughout
   the code (nav links, footer, `sanity.config.ts` title, R2 URLs, the
   deploy workflow's `--project-name`, etc.).

If you don't have access to create repos under the right GitHub
owner/org, ask whoever administers this template repo to either add you as a
collaborator here or create the new repo for you from the template.

## Quick start

```sh
npm install
cp .env.example .env   # fill in your Sanity project + R2 bucket details
npm run typegen         # after your Sanity project has the schema in it
node --env-file=.env scripts/seed-example-page.mjs
npm run dev
```

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server |
| `npm run build` | Build the production site to `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npx astro check` | Full TypeScript type-check (not run by `build`) |
| `npm run typegen` | Regenerate `sanity.types.ts` from schema + queries |
