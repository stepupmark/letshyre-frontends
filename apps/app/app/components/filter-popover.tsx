import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"

/** A desktop filter button; small screens get the same fields in a sheet. */
export function FilterPopover({
  label,
  active,
  badge,
  open,
  onOpenChange,
  className,
  children,
}: {
  label: string
  active: boolean
  badge?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: ReactNode
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "group max-md:hidden",
              active && "border-brand/40 bg-brand-muted hover:bg-brand-muted",
              className
            )}
          />
        }
      >
        {label}
        {badge}
        <ChevronDown className="text-muted-foreground transition-transform duration-200 group-data-popup-open:rotate-180 motion-reduce:transition-none" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 gap-0 p-4">
        {children}
      </PopoverContent>
    </Popover>
  )
}
