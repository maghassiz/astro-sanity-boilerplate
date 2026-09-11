// @ts-check
import { loadEnv } from 'vite';
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';
import sitemap from '@astrojs/sitemap';

// astro.config.mjs loads before Astro's own .env loading, so read it manually here
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// Placeholder until a custom domain is attached — swap via PUBLIC_SITE_URL env var,
// no code change needed. Drives canonical URLs, sitemap, and OG/Twitter tags.
// Update this fallback to your Cloudflare Pages *.pages.dev URL once the project exists.
const SITE_URL = env.PUBLIC_SITE_URL || 'https://REPLACE-WITH-YOUR-PROJECT.pages.dev';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,

  integrations: [
    react(),
    sanity({
      projectId: env.PUBLIC_SANITY_PROJECT_ID,
      dataset: env.PUBLIC_SANITY_DATASET || 'production',
      // false, not true: every Sanity query in this project runs at build time
      // (static output, no per-request server), so there's no runtime traffic
      // to offload onto the CDN — its only effect here would be propagation lag
      // (~30-60s) racing a publish-webhook's near-instant rebuild trigger,
      // causing builds to occasionally bake in stale pre-publish content.
      useCdn: false,
      studioBasePath: '/studio',
    }),
    sitemap({
      filter: (page) => !page.includes('/studio'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  env: {
    schema: {
      PUBLIC_SANITY_PROJECT_ID: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_SANITY_DATASET: envField.string({ context: 'client', access: 'public', default: 'production' }),
      R2_PUBLIC_URL: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_CONTACT_FORM_ENDPOINT: envField.string({ context: 'client', access: 'public', default: '' }),
      PUBLIC_CF_BEACON_TOKEN: envField.string({ context: 'client', access: 'public', default: '' }),
    }
  }
});
