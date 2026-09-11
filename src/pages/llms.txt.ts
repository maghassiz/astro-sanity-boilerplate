import type { APIRoute } from 'astro';

// llms.txt (https://llmstxt.org/) — a curated, plain-text index of the site
// for AI crawlers/answer engines, same spirit as robots.txt/sitemap.xml but
// aimed at LLMs rather than search-engine bots. Hand-maintained: add a line
// here when a new top-level page ships. An Astro route (not a static
// public/ file) so links can be absolute, resolved against `site` at
// request time, same as robots.txt.ts.
export const GET: APIRoute = ({ site }) => {
  const url = (path: string) => new URL(path, site).toString();

  // TODO: replace with your real site description and page list
  const body = `# My Project

> One-sentence description of what this site/product is and who it's for.

## Pages

- [Home](${url('/')}): Homepage overview.
- [Contact](${url('/contact-us')}): Get in touch.
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
