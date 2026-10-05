// the same prefixes nginx sends to this app; everything else is the marketing site
const APP_PATH =
  /^\/(employer|employee|get-started|forgot-password|shared-scorecard|sign-in)(\/|$|[?#])/

/** True for a path this app serves, so it can navigate there without a page load. */
export const isAppPath = (path: string) => APP_PATH.test(path)
