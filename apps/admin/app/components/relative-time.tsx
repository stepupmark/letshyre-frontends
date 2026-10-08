import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import {
  formatDate,
  formatDateTime,
  formatRelative,
  isDateOnly,
} from "@/lib/format"

export function RelativeTime({ value }: { value: string | null | undefined }) {
  const relative = formatRelative(value)
  if (!value || relative === "—") return <>—</>

  return (
    <Tooltip>
      <TooltipTrigger className="whitespace-nowrap">
        <time dateTime={value}>{relative}</time>
      </TooltipTrigger>
      <TooltipContent>
        {isDateOnly(value) ? formatDate(value) : formatDateTime(value)}
      </TooltipContent>
    </Tooltip>
  )
}
