# @workspace/i18n

Locale model, i18next setup, formatters and catalog checks shared by every app.

| Import                  | What                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `@workspace/i18n`       | `LOCALES`, `dirFor`, `localePath`, `getI18n`, `addMessages`, `createCatalogLoader`, `format*`, `lh_locale` cookie |
| `@workspace/i18n/react` | `<I18nProvider lang messages>`, `useLocale`, `useFormat`, `useTranslation`, `Trans`                               |
| `@workspace/i18n/node`  | `computeReadiness`, `checkCatalog`, `findUnusedKeys` (build time only)                                            |

## Catalogs

Each app keeps `locales/<locale>/<namespace>.json`. English is the source; other locales may lag.

```ts
const loadMessages = createCatalogLoader(
  import.meta.glob("../locales/*/*.json", { import: "default" })
)
const messages = await loadMessages(lang, ["common", "home"]) // English comes along as the fallback
```

Pass `messages` to `<I18nProvider>`. Keys are typed by declaring `CustomTypeOptions.resources` from the English catalogs in the app.

## Readiness

A page is ready in a locale when every key of its namespaces exists there and passes the placeholder and plural checks. English is always ready. Apps prerender, list in the sitemap and offer in the language switcher only ready locales.

## CLI

```bash
lh-i18n check --locales app/locales
lh-i18n report --locales app/locales
lh-i18n readiness --locales app/locales --pages app/lib/pages.ts
lh-i18n unused --locales app/locales --src app
```

`check` fails on broken placeholders, incomplete plurals and stale keys. Missing keys are not errors; they only keep a page out of that locale.

Set `configureI18n({ pseudo: true })` in development to render pseudo-localized copy.
