# Astro + Sanity + Cloudflare boilerplate

A starter for static marketing/content sites, extracted from a real
production project. Astro (static output) + Sanity CMS (embedded Studio at
`/studio`) + Cloudflare R2 (images/fonts) + Cloudflare Pages (hosting via
GitHub Actions).

See [CLAUDE.md](./CLAUDE.md) for the full architecture writeup, environment
variables, schema conventions, and first-steps checklist for a new project.

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
