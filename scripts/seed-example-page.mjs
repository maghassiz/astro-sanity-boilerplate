// One-off seed: creates an initial "page" (slug "home"), a couple of "faq"
// documents, and the "siteSettings" singleton — enough content for
// src/pages/index.astro to render on a fresh Sanity project. Uses
// createOrReplace with fixed _ids where relevant, so it's safe to re-run.
// Copy this pattern for any future seed script.
//
// Usage: node --env-file=.env scripts/seed-example-page.mjs

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, SANITY_API_TOKEN } = process.env;

for (const [name, value] of Object.entries({ PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, SANITY_API_TOKEN })) {
  if (!value) {
    console.error(`Missing required env var: ${name} (load .env first, e.g. run with --env-file=.env)`);
    process.exit(1);
  }
}

const dataset = PUBLIC_SANITY_DATASET || 'production';

const homePage = {
  _id: 'homePage',
  _type: 'page',
  title: 'Home',
  slug: { current: 'home' },
  sections: [
    {
      _key: 'hero',
      _type: 'heroSection',
      headline: 'Replace this with your real headline',
      subheading: 'One or two sentences describing what this product/site does and who it is for.',
      primaryButtonLabel: 'Get started',
      primaryButtonHref: '/contact-us',
      secondaryButtonLabel: 'Contact us',
      secondaryButtonHref: '/contact-us',
    },
    { _key: 'faq', _type: 'faqSection' },
  ],
};

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  siteName: 'My Project',
  defaultSeoTitle: 'My Project',
  defaultSeoDescription: 'Replace this with your default SEO description.',
  defaultOgImage: 'https://REPLACE-WITH-YOUR-R2-URL/images/og-default.png',
  organizationName: 'My Project',
  organizationLogoUrl: 'https://REPLACE-WITH-YOUR-R2-URL/images/logo.svg',
};

const faqs = [
  { _id: 'faq-1', _type: 'faq', question: 'Replace this with a real question', answer: 'Replace this with a real answer.', order: 1 },
  { _id: 'faq-2', _type: 'faq', question: 'Another example question', answer: 'Another example answer.', order: 2 },
];

const res = await fetch(`https://${PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${dataset}`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${SANITY_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    mutations: [
      { createOrReplace: homePage },
      { createOrReplace: siteSettings },
      ...faqs.map((faq) => ({ createOrReplace: faq })),
    ],
  }),
});

const body = await res.json();
if (!res.ok) {
  console.error('Seed failed:', JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log('Seeded "homePage", "siteSettings", and 2 "faq" documents.');
console.log(JSON.stringify(body, null, 2));
