import { defineField, defineType } from 'sanity'
import { linkField } from '../fields'

// Page-builder section types for the `page` document's `sections` array.
// Each is an inline object (not its own document) — the closed set an editor
// can compose a page from.
//
// This boilerplate ships two example sections to demonstrate the two
// recurring patterns — add your own real sections the same way:
//
// 1. `heroSection` — an ordinary *content* section: its fields are edited
//    directly in Studio and rendered straight from this document.
// 2. `faqSection` — a *marker* section: no fields of its own. It just tells
//    the page builder "render the FAQ component here" — that component
//    queries the separate `faq` collection independently (see
//    src/sanity/queries.ts). This makes a collection's *position* on the
//    page editable/reorderable without any new schema.

export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'subheading', title: 'Subheading', type: 'text', rows: 2, validation: (rule) => rule.required() }),
    defineField({ name: 'primaryButtonLabel', title: 'Primary button label', type: 'string' }),
    linkField('primaryButtonHref', 'Primary button link'),
    defineField({ name: 'secondaryButtonLabel', title: 'Secondary button label', type: 'string' }),
    linkField('secondaryButtonHref', 'Secondary button link'),
  ],
  preview: { select: { title: 'headline' } },
})

// Marker section: no fields of its own. See the file-level comment above.
export const faqSection = defineType({
  name: 'faqSection',
  title: 'FAQ (from FAQ collection)',
  type: 'object',
  fields: [
    defineField({
      name: 'note',
      title: 'Note',
      type: 'string',
      readOnly: true,
      initialValue: 'Pulls live from the FAQ collection — nothing to configure here.',
    }),
  ],
  preview: { select: {}, prepare: () => ({ title: 'FAQ section' }) },
})
