---
name: design
description: Use when creating, editing, or reviewing any visible UI in aminkbi.tech — Astro pages, components, CSS/tokens, SVG diagrams, the order lab, or UI copy. Enforces the publication's design system and the researched standards behind it (WCAG 2.2 AA, legibility, motion safety), and blocks generic AI defaults. Not needed for essay prose edits that don't change presentation.
---

# Design — aminkbi.tech

Small editorial publication about reliable software systems. Reading comes first: essays must stay readable as plain text; the lab illustrates them, it never replaces them. This skill encodes the site's visual identity (tokens, type, layout) and the external standards that constrain it.

**Precedence:** researched accessibility and legibility requirements > house identity > passing taste. The house system may be stricter than the standards (that is allowed and often intended); it must never be weaker. When a request conflicts with this skill, say so and propose the closest in-system option before building.

## Source of truth

1. `README.md` §Design direction and §Design system — design intent and the project's research table.
2. `src/styles/global.css` — tokens, type scale, layout, breakpoints. If a value isn't there, it doesn't exist yet. Add shared styles there, not inline in components.
3. Existing pages are **examples, not authority**. If a page diverges from `global.css`, the page is the bug — never copy drift.

General design guidance from other skills (for example the vendored `frontend-design`) is advisory. When it conflicts with this system, this system wins.

## Tokens (locked)

| Token        | Light     | Dark      | Use                              |
| ------------ | --------- | --------- | -------------------------------- |
| `--paper`    | `#f5f3ec` | `#101820` | Page background                  |
| `--ink`      | `#23323a` | `#e7eee9` | Text, rules, controls            |
| `--muted`    | `#626962` | `#9aa9a5` | Secondary text                   |
| `--accent`   | `#b74d2c` | `#d97852` | Emphasis, links, active, failure |
| `--line`     | `#d6d7cc` | `#2d3c43` | Hairlines, borders               |
| `--surface`  | `#eeeee5` | `#17262f` | Quiet panels                     |
| `--prose`    | `#4e5a59` | `#c4d0cd` | Body copy in essays              |

Diagram palette (OrderLab): navy `#192a36` panel, node fill `#1c303d`, stroke `#637983`, rust packets `#e18b60`, mint done/success `#b7d1bd`. Diagram colors stay inside the diagram — never leak them into page chrome.

Never add a new hue. Emphasis is rust, success is mint, everything else is ink/muted. Never hardcode a hex where a token exists; dark theme is a token swap, not a redesign.

**Contrast** — WCAG 2.2 SC 1.4.3 requires ≥4.5:1 for text (≥3:1 for large text) and SC 1.4.11 ≥3:1 for UI and meaningful graphics. Measured October 2026: ink/paper 11.9, prose/paper 6.5, muted/paper 5.1, accent/paper 4.6, paper-on-accent 4.6; dark pairs all ≥4.5 except one exception below. Known exceptions to fix on touch: accent text on `--surface` in light hover states (4.38) and the dark search placeholder `#71827f` (4.43). Recompute the matrix whenever tokens change.

## Typography

