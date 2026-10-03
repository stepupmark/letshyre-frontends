# @workspace/analytics

Consent-aware tracking. Today the only destination is the Meta Pixel.

```ts
configureAnalytics({
  enabled: env.VITE_ENV === "production",
  metaPixelId: env.VITE_META_PIXEL_ID,
  cookieDomain: ".letshyre.ai",
})

pageView() // on every navigation
track("Lead", { content_name: "contact" })
```

Nothing loads or sends unless all of these hold:

1. `enabled` is true (production builds only),
2. a pixel id is set,
3. the visitor accepted analytics, unless `requireConsent: false`.

The decision lives in the `lh_consent` cookie (`{ v: 1, analytics, ts }`, six months, shared across subdomains). `useConsent()` returns `null` until the visitor chooses, which is when the consent banner shows. Rejecting also clears Meta's `_fbp`/`_fbc` cookies.

The pixel runs with `autoConfig` off and its own pushState PageViews disabled. Only Meta's standard events are typed, and params are limited to non-personal fields.
