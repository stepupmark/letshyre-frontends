import type { ReactNode } from "react"

import { Button } from "@workspace/ui/components/button"

interface ConsentBannerProps {
  /** Names the region for screen readers, e.g. "Cookie preferences". */
  label: string
  /** May include a link to the privacy policy. */
  children: ReactNode
  acceptLabel: string
  rejectLabel: string
  onAccept: () => void
  onReject: () => void
}

/** Non-modal: the page stays usable. Both choices carry the same weight. */
export function ConsentBanner({
  label,
  children,
  acceptLabel,
  rejectLabel,
  onAccept,
  onReject,
}: ConsentBannerProps) {
  return (
    <section
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:inset-s-auto sm:inset-e-4 sm:bottom-4 sm:max-w-sm sm:p-0"
    >
      <div className="flex flex-col gap-4 rounded-xl border bg-popover p-4 text-sm text-popover-foreground shadow-lg">
        <div className="text-pretty text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onReject}>
            {rejectLabel}
          </Button>
          <Button variant="outline" onClick={onAccept}>
            {acceptLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
