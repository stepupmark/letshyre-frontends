import { Input } from "@workspace/ui/components/input"

interface DateRangeFilterProps {
  from: string
  to: string
  onChange: (range: { from: string; to: string }) => void
}

export function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        aria-label="From date"
        className="w-auto"
        value={from}
        max={to || undefined}
        onChange={(event) => {
          onChange({ from: event.target.value, to })
        }}
      />
      <span className="text-sm text-muted-foreground">to</span>
      <Input
        type="date"
        aria-label="To date"
        className="w-auto"
        value={to}
        min={from || undefined}
        onChange={(event) => {
          onChange({ from, to: event.target.value })
        }}
      />
    </div>
  )
}
