import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useId, useState } from "react"

export function TextFilter({
  label,
  placeholder,
  value,
  picks,
  picksLabel,
  onApply,
}: {
  label: string
  placeholder: string
  value: string
  picks?: readonly string[]
  picksLabel?: string
  onApply: (value: string) => void
}) {
  const { t } = useTranslation("candidateSearch")
  const id = useId()
  const [text, setText] = useState(value)

  return (
    <div className="flex flex-col gap-4">
      {picks && (
        <div className="flex flex-col gap-2">
          <p id={`${id}-picks`} className="text-sm font-medium">
            {picksLabel}
          </p>
          <div
            role="group"
            aria-labelledby={`${id}-picks`}
            className="flex flex-wrap gap-1.5"
          >
            {picks.map((pick) => {
              const on = pick.toLowerCase() === value.toLowerCase()
              return (
                <button
                  key={pick}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    const next = on ? "" : pick
                    setText(next)
                    onApply(next)
                  }}
                  className="h-7 rounded-full border px-3 text-xs font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-brand/40 aria-pressed:bg-brand-muted aria-pressed:text-brand-text max-md:h-9"
                >
                  {pick}
                </button>
              )
            })}
          </div>
        </div>
      )}
      <form
        noValidate
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          onApply(text.trim())
        }}
      >
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <div className="flex gap-2">
          <Input
            id={id}
            value={text}
            maxLength={80}
            autoComplete="off"
            placeholder={placeholder}
            className="max-md:h-11"
            onChange={(event) => {
              setText(event.target.value)
            }}
          />
          <Button type="submit" variant="outline" className="max-md:h-11">
            {t("filters.apply")}
          </Button>
        </div>
      </form>
    </div>
  )
}
