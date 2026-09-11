// Converts a CMS export's rich-text HTML into Sanity Portable Text blocks, so
// imported rich-text content gets a proper rich-text editing experience in
// Studio instead of a raw-HTML field.
//
// The compiled schema below is a generic single-block-array shape (just
// enough for @portabletext/block-tools to parse against) — it's not tied to
// any real document type in src/sanity/schemaTypes/, so this stays reusable
// regardless of which document/field you're importing HTML into.

import { JSDOM } from 'jsdom';
import { htmlToBlocks } from '@portabletext/block-tools';
import { Schema } from '@sanity/schema';

const compiledSchema = Schema.compile({
  name: 'import',
  types: [
    {
      type: 'document',
      name: 'importedDoc',
      fields: [
        {
          title: 'Body',
          name: 'body',
          type: 'array',
          of: [
            {
              type: 'block',
              marks: {
                annotations: [
                  {
                    name: 'link',
                    type: 'object',
                    title: 'Link',
                    fields: [{ name: 'href', type: 'string', title: 'URL' }],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
})

const blockContentType = compiledSchema.get('importedDoc').fields.find((field) => field.name === 'body').type;

export function htmlToPortableText(html) {
  if (!html) return [];
  return htmlToBlocks(html, blockContentType, {
    parseHtml: (input) => new JSDOM(input).window.document,
  });
}
