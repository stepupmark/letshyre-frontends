export interface AnalyticsConfig {
  /** Only production should send anything. */
  enabled: boolean
  /** Turn off only if the consent decision (O2) says no banner is needed. */
  requireConsent: boolean
  metaPixelId?: string
  /** Shared by both apps, e.g. `.letshyre.ai`. Omit on localhost. */
  cookieDomain?: string
}

let config: AnalyticsConfig = { enabled: false, requireConsent: true }

export function configureAnalytics(next: Partial<AnalyticsConfig>) {
  config = { ...config, ...next }
}

export const getConfig = (): Readonly<AnalyticsConfig> => config
