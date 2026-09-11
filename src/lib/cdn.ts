import { R2_PUBLIC_URL } from 'astro:env/client';

// Reads straight from the schema-validated env var (see astro.config.mjs's
// `env.schema`) instead of a hardcoded base URL — there's nothing to keep
// manually in sync with .env.
export function asset(path: string): string {
  return `${R2_PUBLIC_URL}/${path.replace(/^\//, '')}`;
}
