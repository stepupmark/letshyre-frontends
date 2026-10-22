import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Ellipsis, Pause, Pencil, Play, Trash2 } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import { StatusBadge } from "@/components/status-badge"
import { duration, ease } from "@/lib/motion"

import { DEFAULT_TITLE, initials, isActive, nameOf } from "../../lib/team"
import type { Member } from "../../schemas/team.schema"

export function MemberRow({
  member,
  added,
  onEdit,
  onStatus,
  onRemove,
}: {
  member: Member
  added: boolean
  onEdit: () => void
  onStatus: (active: boolean) => void
  onRemove: () => void
}) {
  const { t } = useTranslation("team")
  const active = isActive(member)
  const name = nameOf(member) ?? t("unnamed")
  const title = member.title?.trim()

  return (
    <div
      data-hold={!active}
      className="group relative flex items-center gap-3 p-4 sm:gap-4"
    >
      {added && (
        <m.span
          aria-hidden="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: duration.slow, ease, delay: 0.9 }}
          className="pointer-events-none absolute inset-0 bg-brand-muted"
        />
      )}
      <span
        aria-hidden="true"
        className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-muted text-sm font-medium text-brand-text transition-colors duration-300 group-data-[hold=true]:bg-secondary group-data-[hold=true]:text-secondary-foreground"
      >
        {initials(name)}
        <span className="absolute -inset-e-0.5 -bottom-0.5 flex size-4 scale-0 items-center justify-center rounded-full border-2 border-background bg-warning text-background transition-transform duration-200 group-data-[hold=true]:scale-100 motion-reduce:transition-none">
          <Pause className="size-2 fill-current" />
        </span>
      </span>
      <span className="relative flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium transition-colors group-data-[hold=true]:text-muted-foreground">
          {member.full_name?.trim() ? member.full_name.trim() : t("unnamed")}
        </span>
        {member.email && (
          <span className="truncate text-sm text-muted-foreground">
            {member.email}
          </span>
        )}
      </span>
      {title && title !== DEFAULT_TITLE && (
        <span className="relative hidden text-sm text-muted-foreground sm:block">
          {title}
        </span>
      )}
      <span className="relative grid">
        <AnimatePresence initial={false} mode="popLayout">
          <m.span
            key={String(active)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: duration.fast, ease }}
            className="flex justify-end"
          >
            <StatusBadge tone={active ? "success" : "warning"}>
              {active ? t("active") : t("onHold")}
            </StatusBadge>
          </m.span>
        </AnimatePresence>
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative max-md:size-11"
              aria-label={t("actions", { name })}
            />
          }
        >
          <Ellipsis />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil />
            {t("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onStatus(!active)
            }}
          >
            {active ? <Pause /> : <Play />}
            {active ? t("hold") : t("activate")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onRemove}>
            <Trash2 />
            {t("remove")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