- **Instrument Serif 400** — headlines only. Never bold, never body or labels.
- **DM Sans** — body, UI, navigation.
- **DM Mono** — technical micro-labels only (issue numbers, event traces, counters, captions). Not for body copy.
- Fonts are self-hosted in `public/fonts` with their licenses. Never a CDN webfont, never swap families.
- The fluid reading scale lives in `global.css`. Don't set raw px sizes on prose; reuse the existing clamps.
- **Measure:** body copy should sit at 45–90 characters per line ([Butterick](https://practicaltypography.com/line-length.html)); aim for 60–75 when adjusting ([Baymard](https://baymard.com/blog/line-length-readability)). Measured October 2026: article body is ≈86 characters per line at max desktop scale and the lede ≈75 — the top of the acceptable range, so never widen the column. Between ~1000–1100px viewport the article grid leaves its `1fr` column uncapped and the measure reaches ~90–100 characters: keep the 720px cap at every breakpoint.
- **Micro-labels:** 10px floor at every breakpoint for any text a reader is expected to read (platform type scales stay ≥11–12px); uppercase only for short tags — all-caps slows dyslexic readers ([BDA](https://www.thedyslexia-spldtrust.org.uk/media/downloads/69-bda-style-guide-april14.pdf)). The current CSS drops several labels to 7–9px on small screens; raise them to the floor on touch.
- Body size 16–19px (BDA suggests 12–14pt for body text); line-height ≥1.5 (the system uses 1.75–1.85). Text must survive 200% zoom without loss (WCAG SC 1.4.4). Left-aligned only — never justified.
- The micro-label classes (`.eyebrow`, `.essay-label`, `.figure-caption`, …) already exist. Reuse them instead of restyling.

## Layout

- `.container` = `min(1280px, 100% − 104px)`; gutters step to 72/48/36px at ≤1100/800/600. Use the container, don't create widths.
- Breakpoints: 1500, 1100, 800, 600. Check the default plus all four.
- Ruled sections (1px `--line` borders) are the structural device. Use them instead of cards, shadows, or background fills.
- Radius: 2–3px for controls/panels, 999px only for pills/toggles. No 12–20px rounded cards.
- Interactive targets ≥24×24px (WCAG SC 2.5.8); prefer ≥44px touch area.
- Layouts reflow to 320px without horizontal scrolling (WCAG SC 1.4.10) — the existing grids do; don't regress that.

## Color is semantic

Rust marks emphasis, active state, and failure. Mint marks done/success inside labs. Color never decorates, and never carries meaning alone — pair it with text (WCAG SC 1.4.1).

## Diagrams (OrderLab and any new figure)

- Follow the existing SVG language: navy panel, 1px strokes, dot-field texture, mono node labels, small moving packets.
- Meaningful graphics (labels and marks that encode state) hold ≥3:1 against their background; decorative texture may go lower. Current strokes measure 2.8–3.2:1 — legible because text carries the meaning; don't let a mark be the only signal.
- Controls: manual run/next/reset with pause, keyboard reachable, `aria-live` step copy, and an event trace that exists as text.
- The figure must be understandable from its caption and transcript without motion.

## Motion

- User-controlled only: no autoplay, no scroll-reveal, no parallax, no scroll-jacking (WCAG SC 2.2.2, 2.3.3; NN/g also warns parallax harms users with vestibular disorders).
- Durations: simple feedback ≈100 ms; the house ceiling is 250 ms — inside the researched 100–500 ms band, with 200–300 ms for larger movements ([NN/g](https://www.nngroup.com/articles/animation-duration/)). Ease-out for entrances.
- Follow the existing lab pattern (see `OrderLab.astro` script): explicit run control, reset, and full `prefers-reduced-motion` behavior.
- Transition limits: transform/opacity/color, ≤ .25s. The hover lift (`translateY(-1px)` / `-2px`) is the ceiling — don't add more.

## Accessibility (non-negotiable)

WCAG 2.2 AA is the floor: SC 1.4.3 contrast, 1.4.11 non-text contrast, 1.4.1 use of color, 1.4.4 resize, 1.4.10 reflow, 2.4.7 focus visible, 2.4.11 focus not obscured, 2.5.8 target size, 2.2.2 / 2.3.3 motion.

- Visible `:focus-visible` outline on every interactive element — rust, 2px, 5px offset (measures 4.6:1 light / 5.8:1 dark against paper).
- Keyboard-operable everywhere; state announced via `aria-live` and conveyed by text, never color only.
- Accessible names must contain the visible label text. Lighthouse currently flags the wordmark (`aria-label="aminkbi.tech home"` vs visible "a. aminkbi .tech") — align them on touch.
- Decorative SVG is `aria-hidden`; interactive figures are focusable with a real label.
- Contrast and focus hold in both themes (including `prefers-color-scheme` fallback, which the token block handles).

## Banned defaults (AI tells)

These are identity choices — the site must not read as a generic template — not universal laws. Keep them unless the design direction deliberately changes.

Never introduce: Inter/Roboto/Arial/system fonts for visible UI; purple/indigo gradients; gradient text; glassmorphism or blur cards; a centered hero with two buttons and a status pill; three-icon feature grids; drop shadows for depth; emoji in UI; icon-library imports (draw a 1px SVG instead); decorative badges or sparkle flourishes; parallax, marquee, or counters.

Copy: no slogans, no "seamless / blazing / unlock / supercharge", no exclamation marks. Plain declarative sentences in the voice of the essays; prose rules live in the writing skill.

## Workflow

1. Read README §Design system and the closest existing pattern (as example, not authority).
2. Prefer editing `global.css` classes/tokens over new inline styles; make the smallest change that fits the system.
3. Verify: `npm run check`, `npm test`, then `npm run dev` and inspect at 1440 / 1100 / 800 / 600 in both themes.
4. Test the keyboard path and reduced motion for anything interactive; run a Lighthouse snapshot when touching contrast, names, or targets (baseline: a11y 100, two nits — the wordmark name mismatch and one non-descriptive link).
5. If the system itself conflicts with a requirement above, fix the system — don't ship the conflict.

## Review findings format

When reviewing UI, report findings as `file:line — [severity] issue → fix`. Severities: **blocker** (breaks accessibility or the system), **issue** (drifts from the system), **nit** (polish). Cite the standard (SC number or source) for factual claims. End with a one-line verdict.

## References

External standards and research:

- W3C WCAG 2.2 Understanding — [contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), [focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [pause/stop/hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).
- British Dyslexia Association — [Dyslexia Style Guide](https://www.thedyslexia-spldtrust.org.uk/media/downloads/69-bda-style-guide-april14.pdf) (12–14pt body, avoid all caps, left-aligned).
- Butterick's Practical Typography — [line length](https://practicaltypography.com/line-length.html); Baymard — [line-length research](https://baymard.com/blog/line-length-readability).
- NN/g — [Executing UX Animations: Duration and Motion Characteristics](https://www.nngroup.com/articles/animation-duration/) (100–500 ms, ease-out, respect reduce-motion).
- Platform type scales — [Apple HIG Typography](https://developer.apple.com/design/human-interface-guidelines/typography); [Material 3 type scale](https://m3.material.io/styles/typography/type-scale-tokens).
- W3C Design Tokens format — [tr.designtokens.org/format](https://tr.designtokens.org/format/).
- Project-specific direction research — README §Research and decisions (Ciechanowski, Evans, Victor, Astro islands, WCAG 2.2).
