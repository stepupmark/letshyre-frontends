import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Ellipsis } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

import { duration, ease } from "@/lib/motion"

export function Panel({ children }: { children: ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease }}
    >
      {children}
    </m.div>
  )
}

export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </ul>
  )
}

export function CardItem({ children }: { children: ReactNode }) {
  return (
    <m.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: duration.base, ease }}
    >
      {children}
    </m.li>
  )
}

export function CardMenu({
  name,
  children,
}: {
  name: string
  children: ReactNode
}) {
  const { t } = useTranslation("invitations")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="-me-2 -mt-1 text-muted-foreground max-md:size-10"
            aria-label={t("library.actions", { name })}
          />
        }
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}
