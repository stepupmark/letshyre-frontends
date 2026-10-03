export type { EventParams, StandardEvent } from "./adapters/meta-pixel.ts"
export { configureAnalytics, type AnalyticsConfig } from "./config.ts"
export {
  CONSENT_COOKIE,
  parseConsent,
  readConsent,
  setConsent,
  useConsent,
  type Consent,
} from "./consent.ts"
export { canTrack, pageView, track } from "./track.ts"
