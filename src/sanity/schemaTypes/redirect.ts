import { defineField, defineType } from 'sanity'

// Sanity-managed redirects: public/_redirects is generated from these
// documents (scripts/generate-redirects.mjs), not hand-edited — so an editor
// can add/change a redirect from Studio without a code change or PR. Plain
// strings (not `url`/`slug`) since sources/destinations are site-relative
// paths, not full URLs.
export default defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  fields: [
    defineField({
      name: 'source',
      title: 'From path',
      description: 'e.g. "/old-page" — the old path visitors might still hit.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'destination',
      title: 'To path',
      description: 'e.g. "/new-page" — where they should land instead.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'permanent',
      title: 'Permanent (301)',
      description: 'On — 301 (permanent, the usual case). Off — 302 (temporary).',
      type: 'boolean',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { source: 'source', destination: 'destination' },
    prepare: ({ source, destination }) => ({ title: source, subtitle: `→ ${destination}` }),
  },
})
