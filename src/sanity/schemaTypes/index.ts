import type { SchemaTypeDefinition } from 'sanity'

import page from './page'
import siteSettings from './siteSettings'
import redirect from './redirect'
import faq from './faq'
import { heroSection, faqSection } from './sections'

export const schemaTypes: SchemaTypeDefinition[] = [
  page,
  siteSettings,
  redirect,
  faq,
  heroSection,
  faqSection,
]
