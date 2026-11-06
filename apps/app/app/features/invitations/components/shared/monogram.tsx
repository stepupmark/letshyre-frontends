import { cn } from "@workspace/ui/lib/utils"

const initialsOf = (name: string) =>
  name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toLocaleUpperCase()

export function Monogram({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full bg-brand-muted text-xs font-medium text-brand-text",
        className
      )}
    >
      {initialsOf(name) || "?"}
    </span>
  )
}
