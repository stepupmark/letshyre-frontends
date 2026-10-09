import { cn } from "@workspace/ui/lib/utils"

export interface Side {
  label: string
  body: string
}

export function SideBySide({
  sides,
  className,
}: {
  sides: Side[]
  className?: string
}) {
  return (
    <dl
      className={cn(
        "grid gap-6 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2",
        className
      )}
    >
      {sides.map((side) => (
        <div key={side.label}>
          <dt className="text-sm font-semibold">{side.label}</dt>
          <dd className="mt-2 text-pretty text-muted-foreground">
            {side.body}
          </dd>
        </div>
      ))}
    </dl>
  )
}
