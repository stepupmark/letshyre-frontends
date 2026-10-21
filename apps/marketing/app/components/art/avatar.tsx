import { cn } from "@workspace/ui/lib/utils"

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase()

export function Avatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-muted text-sm font-semibold text-brand-text",
        className
      )}
    >
      {initials(name)}
    </span>
  )
}
