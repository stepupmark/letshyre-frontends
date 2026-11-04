# 0019 · Tiptap edits invitation email templates

Accepted 2026-11-04.

## Context

Employers send interview invitations from email templates they own: copies of LetsHyre's starter
templates that they reword. The starters are email HTML, with inline-styled buttons, a bordered
help box and grey notes. Rich-text editors drop inline styles on load, so a plain editor would
quietly strip that layout the first time an employer saved. A raw HTML box keeps the markup but
asks employers to write email HTML.

## Decision

- The message is edited in Tiptap 3 (`@tiptap/react`, `starter-kit`, `extensions`, `suggestion`),
  in the app only. The editor chunk loads on the template editor route; the library and the send
  flow don't import it.
- Custom nodes hold what the starters use: `mergeField` (an atom shown as a labelled chip, stored
  as `{{key}}`), `emailButton` (a styled link standing alone in its paragraph or box), `callout`
  (a styled `div`) and a `style` attribute kept on paragraphs and lists. Styles pass through an
  allowlist of email-safe properties; `url()`, `expression()` and markup are dropped.
- `lib/template-html.ts` converts stored HTML to the editor's schema and back. Exact style strings
  ride along in `data-style`, because the DOM rewrites values (`#111` to `rgb(17, 17, 17)`), and
  are restored on export. Lists lose the `<p>` ProseMirror wraps items in. Both starters must
  round-trip unchanged; `template-html.test.ts` guards that.
- When a stored template holds markup the editor can't represent, the message is locked and the
  employer chooses to convert it. It is never simplified silently.
- Links and buttons point at `{{invite_link}}` or an `http(s)` address; the Link extension's
  `isAllowedUri` allows exactly those. Typing `{{` opens a field menu; a typed `{{field}}` becomes
  a chip.
- `injectCSS` is off, so Tiptap adds no `<style>` tag; ProseMirror's structural rules live in
  `app.css` and the rest is Tailwind on `EditorContent`.
- The preview renders in an `allow-same-origin` sandbox without `allow-scripts`, swapping the
  server's rendered frame for the unsaved body. The frame takes no pointer events. Because it
  inherits the page CSP, `img-src` allows the logo host the API puts in every email.

## Consequences

- About 110 kB gzip loads with the editor route, outside the initial budget.
- New layout in starter templates needs a node, or it trips the lock until one exists.
- The server still sanitises template HTML on save and send; the editor's schema is not the only
  guard.
