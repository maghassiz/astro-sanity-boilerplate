import { defineField, defineType } from 'sanity'
import { seoField } from '../fields'

// A real collection (Home isn't special-cased) so every page in the site can
// reuse this same page-builder system. Home's instance would be identified by
// slug "home" — pin a Studio structure shortcut to it if useful, but nothing
// here restricts creating further `page` documents for other pages.
export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (rule) => rule.required() }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      validation: (rule) => rule.required().min(1),
      // Closed set — adding a new section type here is a design decision
      // ("does this belong in the page builder?"), not a quick schema addition.
      of: [
        { type: 'heroSection' },
        { type: 'faqSection' },
      ],
    }),
    seoField(),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare: ({ title, slug }) => ({ title, subtitle: slug ? `/${slug}` : undefined }),
  },
})
