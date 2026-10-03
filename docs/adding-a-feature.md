# Adding a feature

A feature is a vertical slice: one folder under `app/features/` that owns its screens,
its components, the hooks that talk to the server, the axios calls underneath them and
the Zod schemas its forms validate against. Nothing else in the app should have to
change for the feature to exist, apart from the route file that gives it a URL and the
i18n registration that gives it copy.

Scaffold the skeleton with `node scripts/new-feature.mjs <name>` — it creates the
folders, writes the catalog stub into all 19 locales (the part people forget) and
prints the two edits it deliberately does not make for you. The rest of this document
is what the script cannot do.

## Where the files go

```
app/features/<feature-name>/       kebab-case, always
├── Screen.jsx                     one file per screen, at the feature root
├── components/                    everything the screens are built from
├── hooks/                         use<Name>.js — React Query + toasts live here
├── services/                      <domain>.service.js — axios calls, nothing else
├── schemas/                       <domain>.schema.js — Zod
├── store/                         <domain>.store.js — Zustand, only if the feature needs it
└── lib/                           plain helpers the feature's own screens share
```

A feature may instead split its React Query code by kind, as `app/features/pricing`
does: `queries/<domain>.queries.js` for `queryOptions()` and the `useQuery` hooks built on
them, `mutations/<domain>.mutations.js` for `useMutation` hooks, and `hooks/` for hooks
that combine or shape them for a screen. `check-naming` enforces both filenames.

`store/` and `lib/` are optional and most features have neither. Reach for `lib/`
only when a helper is used from more than one component subfolder — if a single
subfolder owns it, it sits in that subfolder, the way `components/view-jobs/jobFormat.js`
does.

`app/features/contact` is the whole shape in five files: `Contact.jsx` composes
`components/ContactInfo.jsx` and `components/ContactForm.jsx`, the form calls
`hooks/useContact.js`, which wraps `services/contact.service.js` in a `useMutation`
and validates against `schemas/contact.schema.js`. Read it before you read anything
else here.

Bigger features grow two extra habits, both visible in `app/features/employer`.
`components/` gets one kebab-case subfolder per screen area (`components/view-jobs/`,
`components/invoices/`, `components/layout/`) rather than a flat pile of forty files;
and a whole sub-app — the auth flow, the error boundary — gets its own folder at the
feature root (`employer/auth/`, `employer/not-found/`). A helper used by exactly one
component subfolder may sit in that subfolder rather than in `hooks/`
(`components/view-jobs/useEditJobForm.js`); the `hooks/` folder is for hooks a screen
uses, not for every function beginning with `use`.

Imports use the `@/` alias even inside the feature that owns the file —
`Contact.jsx` imports `@/features/contact/components/ContactForm`, not `./components/...`.
Keep it that way; it is the only alias, and grep for a module finds every use of it.

Two conventions in `hooks/` matter beyond style. Query options are exported separately
from the hook that consumes them — `jobsListQuery(params)` built with `queryOptions()`,
then `useJobs()` spreading it — because route loaders prefetch the same query and both
sides must agree on the key. And every key comes from `app/lib/queryKeys.js`, never an
inline array, because invalidation is by key prefix and a hand-written key silently
misses.

## Giving a screen a URL

`app/routes.ts` is `export default flatRoutes()` and nothing else. The filename *is*
the route: dots are path separators, `$param` is a dynamic segment, a leading
underscore marks a pathless layout, and a trailing underscore on a segment
(`employer_.sign-in.jsx`) opts the file out of that segment's layout while keeping the
URL. The route file itself stays thin — it re-exports the screen and declares the
router's conventional exports:

```js
export { PostJob as default } from "@/features/employer/PostJob";
export const handle = { i18n: ["employerJobs"] };
export const clientLoader = catalogLoader(handle.i18n);
```

There are three independent trees, and which one a page belongs in follows from one
question: does the page need to be found by a search engine in 19 languages?

**`_publicLang.$lang.*` — yes.** Marketing and legal pages. `_publicLang.$lang.jsx` is
the layout: it rejects an invalid `:lang`, wraps children in the right
`I18nextProvider` and renders `PublicLayout` (navbar, outlet, footer) exactly once. A
page here is prerendered to static HTML per locale, so it also owes SEO work — see
below.

**`_public.*` — no locale segment.** Pages whose URL has no room for a language prefix
and which are not prerendered; today that is the shared-scorecard page, whose whole URL
is a share id. They render under the ambient locale the visitor already had.

**`employee.*` / `employer.*` — behind auth.** One parent file per role
(`employee.jsx`, `employer.jsx`) runs `requireAuth({ allowedRoles })` in
`clientMiddleware`, so it happens before every child loader in the branch, including the
parallel ones. Child routes never re-check auth. They do prefetch: wrap the loader in
`authedPrefetch()` from `app/loaders/prefetch.js`, which swallows fetch failures so a
warm-cache optimisation can never break a page.

