import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

import type { RichText as RichTextValue } from "../lib/legal-doc"

/** Terms with an explanation open it on click, so it works on touch and keyboard too. */
export function RichText({ value }: { value: RichTextValue }) {
  if (typeof value === "string") return value

  return value.map((run, index) => {
    if (typeof run === "string") return run
    if ("highlight" in run)
      return (
        <strong key={index} className="font-semibold text-foreground">
          {run.highlight}
        </strong>
      )
    return (
      <Popover key={index}>
        <PopoverTrigger className="inline rounded-sm font-semibold text-primary underline decoration-dotted underline-offset-4 transition-[text-underline-offset] duration-200 hover:underline-offset-2 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none">
          {run.tip}
        </PopoverTrigger>
        <PopoverContent className="w-64 text-sm">{run.tooltip}</PopoverContent>
      </Popover>
    )
  })
}
