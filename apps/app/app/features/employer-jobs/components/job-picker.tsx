import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { BriefcaseBusiness } from "lucide-react"
import { useId } from "react"

import type { JobChoice } from "../lib/job-choice"

export function JobPicker({
  label,
  placeholder,
  choices,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  choices: JobChoice[]
  value: string | undefined
  onChange: (id: string) => void
}) {
  const id = useId()
  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:max-w-sm">
      <Label htmlFor={id}>{label}</Label>
      <Select
        items={choices}
        value={value ?? null}
        onValueChange={(next) => {
          if (next) onChange(next)
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <BriefcaseBusiness
            aria-hidden="true"
            className="text-muted-foreground"
          />
          <SelectValue placeholder={placeholder} className="truncate" />
        </SelectTrigger>
        <SelectContent>
          {choices.map((choice) => (
            <SelectItem key={choice.value} value={choice.value}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{choice.label}</span>
                {choice.place && (
                  <span className="truncate text-xs text-muted-foreground">
                    {choice.place}
                  </span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
