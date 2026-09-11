import { defineField, defineType } from 'sanity'

// Site-wide singleton: SEO defaults and Organization identity. A page's own
// `seo` field (see page.ts) overrides these per-document; BaseLayout falls
// back to these when a page doesn't set one.
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // @ts-expect-error — a real, supported Sanity Studio feature (locks
  // create/delete for a singleton document) that isn't part of defineType's
  // public TS surface.
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({ name: 'siteName', title: 'Site name', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'defaultSeoTitle',
      title: 'Default SEO title',
      description: 'Used when a page has no title of its own.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'defaultSeoDescription',
      title: 'Default SEO description',
      description: 'Used when a page has no description of its own.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default social share image URL',
      description: 'Hosted on R2, not a Sanity asset. Used when a page has no OG image of its own.',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'organizationName', title: 'Organization name', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'organizationLogoUrl',
      title: 'Organization logo URL',
      description: 'Hosted on R2, not a Sanity asset. Used in the Organization JSON-LD.',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
})
