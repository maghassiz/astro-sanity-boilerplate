import { defineQuery } from 'groq'

// Every GROQ query in the project, centralized here rather than inlined per
// component. Two reasons: (1) Sanity's typegen only statically scans
// .ts/.tsx/.js/.jsx files for defineQuery(...) calls to generate result types
// from — it can't parse .astro frontmatter, so queries have to live in a
// plain TS module for typegen to see them at all; (2) it also prevents the
// "same query, retyped slightly differently each time" drift a project
// otherwise has no protection against, same motivation as src/sanity/fields.ts.
//
// After editing a query here, run `npm run typegen` to regenerate
// sanity.types.ts before the new/changed shape is available to import.

export const faqsQuery = defineQuery(`*[_type == "faq"] | order(order asc){ question, answer }`)

// Generic — fetches any `page` document by its slug, with every page-builder
// section type's projection. One query for every page-builder page rather
// than one hand-copied per-page query, so a new section type only needs
// adding here once.
export const pageBySlugQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    sections[]{
      _key,
      _type,
      _type == "heroSection" => {
        headline, subheading,
        primaryButtonLabel, primaryButtonHref,
        secondaryButtonLabel, secondaryButtonHref
      }
    },
    seo
  }
`)

// Site-wide singleton (src/sanity/schemaTypes/siteSettings.ts) — fetched by
// both BaseLayout.astro (Organization JSON-LD + OG image fallback) and any
// page resolving its own SEO fields against the site defaults, so this is
// the one shared projection both call sites narrow down to what they need.
export const siteSettingsQuery = defineQuery(
  `*[_type == "siteSettings"][0]{ siteName, defaultSeoTitle, defaultSeoDescription, defaultOgImage, organizationName, organizationLogoUrl }`
)
