# AGENTS.md

Astro 7 static site — an editorial publication about reliable software systems. Node `>=22.22.0`.

## Commands

| Task               | Command                                    |
| ------------------ | ------------------------------------------ |
| Dev server         | `npm run dev`                              |
| Production build   | `npm run build` (output: `dist/`)          |
| Type + Astro check | `npm run check`                            |
| Tests              | `npm test`                                 |

Run `npm run check` and `npm test` before finishing any change.

## Repo map

- `src/pages/` — routes: `/`, `/writing/`, `/writing/[...slug]/`, `/lab/`, `/about/`, 404, `/rss.xml`
- `src/components/OrderLab.astro` — interactive order-flow figure (SVG + vanilla TypeScript + `motion`)
- `src/content/writing/` — essays (Markdown); schema in `src/content.config.ts`
- `src/styles/global.css` — design tokens and shared styles
- `src/layouts/Base.astro` — page shell (header, footer, theme toggle)

## Skills

- `.agents/skills/design/` — the UI authority for this repo. Read it before any visual change.
- `.agents/skills/writing/` — voice, structure, and editing rules for published prose (essays, titles, descriptions, lab copy).
- `.agents/skills/frontend-design/` — vendored from [anthropics/skills](https://github.com/anthropics/skills) (Apache-2.0), advisory only. Do not edit it; update by re-downloading.
