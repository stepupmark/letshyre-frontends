import { useTranslation } from "@workspace/i18n/react"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import { Check } from "lucide-react"
import * as m from "motion/react-m"
import { useId } from "react"

import { StatusBadge } from "@/components/status-badge"
import { duration, ease } from "@/lib/motion"

import type { Template } from "../../schemas/template.schema"
import { TokenText } from "../shared/field-token"

export function TemplateStep({
  templates,
  value,
  error,
  onChange,
}: {
  templates: Template[]
  value: string | null
  error?: string
  onChange: (id: string) => void
}) {
  const { t } = useTranslation("invitations")
  const selection = useId()
  const errorId = useId()
  const ordered = [
    ...templates.filter((template) => !template.is_system),
    ...templates.filter((template) => template.is_system),
  ]

  return (
    <div className="flex flex-col gap-3">
      <RadioGroup
        aria-label={t("send.templateLabel")}
        aria-describedby={error ? errorId : undefined}
        value={value ?? ""}
        onValueChange={(next) => {
          onChange(String(next))
        }}
        className="gap-3"
      >
        {ordered.map((template) => (
          <label
            key={template.id}
            className="group relative flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/40 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            {template.id === value && (
              <m.span
                layoutId={selection}
                aria-hidden="true"
                transition={{ duration: duration.base, ease }}
                className="pointer-events-none absolute -inset-px rounded-lg border-2 border-brand"
              />
            )}
            <RadioGroupItem value={template.id} className="sr-only" />
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors group-has-data-checked:border-brand group-has-data-checked:bg-brand group-has-data-checked:text-background"
            >
              <Check
                className="size-3 scale-0 transition-transform duration-200 group-has-data-checked:scale-100 motion-reduce:transition-none"
                strokeWidth={3}
              />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-center gap-2">
                <span className="truncate font-medium">{template.name}</span>
                {template.is_system && (
                  <StatusBadge tone="neutral">
                    {t("library.starter")}
                  </StatusBadge>
                )}
              </span>
              <span className="text-sm text-pretty text-muted-foreground">
                <TokenText text={template.subject_template} />
              </span>
            </span>
          </label>
        ))}
      </RadioGroup>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