**The `_public` / `_publicLang` trap.** `flatRoutes()` nests any file whose name starts
with `_public.` under a parent route named `_public`. The localized tree is named
`_publicLang` for exactly that reason: if it were `_public.$lang`, the two layouts would
nest and `PublicLayout` would render twice — a duplicated navbar and footer, which this
app has already shipped once. Do not "tidy" the two prefixes into one.

**The prerender trap.** Under `ssr: false`, a route that exports `clientLoader` without
also exporting `loader` stops prerendering its component and ships an empty hydrate
fallback instead — meta tags intact, body empty. That is why
`_publicLang.$lang.terms.jsx` carries `export const loader = () => null;` next to its
`clientLoader`. `verify-seo.mjs` catches this with its "prerendered body content" check,
but only after a full build, so get it right the first time.

For a new prerendered public page there is a fixed list of places to touch:

- `MARKETING_PATHS` (or `LEGAL_PATHS`) in `app/i18n/config.js` — this array drives
  `prerenderPaths()`, so it is what actually creates the per-locale HTML, the sitemap
  entries and the hreflang cluster.
- A `meta` block in the page's own namespace, in every locale: `title`, `description`,
  `name`, `schemaDescription`, `crumb` (see `about.json`). Titles end with ` | letshyre.ai` and must stay under 60 display units;
  descriptions must land between 50 and 160. `verify-seo.mjs` counts CJK glyphs as two.
- `OG_PAGES` in `app/lib/seo.js`, plus a 1024x535 `.jpg` in `public/og/` named after the
  path suffix (`about.jpg`, `home.jpg` for the index) — skip both and the page falls back
  to `default.jpg`.
- `SOURCES` in `scripts/generate-sitemap.mjs`, mapping the path suffix to its component
  and namespace so `lastmod` comes from real commit dates instead of today's.
- The screen must render exactly one `<h1>`. Not zero, not two.

A client-only route (no locale prefix, no prerender) is served the SPA shell only if its
top-level path is in the client-route `location` in `deploy/nginx.conf`. Anything under
`employer`, `employee` or `shared-scorecard` already is; a new top-level path has to be
added there, or nginx returns 404. It also needs
`noindexMeta("<seoKey>")` from `app/lib/routeMeta.js` for its tab title, and its
`clientLoader` must load its own catalogs via `catalogLoader` — nothing else will.

## The i18n namespace

This is where builds die. A feature's copy is one namespace: a JSON file per locale at
`app/i18n/messages/<locale>/<namespace>.json`. Namespaces are camelCase
(`employerJobs`, `sharedScorecard`) even though feature folders are kebab-case.

Two things must line up.

**The files.** English first, then all 18 other locales — `en`, `hi`, `fr`, `ja`, `ar`,
`te`, `ta`, `es`, `nl`, `ru`, `kn`, `ml`, `ur`, `bn`, `de`, `pt`, `it`, `ko`, `id`. Not
"English now, translations later": `check-i18n-parity` fails on a missing file or a
missing key, and `check-i18n-quality` fails on a value copied verbatim from English once
it contains a space and more than one translatable word. There is no way to stage a
half-translated namespace past CI, and that is deliberate.

**The route.** Every route lists the namespaces it renders, and nothing else loads
them:

```js
export const handle = { i18n: ["employerJobs"] };
export const clientLoader = catalogLoader(handle.i18n);
```

Layouts list the copy they render themselves (`employer.jsx` loads `common`, `seo`,
`dashboard` and `employer`); a page adds only its own. Keep the handle a literal on one
line: `entry.client.jsx` reads it from the matched route modules to load a prerendered
page's copy before hydration (client loaders don't run then), and
`preload-catalogs.mjs` and `check-i18n-routes.mjs` read it from the source.
`catalogLoader` decides the locale (`params.lang` when valid, otherwise the stored one),
so never hand-roll that in a route.

Copy that only appears behind an interaction, like a wizard, can load on demand instead:
lazy-load the component together with `loadCatalogs(locale, ["ns"])`, the way
`EmployeeDashboardLayout` loads the onboarding wizard.

Each catalog builds to its own chunk, `i18n-<locale>-<namespace>`, so a page downloads
exactly the namespaces its routes list.

Then there are the gates:

- `check-i18n-parity` — every key English has, every locale has. Plural-suffixed keys
  (`_one`, `_other`, …) are compared by base name.
- `check-i18n-quality` — the content checks parity cannot make: BOMs, mojibake, mismatched
  `<hl>`/`<br/>` markup, `{{placeholders}}` that disappeared or multiplied, arrays that
  changed length, `Letshyre` instead of `LetsHyre`, invented domains, enforced glossary
  terms from `scripts/i18n-glossary.json`, values identical to English, and English
  function words left inside a non-Latin-script translation.
- `check-i18n-usage` — every literal `t("key")` in `app/` resolves against the English
  catalogs. It understands `const { t } = useTranslation("ns")`, a renamed binding
  (`const { t: tJobs } = ...`), `nsT`/`getFixedT`, `seoT`, and an explicit `"ns:key"`
  prefix. Computed keys are skipped rather than guessed at, so a template-literal key is
  unprotected — prefer a literal.
