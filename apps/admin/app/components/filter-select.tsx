import { cn } from "@workspace/ui/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

const ALL = "__all"

interface FilterSelectProps<T extends string> {
  label: string
  allLabel: string
  value: T | null
  options: readonly (T | { value: T; label: string })[]
  onChange: (value: T | null) => void
  className?: string
}

/** A select whose first option clears the filter. */
export function FilterSelect<T extends string>({
  label,
  allLabel,
  value,
  options,
  onChange,
  className,
}: FilterSelectProps<T>) {
  const items = [
    { value: ALL, label: allLabel },
    ...options.map((option) =>
      typeof option === "string" ? { value: option, label: option } : option
    ),
  ]

  return (
    <Select
      value={value ?? ALL}
      items={items}
      onValueChange={(next) => {
        onChange(next === ALL ? null : (next as T))
      }}
    >
      <SelectTrigger aria-label={label} className={cn("w-40", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
