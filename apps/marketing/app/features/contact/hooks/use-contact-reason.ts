import { useSearchParams } from "react-router"

import { useHydrated } from "@/hooks/use-hydrated"

import type { Reason } from "../lib/topics"

/** `?topic=sales` from the pricing page marks the message as a sales enquiry. */
export function useContactReason(): Reason | null {
  const [params] = useSearchParams()
  // the page is prerendered without a query string, so read it after hydration
  const hydrated = useHydrated()
  return hydrated && params.get("topic") === "sales" ? "sales" : null
}
