# @workspace/blocks

App-level pieces built only from `@workspace/ui` and Tailwind theme tokens. Shared by every app.

| Import                                  | What                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `@workspace/blocks/logo`                | `Logo`: the wordmark (`src/assets/logo.webp`), sized with a height class |
| `@workspace/blocks/language-switcher`   | `LanguageSwitcher`: native names, `lang`/`dir` per item, current marked  |
| `@workspace/blocks/skip-link`           | `SkipLink`: first tab stop, jumps to `#main`                             |
| `@workspace/blocks/navigation-progress` | `NavigationProgress`: top bar for navigations slower than 300 ms         |
| `@workspace/blocks/error-screen`        | `ErrorScreen`, `NotFoundScreen` for route `ErrorBoundary`s               |
| `@workspace/blocks/consent-banner`      | `ConsentBanner`: non-modal, Reject and Accept look the same              |
| `@workspace/blocks/theme-provider`      | `ThemeProvider`: light for now, `.dark` ready for a toggle               |

Blocks hold no copy. Every visible or announced string comes in as a prop, so each app passes its own translations.

Apps must let Tailwind scan this package. In the app stylesheet:

```css
@import "@workspace/ui/globals.css";
@source "../../../../packages/blocks/src";
```

Render `ConsentBanner` only after hydration, when `useConsent()` from `@workspace/analytics` is `null`, so prerendered HTML never contains it.
