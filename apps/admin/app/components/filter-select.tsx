import { cn } from "cn"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

const ALL = "__all"

type FilterSelectProps<T extends string> = {
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
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(next === ALL ? null : (next as T))}
    >
      <SelectTrigger aria-label={label} className={cn("w-40", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => {
          const item =
            typeof option === "string"
              ? { value: option, label: option }
              : option
          return (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
