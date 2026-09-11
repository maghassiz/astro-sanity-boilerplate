import { defineCliConfig } from 'sanity/cli'

// Used by the `sanity` CLI itself (schema extract, typegen) — a separate,
// plain-Node context from astro.config.mjs's Vite-based env loading, but the
// Sanity CLI auto-loads .env/.env.local from the project root the same way.
export default defineCliConfig({
  api: {
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  },
  typegen: {
    path: './src/sanity/queries.ts',
    schema: './schema.json',
    generates: './sanity.types.ts',
  },
})
