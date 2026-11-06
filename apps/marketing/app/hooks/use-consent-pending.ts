import { useConsent } from "@workspace/analytics"

import { analyticsEnabled } from "@/lib/analytics"

import { useHydrated } from "./use-hydrated"

/** True while the consent banner is up, waiting for an answer. */
export function useConsentPending() {
  const consent = useConsent()
  const hydrated = useHydrated()
  return analyticsEnabled && hydrated && !consent
}
