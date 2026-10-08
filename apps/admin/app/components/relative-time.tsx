import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import {
  formatDate,
  formatDateTime,
  formatRelative,
  isDateOnly,
} from "~/lib/format"

export function RelativeTime({ value }: { value: string | null | undefined }) {
  const relative = formatRelative(value)
  if (!value || relative === "—") return <>—</>

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time dateTime={value} tabIndex={0} className="whitespace-nowrap">
          {relative}
        </time>
      </TooltipTrigger>
      <TooltipContent>
        {isDateOnly(value) ? formatDate(value) : formatDateTime(value)}
      </TooltipContent>
    </Tooltip>
  )
}
