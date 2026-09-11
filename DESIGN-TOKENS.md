# Design Tokens

Placeholder values live in `src/styles/global.css`'s `@theme` block. Replace
them with your real brand palette and type scale, and use this file to record
*where each value came from* (a Figma file/node, a brand guide, etc.) and any
judgment calls made while extracting them — that context is what the next
person (or a future you) needs, not the values themselves (those are already
in `global.css`).

Suggested structure once you have real values:

## Colors

| Token | Hex | Source | Usage |
|---|---|---|---|
| `brand` | | | primary accent |
| `ink` | | | dark backgrounds / body text |
| `accent` | | | primary CTA buttons |
| `background` | | | page background |
| `muted` | | | secondary/muted text |
| `border` | | | dividers, input borders |
| `surface` | | | subtle section backgrounds |

## Typography

- **Heading font** — name, weight(s), where it's hosted (self-hosted via
  `@fontsource/*` if free/open-license; R2 + `@font-face` if a licensed
  commercial font — see `scripts/upload-to-r2.mjs` + `scripts/set-r2-cors.mjs`).
- **Body font** — same.

| Token | Size | Line-height | Letter-spacing |
|---|---|---|---|
| `text-h1` | | | |
| `text-h2` | | | |
| `text-h3` | | | |
| `text-body-lg` | | | |
| `text-body-md` | | | |
| `text-body-sm` | | | |

## Responsive breakpoints

Record your actual breakpoints and any real (not assumed) per-breakpoint
layout differences here as you build each section — don't assume a design
tool's Desktop/Tablet/Mobile frames are simple reflows of each other without
checking.
