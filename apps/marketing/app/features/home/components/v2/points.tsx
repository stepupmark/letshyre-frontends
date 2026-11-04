import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon } from "lucide-react"

export function Points({
  items,
  className,
}: {
  items: readonly string[]
  className?: string
}) {
  return (
    <ul className={cn("flex flex-col gap-2.5 text-sm", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-pretty">
          <CheckIcon
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-brand-text"
          />
          {item}
        </li>
      ))}
    </ul>
  )
}
