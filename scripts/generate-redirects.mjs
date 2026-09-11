// Regenerates public/_redirects from the "redirect" documents in Sanity —
// don't hand-edit that file, edit redirects in Studio instead and re-run
// this (or just rebuild; it's wired as a prebuild step). Public,
// unauthenticated read — no token needed. Fails loudly (non-zero exit) on
// any error rather than silently leaving a stale or empty file in place.
//
// Usage: node --env-file=.env scripts/generate-redirects.mjs

import { writeFile } from 'node:fs/promises';
import { createClient } from '@sanity/client';

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = process.env;

for (const [name, value] of Object.entries({ PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET })) {
  if (!value) {
    console.error(`Missing required env var: ${name} (load .env first, e.g. run with --env-file=.env)`);
    process.exit(1);
  }
}

const client = createClient({
  projectId: PUBLIC_SANITY_PROJECT_ID,
  dataset: PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2021-06-07',
  useCdn: false,
});

let redirects;
try {
  redirects = await client.fetch(
    `*[_type == "redirect" && defined(source) && defined(destination)] | order(source asc){ source, destination, permanent }`
  );
} catch (err) {
  console.error('Failed to fetch redirects from Sanity:', err.message);
  process.exit(1);
}

const header = `# Cloudflare Pages redirect rules — generated from Sanity "redirect" documents
# by scripts/generate-redirects.mjs. Do not hand-edit; manage redirects in
# Studio instead and rebuild (this runs as a prebuild step).
`;

const lines = redirects.map(({ source, destination, permanent }) => `${source} ${destination} ${permanent === false ? 302 : 301}`);

await writeFile(new URL('../public/_redirects', import.meta.url), `${header}\n${lines.join('\n')}\n`);

console.log(`Wrote ${redirects.length} redirect rule(s) to public/_redirects.`);
