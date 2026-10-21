import { Avatar } from "./avatar"

export function FileHead({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={name} className="size-10" />
      <div className="min-w-0">
        <p className="font-semibold">{name}</p>
        <p className="truncate text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}

/** A label and value on one line, as a file shows its facts. */
export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  )
}
