import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Kbd } from "@workspace/ui/components/kbd"
import { AnimatePresence, useReducedMotion } from "motion/react"
import * as m from "motion/react-m"
import { ArrowDown, ArrowUp, ChevronsUpDown, Settings2 } from "lucide-react"
import type { ReactNode, RefObject } from "react"

import { duration, ease } from "@/lib/motion"

import { Pager } from "./pager"

interface HideableColumn {
  id: string
  label: string
  visible: boolean
  toggle: (visible: boolean) => void
}

export function ColumnsMenu({
  columns,
  compact,
  onCompact,
}: {
  columns: HideableColumn[]
  compact: boolean
  onCompact: (compact: boolean) => void
}) {
  const { t } = useTranslation("common")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="max-md:hidden" />
        }
      >
        <Settings2 />
        {t("table.columns")}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {columns.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("table.columns")}</DropdownMenuLabel>
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.visible}
                onCheckedChange={column.toggle}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={compact} onCheckedChange={onCompact}>
          {t("table.compact")}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SortButton({
  sorted,
  onSort,
  children,
}: {
  sorted: false | "asc" | "desc"
  onSort: () => void
  children: ReactNode
}) {
  return (
    <Button variant="ghost" size="sm" className="-ms-2" onClick={onSort}>
      {children}
      {sorted === "asc" ? (
        <ArrowUp />
      ) : sorted === "desc" ? (
        <ArrowDown />
      ) : (
        <ChevronsUpDown className="text-muted-foreground" />
      )}
    </Button>
  )
}

export function TableFooter({
  keyboard,
  page,
  pages,
  top,
  onPage,
}: {
  keyboard: boolean
  page: number
  pages: number
  // the table's top, where focus and scroll go after a page change
  top: RefObject<HTMLElement | null>
  onPage: (page: number) => void
}) {
  const { t } = useTranslation("common")
  const reduceMotion = useReducedMotion()
  return (
    <div className="flex items-center gap-4">
      {keyboard && (
        <p className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground md:flex">
          <Kbd className="text-foreground">J</Kbd>
          <Kbd className="text-foreground">K</Kbd>
          {t("table.navigateHint")}
          <Kbd className="text-foreground">{t("table.enterKey")}</Kbd>
          {t("table.openHint")}
        </p>
      )}
      <div className="min-w-0 flex-1">
        <Pager
          page={page}
          pages={pages}
          onPage={(next) => {
            onPage(next)
            top.current?.focus({ preventScroll: true })
            top.current?.scrollIntoView({
              block: "start",
              behavior: reduceMotion ? "auto" : "smooth",
            })
          }}
        />
      </div>
      {pages > 1 && (
        <p aria-live="polite" className="sr-only">
          {t("table.pageOf", { page, total: pages })}
        </p>
      )}
    </div>
  )
}

export function BulkBar({
  count,
  onClear,
  children,
}: {
  count: number
  onClear: () => void
  children: ReactNode
}) {
  const { t } = useTranslation("common")
  return (
    <AnimatePresence>
      {count > 0 && (
        <m.div
          role="toolbar"
          aria-label={t("table.bulkActions")}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: duration.base, ease }}
          className="fixed inset-x-4 bottom-4 z-20 mx-auto flex max-w-md items-center gap-2 rounded-xl border bg-popover p-2 ps-4 text-sm shadow-lg"
        >
          <span className="me-auto tabular-nums">
            {t("table.selected", { count: count })}
          </span>
          {children}
          <Button size="sm" variant="ghost" onClick={onClear}>
            {t("table.clearSelection")}
          </Button>
        </m.div>
      )}
    </AnimatePresence>
  )
}

interface Selectable {
  getIsSelected: () => boolean
  toggleSelected: (value?: boolean) => void
}

export function RowCheckbox({
  label,
  row,
}: {
  label: string
  row: Selectable
}) {
  return (
    <Checkbox
      aria-label={label}
      checked={row.getIsSelected()}
      onCheckedChange={(checked) => {
        row.toggleSelected(checked)
      }}
    />
  )
}