- `check-i18n-review` — records which translated catalogs a human has actually read,
  bound to a file hash so an edit drops the sign-off. `requireReviewed` is empty today,
  so a new namespace only lowers the reviewed percentage. Editing a *reviewed* catalog
  does fail the build until you re-record with `pnpm i18n:review <locale>/<file> "<name>"`.
- `check-i18n-routes` — follows each route's imports and fails when a namespace used
  along the way isn't in the `handle.i18n` of the route or its layouts.
- `check-i18n-budget` — post-build, 32 KB per catalog chunk. If a namespace is near the
  limit, split it rather than raising the limit.

Plurals use i18next's `_one`/`_other`/`_few`/… suffixes, resolved through
`Intl.PluralRules` — never a JS ternary. A ternary can only express English's two forms;
Japanese and Korean have one, Russian four, Arabic six.

## The other gates

`pnpm build:ci` runs all of these. Locally, the four fast ones are worth running before
you push: `pnpm lint`, `pnpm test`, `node scripts/check-naming.mjs`,
`node scripts/check-feature-boundaries.mjs`.

**Feature boundaries.** `check-feature-boundaries.mjs` fails on any
`@/features/<other>/…` import. Three features are importable by anyone — `common`
(cross-role screens), `candidate-profile` and `scorecard` (the presentation both roles
render) — and the allowlist is empty. If you need something another feature has, the
answer is to move the shared part out, not to add a line to `SHARED`.

**Naming.** `check-naming.mjs`: directories kebab-case, `.jsx` files PascalCase after
their component, `use<Name>.js` under `hooks/`, `<domain>.service.js` under `services/`,
`<domain>.schema.js` under `schemas/`. `app/routes/`, `app/components/ui/` (vendored
shadcn) and the message catalogs are out of scope.

**RTL.** `check-rtl-classes.mjs` rejects physical Tailwind utilities anywhere under
`app/features` or `app/components` — `ml-*`, `pr-*`, `border-l`, `rounded-r`,
`text-right`, `left-4`. Arabic and Urdu are shipped locales and physical utilities do not
mirror. Write the logical ones: `ms-*`/`me-*`, `ps-*`/`pe-*`, `border-s`, `text-start`,
`start-4`. The allowlist exists for centering transforms and decorative washes; adding to
it means writing down why in the file itself.

**ESLint.** Beyond the usual: a literal string passed to `toast()`, a literal
`aria-label`, or a non-empty literal `alt` is an error, because those are the three
places untranslated copy kept reaching production unnoticed. Side-effect CSS imports are
banned outside `app/root.jsx` and `app/styles/` — style with Tailwind utilities and the
tokens in `app/styles/tailwind.css`; read `DESIGN_SYSTEM.md` before inventing a value.

## Graduating a module to the shared layer

`app/components`, `app/hooks`, `app/lib` and `app/services` hold only what two or more
features genuinely use. The bar is a *second real consumer*, not an anticipated one, and
moving a module there is a decision to make out loud rather than a reflex — the shared
layer is the part of the app nobody can change safely, and everything in it is a
permanent obligation. Those four folders are flat on purpose.

In practice: `app/services/api.js` (the axios instance with the whole interceptor
chain), `app/lib/queryKeys.js`, the error-message resolvers, `requireAuth` and
`catalogLoader` are shared because every feature needs the exact same behaviour from
them. A component that two features happen to render *similarly* is usually two
components. And when the shared thing is a whole screen rather than a helper — the
chatbot, the scorecard view — it becomes a feature in `app/features/common`,
`candidate-profile` or `scorecard` instead, which is what the boundary checker's short
allowlist is for.

## What to test

Be honest about the starting point: 12 test files, and the coverage thresholds in
`vitest.config.js` sit at 5% statements. They are a ratchet against regression, not a
target — raise them as you add tests, never lower them to turn a red run green.

Test the **hooks** first. They are where the money and the correctness live: cache
invalidation after a mutation (get the key prefix wrong and the UI shows stale data
indefinitely) and anything that spends an employer's credits.
`app/features/pricing/components/checkout/CheckoutDialog.test.jsx` is the model — it
asserts that a verified payment refreshes the employer's credits, that one order is
created however fast Pay is pressed, and that a failed verification keeps the payment
reference on screen.

Then the **schemas**, which are cheap and catch real copy bugs: pass `tStub` from
`app/test/helpers` into the factory and assert *which* message key the schema chose, not
merely that it rejected. Then any **component that gates an irreversible action** — the
unlock-profile modal is tested for that reason.

HTTP is faked by swapping `api.defaults.adapter`, not by stubbing each service, so the
real interceptor chain (queueing, retry, token rotation) runs under test. Use
`queryWrapper()` from `app/test/helpers` for anything touching React Query. Specs sit
beside the code they cover.

The biggest gap is a route × locale smoke test. It would have caught both the duplicated
navbar and the untranslated legal page, each of which shipped. If you have appetite for
one test that is not about your feature, write that one.
