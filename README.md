# aminkbi.tech

## Design direction

aminkbi.tech is a publication about reliable software systems. The first three essays follow one order-processing design through its requirements, retries, and event delivery:

1. **Reliable orders** — a single-region baseline for accepting an order when inventory, payment, or messaging can fail.
2. **Idempotency** — one business result for a retried command.
3. **Transactional outbox** — a recoverable link between a database commit and an event.

The site is a static reading experience with small interactive explanations. The labs illustrate the essays; the essays remain readable as text.

### Research and decisions

These references were read directly on 17 October 2026. They inform the structure and interaction model.

| Reference | Decision |
| --- | --- |
| [Ciechanowski — Archives](https://ciechanow.ski/archives/) and [Airfoil](https://ciechanow.ski/airfoil/) | Use a writing archive and long essays divided into titled sections, experiments, caveats, and further reading. |
| [Julia Evans — jvns.ca](https://jvns.ca/) | Keep the home page and archive direct: selected writing, topic filters, and RSS. |
| [Bret Victor — Up and Down the Ladder of Abstraction](https://worrydream.com/LadderOfAbstraction/) | Give the order model explicit controls and a trace that connects a high-level result to each concrete event. |
| [Astro — Islands architecture](https://docs.astro.build/en/concepts/islands/) | Render pages as static HTML and use small vanilla TypeScript scripts only where the archive or lab needs interaction. |
| [Astro — Content collections](https://docs.astro.build/en/guides/content-collections/) | Keep essays in one typed build-time collection and generate their routes from the collection. |
| [W3C WCAG 2.2, SC 2.3.3 and SC 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) | Do not autoplay the model. Support pause/reset, keyboard access, and prefers-reduced-motion; keep scenario results available as text. |

**Implementation status:** the initial Astro version includes three essays, the archive, article routes, lab, RSS, sitemap, and a GitHub Pages deployment workflow. The custom domain responds over HTTP; HTTPS provisioning is pending.

## Site map

| Route | Current implementation |
| --- | --- |
| / | Featured essay, compact order-flow figure, and links into the writing and lab. |
| /writing/ | Search and topic filters, with titles, summaries, publication dates, and reading times. |
| /writing/[...slug]/ | Essay page with metadata, table of contents, references, related writing, and a compact order experiment on **Reliable orders**. |
| /lab/ | Full order-processing model with healthy, timeout, and duplicate-request scenarios. It supports manual step/reset; the compact figure supports run/pause/resume/reset. |
| /about/ | Short description of the journal and its public GitHub link. |
| /rss.xml | RSS feed for the four published essays. |
| Sitemap | Generated during the static build. |

The lab scenarios are:

- **Healthy:** request accepted, event recorded, inventory reserved, payment succeeds, order confirmed.
- **Timeout:** payment remains unknown until the retry and reconciliation path is shown.
- **Duplicate:** the same request key returns the recorded result without a second business effect.

Each scenario includes explanatory text, so the content remains useful with JavaScript disabled.

## Content model

Essays are Markdown files in src/content/writing/. Their shared collection schema is:

~~~yaml
---
title: Making retries safe with idempotency
description: How to make a retried command produce one business effect when the network can lose the response.
publishedAt: 2026-10-17
type: Field note
topic: Distributed systems
readingTime: 4 min
issue: '02'
featured: false
---
~~~

title, description, publishedAt, type, topic, readingTime, and issue are required. featured defaults to false. type is Deep dive or Field note; topic is Distributed systems or Data systems. Every committed entry is included in the archive, routes, and RSS feed.

Essay structure is consistent: requirements and assumptions, a baseline design, one request path, a failure or retry, the invariant and trade-off, then references. Writing follows the agent skill in `.agents/skills/writing/`.

## Design system

The visual system uses a warm paper background, dark ink, rust for emphasis and failure, and deep navy for diagrams and traces.

| Token | Value | Use |
| --- | --- | --- |
| Paper | #f5f3ec | Page and article background |
| Ink | #23323a | Text, rules, and controls |
| Rust | #b74d2c | Links, active states, and failures |
| Deep navy | #192a36 | Diagrams, traces, and code blocks |

Instrument Serif is used for headlines, DM Sans for body and navigation, and DM Mono for technical labels. Fonts are served locally with their licenses. The layout uses a narrow reading measure, ruled sections, and diagrams whose labels match the prose. Decorative badges, slogans, and repeated UI instructions are omitted. Controls are keyboard reachable with visible focus; state is conveyed by text as well as color. Motion is user-controlled and reduced through prefers-reduced-motion. UI changes follow the agent skill in `.agents/skills/design/`, which encodes these rules for Codex and other agents.

## Implementation

Astro 7 provides the static shell, Markdown provides the essays, and vanilla TypeScript handles the archive filter and order lab. There is no client-side application runtime or server-side dependency.

~~~text
aminkbi.tech/
├── public/
├── src/
│   ├── components/
│   ├── content/writing/
│   ├── content.config.ts
│   ├── layouts/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── writing/index.astro
│   │   ├── writing/[...slug].astro
│   │   ├── lab/index.astro
│   │   ├── about.astro
│   │   └── rss.xml.ts
│   └── styles/
└── .github/workflows/
~~~

Run locally with:

Node.js 22.22 or newer is required.

~~~bash
npm install
npm run dev       # authoring server
npm run check     # Astro and TypeScript checks
npm run build     # static production build
npm test          # built-page metadata, links, anchors, feed, and fallback checks
npm run preview   # inspect the generated build
~~~

Before publishing, run the checks, build, and tests, then verify search and the three lab scenarios in a browser.

## Deployment

GitHub Pages hosts the site through GitHub Actions. The workflow builds dist/ and publishes it from the default branch. [GitHub's Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) describes the public-repository and static-hosting constraints.

The Pages custom domain is aminkbi.tech. DNS was configured through get.tech on 17 October 2026 following [GitHub's custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site):

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | aminkbi.github.io |

The apex responds with HTTP 200 from GitHub Pages. DNS propagation and certificate issuance are pending; GitHub notes that DNS changes and availability of the Enforce HTTPS option can take up to 24 hours. Enable Enforce HTTPS once the certificate is available.

## Research sources

- [Ciechanowski — Archives](https://ciechanow.ski/archives/) and [Airfoil](https://ciechanow.ski/airfoil/)
- [Julia Evans — jvns.ca](https://jvns.ca/)
- [Bret Victor — Up and Down the Ladder of Abstraction](https://worrydream.com/LadderOfAbstraction/)
- [Astro — Islands architecture](https://docs.astro.build/en/concepts/islands/)
- [Astro — Content collections](https://docs.astro.build/en/guides/content-collections/)
- [W3C — WCAG 2.2 Animation from Interactions (SC 2.3.3)](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- [W3C — WCAG 2.2 Pause, Stop, Hide (SC 2.2.2)](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
