---
name: writing
description: Use when writing, editing, or reviewing reader-facing prose in aminkbi.tech — essays (src/content/writing/), titles, archive/RSS descriptions, and the order lab's explanatory copy. The standard is researched from the best technical writing (sources inside), not from existing drafts. Not for UI microcopy (design skill) or code comments.
---

# Writing — aminkbi.tech

The standard is not what this repo has published so far. It is what the best technical writing in the field does — the craft canon, Distill's editorial bar, the interactive-explanation research, and the exemplars listed under Sources. Every rule below traces to one of them; when in doubt, read the exemplars, not old drafts.

Governs: essays and their titles/descriptions, and the order lab's explanatory copy. UI microcopy belongs to the design skill; code comments to the code.

## The bar

Distill reviewed papers on three axes; this publication applies them to essays:

- **Outstanding communication.** "The distinguishing trait of a Distill article is outstanding communication and a dedication to human understanding." The goal is understanding, never impressiveness.
- **Length serves the reader.** "Rambling is an easy failure mode." Compression is discipline, not brevity for its own sake (Cook: every sentence load-bearing).
- **Scientific integrity.** The high-level description must match the results. Claims match mechanisms; weaknesses are stated plainly.

The reader is a competent engineer who knows the domain but not this system, is busy, and will click away without guilt. Write for their time.

Four tests before publishing:

1. **Comprehension** — could a competent engineer reproduce the argument and predict the next failure from the text alone?
2. **Compression** — can any sentence be deleted with no loss? Cut it.
3. **Honesty** — every uncertainty marked (Evans: "be honest about what I know"); nothing known over-hedged.
4. **Surprise** — "interesting means surprise" (Graham). If nothing surprised you while writing, there is no essay yet.

## Voice and stance

