import { lazy, Suspense } from "react"

import { useHydrated } from "@/hooks/use-hydrated"
import type { TOOLS } from "@/lib/blog/remark-guard"

const kit: Record<(typeof TOOLS)[number], ReturnType<typeof lazy>> = {
  "bonus-clawback": lazy(() => import("./tools/bonus-clawback")),
  "commute-cost": lazy(() => import("./tools/commute-cost")),
  "ctc-take-home": lazy(() => import("./tools/ctc-take-home")),
  "hire-cost": lazy(() => import("./tools/hire-cost")),
  "notice-buyout": lazy(() => import("./tools/notice-buyout")),
  "offer-compare": lazy(() => import("./tools/offer-compare")),
  "salary-hike": lazy(() => import("./tools/salary-hike")),
}

// close to the loaded tool's height, so the text below doesn't jump
const placeholder = (
  <div
    aria-hidden
    data-wide=""
    className="my-4 h-96 rounded-xl border sm:h-80"
  />
)

/** A calculator in a post. It needs the reader's input, so it loads in the browser only. */
export function Tool({ name }: { name: keyof typeof kit }) {
  const hydrated = useHydrated()
  const Loaded = kit[name]
  if (!hydrated) return placeholder
  return (
    <Suspense fallback={placeholder}>
      <Loaded />
    </Suspense>
  )
}
