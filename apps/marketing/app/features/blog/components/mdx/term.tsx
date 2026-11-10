import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { type ReactNode, use, useId, useRef } from "react"
import { Link } from "react-router"

import { termPath } from "@/lib/blog/paths"

import { TermsContext } from "../../lib/terms"

const OPEN_DELAY = 300

/** A glossary word in a post: hover, focus or tap it for the short definition. */
export function Term({ id, children }: { id: string; children: ReactNode }) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const entry = use(TermsContext)[id]
  const popoverId = useId()
  const anchor = `--term${popoverId.replace(/\W/g, "")}`
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  // a card opened by hovering closes when the mouse leaves; one opened by a click stays
  const byHover = useRef(false)
  if (!entry) return children

  const card = () => document.getElementById(popoverId)
  const show = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (card()?.matches(":popover-open")) return
      byHover.current = true
      card()?.showPopover()
    }, OPEN_DELAY)
  }
  const hide = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (byHover.current && !card()?.matches(":hover")) card()?.hidePopover()
    }, OPEN_DELAY)
  }

  return (
    <>
      <button
        type="button"
        popoverTarget={popoverId}
        popoverTargetAction="show"
        onClick={() => {
          clearTimeout(timer.current)
          byHover.current = false
        }}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") show()
        }}
        onPointerLeave={hide}
        style={{ anchorName: anchor }}
        className="cursor-help rounded-sm text-inherit underline decoration-muted-foreground decoration-dotted underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {children}
      </button>
      <span
        id={popoverId}
        popover="auto"
        onPointerEnter={() => {
          clearTimeout(timer.current)
        }}
        onPointerLeave={hide}
        style={{ positionAnchor: anchor }}
        className="w-72 max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-lg border bg-popover p-4 text-sm text-popover-foreground [position-area:bottom] [position-try-fallbacks:flip-block] open:flex supports-[position-area:bottom]:inset-auto supports-[position-area:bottom]:m-0 supports-[position-area:bottom]:mt-2 supports-[position-area:bottom]:[justify-self:anchor-center]"
      >
        <span className="font-semibold">{entry.term}</span>
        <span className="text-pretty text-muted-foreground">{entry.short}</span>
        <Link
          to={localePath(lang, termPath(id))}
          className="text-link self-start font-medium"
        >
          {t("glossary.readMore")}
        </Link>
      </span>
    </>
  )
}
