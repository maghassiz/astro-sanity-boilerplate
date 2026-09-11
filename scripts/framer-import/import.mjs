// One-time import of a CMS CSV export (Framer, Webflow, or any tool that
// exports a CMS collection to CSV) into Sanity. Any image URLs referenced in
// the CSV get mirrored to R2 (not uploaded as Sanity assets) and referenced
// by plain URL, matching this project's chosen asset architecture.
//
// Ships with one working example — `faq`, matching src/sanity/schemaTypes/faq.ts
// and the sample data/FAQ.csv — since that's the only collection this
// boilerplate includes out of the box. Copy `importFaq` as the template for
// your project's real collections (blog posts, testimonials, case studies...):
//
//   - Plain fields: read straight off the CSV row (see `question`/`answer` below).
//   - Image fields: `await mirrorImageToR2(row.ImageColumnName, 'cms/<collection>', slug)`
//     — see r2.mjs. Skips re-uploading if the object already exists.
//   - Rich-text/HTML fields: `htmlToPortableText(row.HtmlColumnName)` — see
//     html-to-blocks.mjs. Converts to Sanity Portable Text blocks.
//
// Usage:
//   node --env-file=.env scripts/framer-import/import.mjs [faq]
//   (omit the argument to run every importer in IMPORTERS)
//
// Requires SANITY_API_TOKEN in .env — a token with "Editor" or "Write"
// permissions, created at https://sanity.io/manage under your project's API tab.
// Safe to re-run: documents are createOrReplace'd by a deterministic _id
// derived from the CSV slug, so re-running just updates existing content.

import { readFile } from 'node:fs/promises';
import { createClient } from '@sanity/client';
import { parse } from 'csv-parse/sync';

const DATA_DIR = new URL('./data/', import.meta.url);

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name} (run with --env-file=.env)`);
  return value;
}

// Sanity document IDs only allow [a-z0-9_.-] — CSV slugs may include accented
// characters (e.g. "café"), so strip diacritics for the _id while leaving
// any human-readable `slug` field on the document itself untouched.
function slugify(slug) {
  return slug
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '-');
}

function toDocId(prefix, slug) {
  return `${prefix}-${slugify(slug)}`;
}

const client = createClient({
  projectId: requireEnv('PUBLIC_SANITY_PROJECT_ID'),
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  token: requireEnv('SANITY_API_TOKEN'),
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function readCsv(filename) {
  const content = await readFile(new URL(filename, DATA_DIR), 'utf-8');
  return parse(content, { columns: true });
}

async function importFaq() {
  const rows = await readCsv('FAQ.csv');
  console.log(`Importing ${rows.length} FAQs...`);

  for (const [index, row] of rows.entries()) {
    const slug = row.Slug.trim();
    const doc = {
      _id: toDocId('faq', slug),
      _type: 'faq',
      question: row.Question,
      answer: row.Answer,
      order: index,
    };

    await client.createOrReplace(doc);
    console.log(`  ✓ ${slug}`);
  }
}

const IMPORTERS = { faq: importFaq };

const target = process.argv[2];

if (target && !IMPORTERS[target]) {
  console.error(`Unknown target "${target}". Expected one of: ${Object.keys(IMPORTERS).join(', ')}`);
  process.exit(1);
}

for (const [name, run] of Object.entries(IMPORTERS)) {
  if (target && target !== name) continue;
  await run();
}

console.log('Done.');