- **Classic style** (Pinker): show the reader the thing; the writer is a guide, not a performer. No brand voice, no corporate "we".
- **Actors as subjects, actions as verbs** (Williams). Keep subject and verb close; known information before new; end sentences on the emphatic word.
- **Active by default** (Strunk; Orwell; Google). Passive only when the actor is unknown or irrelevant — in failure prose that is often exactly the point: "the acknowledgment is lost".
- **Honest hedging** (Evans): state what you know firmly; mark what you do not. "Unverified" is allowed; "obviously" is not.
- **Precision over labels** (Kleppmann's CAP essay): define terms by what they do, not by the label people use; if common usage misleads, say so. One term per concept, reused exactly.
- **First person where it does real work** — marking a judgment, an experience, a decision. Never as filler ("I think", "in my opinion").
- No hype register: no exclamation marks, no marketing adjectives, no slogans (extends the design skill's copy rules).

## Structure — how the best expository pieces move

- **Start from a real question**, not a thesis (Graham). "Good writing should be convincing... because you got the right answers, not because you did a good job of arguing."
- **Orient the reader in two paragraphs** (Distill; Google: audience and scope): the question, why it matters, what they will understand by the end. One scope sentence ("This is a conceptual design, not a benchmark") is good; a meta-paragraph about the article is not.
- **Concrete before abstract** (Victor; Ciechanowski): one worked instance with real names, numbers, and states, before any abstraction. An explanation requires an author, not a model dump.
- **Progressive disclosure** (Hohman et al.): simplest correct model first; then the constraint that breaks it; then the mechanism that repairs it. Never hand the reader a solution before the problem.
- **Headings are claims** (Cook: the headings read as the argument's outline): "When a dependency breaks", not "Failure handling".
- **One traced request path is the spine**; failures are first-class sections, not caveats (Cook: "Complex systems run in degraded mode"). Show detection and repair, not only the break.
- **Answer the skeptic in the piece** (Amazon memo practice: a full logical argument with "a reflexive defense of potential objections"). Fix weak points by explaining better, not by arguing more cleverly (Graham). Bullets "flatten out any sense of relative importance" (Bezos) — prose carries arguments.
- **Close where the insight lands**: the trade-off, the open question, the sharpened claim. No summary recital (Strunk: omit needless words).

## Evidence and precision

- Claims carry their mechanism in the same paragraph. No guarantee without the mechanism that produces it.
- Guarantee vocabulary is exact — at-most-once, at-least-once, exactly-once, idempotent, durable. Each word commits the system to something; if the mechanism cannot be shown, the word does not apply (Hodges; Kleppmann).
- Numbers carry units, scope, and provenance: p99, single region, measured vs. assumed.
- Primary sources only: papers, documentation, source code. Every link resolves at publish time. Never cite a summary when the primary exists; never invent a reference.
- Distinguish the model from the system: the model may be linearizable; this deployment may not be.
- State limitations plainly — the high-level description must match the mechanism (Distill, scientific integrity).

## Sentences and editing

- **Cut list** (Orwell; Strunk; Zinsser; Google): intensifiers (very, really, quite); basically/simply/just (unless just = only); "in order to" -> to; "the fact that" -> that; nominalizations (perform a validation -> validate; make a decision -> decide); redundant pairs; "it is important to note"; "there is/are" openings.
- One idea per sentence; one topic per paragraph; the lead sentence states the paragraph's point (Google); paragraphs of two to five sentences.
- **Revision is writing** (Zinsser): expect structural rewrites, not word swaps. First draft for you; second for the reader.
- **Drafts test** (Graham): give it to a friend and ask what bored them and what seemed unconvincing. Boring bits get cut; unconvincing bits mean you explained something badly.
- Read aloud; fix whatever the tongue trips on.

## Explanation devices

- **Analogies leak** (Pinker): use one only if you say where it breaks; prefer the concrete case. Never a metaphor you are used to seeing in print (Orwell).
- **Figures**: one idea each. Multiple representations earn their place only when each adds a distinct insight (Victor; Hohman et al. — animation is strongest for state transitions, uncertainty, and causality).
- **Interactive passages** (the lab): overview first, then zoom and filter, then details on demand (Shneiderman, via Hohman et al.). Let the reader predict before revealing (self-explanation research; "You Draw It"). Not everything needs to be interactive — misused, it distracts or goes unused; the text must read complete without the lab (Hohman et al.; repo rule).

## Repo mechanics (platform, not craft)

- Schema — src/content.config.ts: title, description, publishedAt, type, topic, readingTime, issue, featured. Run `npm run check` before finishing.
- **title**: names the mechanism or failure; sentence case; concrete.
- **description**: at most two sentences — the promise and its boundary. Appears verbatim in the archive and RSS; write it last, when the piece can no longer lie.
- **readingTime**: `wc -w` / 150, rounded. 150 wpm is deliberate: below the ~238 wpm silent non-fiction average (Brysbaert 2019) because code and diagrams read slower. Recount after edits.
- **type**: Deep dive = the README Content model skeleton (requirements and assumptions -> baseline design -> one request path -> a failure or retry -> the invariant and trade-off -> sources), written per the arc above. Field note = one mechanism or failure; still closes on the trade-off.
- **Consistency contract**: event names, states, and identifiers in prose match the code, diagrams, and lab exactly. Grep before finishing (essay + src/components/OrderLab.astro + sibling essays).
- **Sources format**: `- [Title](url) — Publisher.` Primary sources only.
- Precedence: if generic writing advice conflicts with this skill or the README, this skill wins.

## Review mode

Findings as `file:line — [severity] issue -> fix`. Severities: **blocker** (wrong or unsafe claim; misstated guarantee; dead source), **issue** (structure, voice, evidence, or consistency violation), **nit** (line polish). Close with a one-line verdict.

Pre-publish checklist: comprehension test; compression test; hedge audit; every source link resolves; identifiers grep clean; reading time recounted; read aloud once.

## AI tells — banned

Words: delve, leverage, seamless, robust, unlock, elevate, foster, landscape, realm, tapestry, testament, game-changer, comprehensive, utilize, myriad, "navigate" as a verb.

Phrases: "In today's fast-paced world", "it's not just X, it's Y", "Let's dive in", "In conclusion", "It's important to note", "at the end of the day", "when it comes to".

Structural: uniform paragraph lengths; pep-talk section endings; decorative triads ("fast, reliable, and scalable"); a closing paragraph that restates the introduction; bullet-point soup where prose carries the argument. These extend the design skill's copy bans and never contradict them.

## Sources

Read these; the rules above come from them. All links verified October 2026.

Craft canon
- William Zinsser, *On Writing Well* — clarity, clutter, revision.
- Joseph M. Williams, *Style: Lessons in Clarity and Grace* — actors and actions, old before new.
- Steven Pinker, *The Sense of Style* — classic style, the curse of knowledge.
- George Orwell, [Politics and the English Language](https://www.orwell.ru/library/essays/politics/english/e_polit).
- William Strunk, [The Elements of Style](https://www.gutenberg.org/ebooks/37134) (1918).
- Todd Rogers & Jessica Lasky-Fink, *Writing for Busy Readers*.

Editorial standards and guides
- Distill, [journal standards](https://distill.pub/journal/) — outstanding communication; reviews for advancing dialogue, outstanding communication, scientific integrity.
- Hohman, Conlen, Heer & Chau, [Communicating with Interactive Articles](https://distill.pub/2020/communicating-with-interactive-articles/).
- [Distill guide](https://distill.pub/guide/) — best practices for interactive explanatory articles.
- [Bezos's 2004 narrative-memo email](https://slab.com/blog/jeff-bezos-writing-management-strategy/), recounted by Slab — prose over bullets.
- [Google Technical Writing course](https://developers.google.com/tech-writing); [Google developer style guide](https://developers.google.com/style).
- [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome/).
- [Diátaxis](https://diataxis.fr/) — explanation vs how-to vs reference.

Exemplars in this genre
- [Bret Victor, Explorable Explanations](https://worrydream.com/ExplorableExplanations/).
- [Martin Kleppmann, Please stop calling databases CP or AP](https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html); *Designing Data-Intensive Applications*.
- [Richard Cook, How Complex Systems Fail](https://how.complexsystems.fail/).
- [Brandur Leach, Idempotency keys](https://brandur.org/idempotency-keys).
- [Marc Brooker](https://brooker.co.za/blog/); [AWS Builders' Library](https://aws.amazon.com/builders-library/).
- [Jepsen analyses](https://jepsen.io/analyses).
- [Julia Evans, Blogging principles](https://jvns.ca/blog/2017/03/20/blogging-principles/); [Dan Luu](https://danluu.com/).
- [Paul Graham, The Age of the Essay](https://www.paulgraham.com/essay.html); [Write Simply](https://www.paulgraham.com/writesimply.html).
- [Bartosz Ciechanowski](https://ciechanow.ski/); [Adrian Colyer, The Morning Paper](https://blog.acolyer.org/); [Murat Demirbas](https://muratbuffalo.blogspot.com/).
- [Jeff Hodges, Notes on Distributed Systems for Young Bloods](https://somethingsimilar.com/2013/01/14/notes-on-distributed-systems-for-young-bloods/).
