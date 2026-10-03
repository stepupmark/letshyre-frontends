import { pageView, useConsent } from "@workspace/analytics"
import { useEffect } from "react"
import { useLocation } from "react-router"

import "../lib/analytics"

/** One page view per pathname, re-sent once the visitor accepts. */
export function usePageViews() {
  const { pathname } = useLocation()
  const consent = useConsent()

  useEffect(() => {
    pageView()
  }, [pathname, consent])
}
