import { useTranslation } from "@workspace/i18n/react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useId } from "react"
import { createPortal } from "react-dom"

import { duration, ease } from "@/lib/motion"

import type { FieldMenuState } from "../../hooks/use-field-menu"

const ROW = 36
const GAP = 6
// matches w-64
const WIDTH = 256

export function FieldMenu({
  menu,
  labelOf,
}: {
  menu: FieldMenuState | null
  labelOf: (key: string) => string | null
}) {
  const { t } = useTranslation("invitations")
  const id = useId()
  const rect = menu?.rect
  const rtl = document.documentElement.dir === "rtl"
  const estimate = Math.max(menu?.items.length ?? 0, 1) * ROW + 8
  const above = rect ? rect.bottom + GAP + estimate > window.innerHeight : false
  const start = rect
    ? Math.max(
        8,
        Math.min(
          rtl ? window.innerWidth - rect.right : rect.left,
          window.innerWidth - WIDTH - 8
        )
      )
    : 0

  return createPortal(
    <AnimatePresence>
      {menu && rect && (
        <m.div
          role="listbox"
          id={id}
          aria-label={t("toolbar.fields")}
          initial={{ opacity: 0, y: above ? 4 : -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.fast, ease }}
          style={
            above
              ? {
                  bottom: window.innerHeight - rect.top + GAP,
                  insetInlineStart: start,
                }
              : { top: rect.bottom + GAP, insetInlineStart: start }
          }
          className="fixed z-50 flex w-64 flex-col rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {menu.items.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">
              {t("toolbar.noFields")}
            </p>
          ) : (
            menu.items.map((key, i) => (
              <div
                key={key}
                role="option"
                tabIndex={-1}
                aria-selected={i === menu.active}
                onMouseDown={(event) => {
                  event.preventDefault()
                  menu.pick(key)
                }}
                className="flex cursor-default items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <span className="truncate">{labelOf(key)}</span>
                <code className="truncate font-mono text-xs text-muted-foreground">
                  {key}
                </code>
              </div>
            ))
          )}
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
