# 0007 · A locale ships whole and reviewed, or not at all

Accepted 2026-10-04, review gate added 2026-10-05.

## Context

19 locales including Arabic and Urdu (RTL). A screen half in Hindi and half in English reads as
broken, and machine translation without review risks wrong or rude copy in front of employers.

## Decision

- English is the source. Catalogs live per app in `app/locales/<lng>/<ns>.json` with typed keys.
- **Marketing:** a page is published in a locale (prerendered, in the sitemap and hreflang) only
  when that page's namespaces are complete.
- **App:** a locale is offered only when every app namespace passes the blocking checks (missing
  keys, placeholders, plural forms) **and** it is listed in `apps/app/app/locales/reviewed.json`
  after native review. Otherwise the whole app falls back to English.
- Only shipping locales are bundled (the `app-catalogs` virtual module in `vite.config.ts`).
  `I18N_PREVIEW=1` builds every complete locale for staging review.
- Translations go in through `pnpm i18n:apply` / `i18n:apply:app`, which validates each batch.

## Consequences

- New English copy is live immediately; translated locales lag until their batch and review land.
- Unreviewed translations never reach production users or production assets.
