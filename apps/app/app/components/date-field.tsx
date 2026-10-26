import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { cn } from "@workspace/ui/lib/utils"
import { Check } from "lucide-react"
import {
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react"

import { toIsoDate } from "@/lib/date"

import { DatePopover, type CalendarRange } from "./date-popover"

type Part = "day" | "month" | "year"
type Parts = Record<Part, string>
const SIZE: Record<Part, number> = { day: 2, month: 2, year: 4 }
// a first digit above this can't start a two-digit day or month, so we move on
const MAX_LEAD: Record<Part, number> = { day: 3, month: 1, year: 9 }
const SEPARATORS = ["/", ".", "-", " ", ","]

/** The locale's own order and separator, e.g. DD/MM/YYYY for en-IN. */
function layoutOf(locale: string) {
  // plain "en" means US order to Intl; our English users expect day first
  const parts = new Intl.DateTimeFormat(locale === "en" ? "en-IN" : locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date(2000, 11, 31))
  return {
    order: parts
      .map((part) => part.type)
      .filter((type): type is Part => type in SIZE),
    separator:
      parts.find((part) => part.type === "literal")?.value.trim() ?? "/",
  }
}

const split = (value: string): Parts => {
  const [year = "", month = "", day = ""] = value ? value.split("-") : []
  return { year, month, day }
}

const join = ({ year, month, day }: Parts) =>
  year || month || day ? `${year}-${month}-${day}` : ""

const pad = (part: Part, digits: string) =>
  part !== "year" && digits.length === 1 && digits !== "0"
    ? digits.padStart(2, "0")
    : digits

/**
 * Day, month and year boxes in the locale's order, with an optional calendar.
 * The value is yyyy-mm-dd, or a partial like "1998--15" while typing.
 */
export function DateField({
  label,
  hint,
  error,
  note,
  value,
  valid = false,
  autoComplete,
  calendar,
  inputRef,
  onChange,
  onBlur,
}: {
  label: ReactNode
  hint?: ReactNode
  error?: string
  /** a short read-back on the label's row, like "27 years old" */
  note?: string
  value: string
  valid?: boolean
  /** "bday" fills each box from the browser's saved birthday */
  autoComplete?: "bday"
  calendar?: CalendarRange
  inputRef?: Ref<HTMLInputElement>
  onChange: (value: string) => void
  onBlur: () => void
}) {
  const { t } = useTranslation("common")
  const locale = useLocale()
  const id = useId()
  const group = useRef<HTMLDivElement>(null)
  const boxes = useRef<Partial<Record<Part, HTMLInputElement | null>>>({})
  const [open, setOpen] = useState(false)
  const { order, separator } = layoutOf(locale)
  const parts = split(value)

  const focusAt = (index: number) => {
    const part = order[index]
    if (part) boxes.current[part]?.focus()
  }
  const update = (part: Part, digits: string) => {
    onChange(join({ ...parts, [part]: digits }))
  }

  const type = (part: Part, raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, SIZE[part])
    const done =
      digits.length === SIZE[part] ||
      (digits.length === 1 && Number(digits) > MAX_LEAD[part])
    update(part, done ? pad(part, digits) : digits)
    if (done) focusAt(order.indexOf(part) + 1)
  }

  const keyDown = (part: Part, event: KeyboardEvent<HTMLInputElement>) => {
    const at = order.indexOf(part)
    if (event.key === "Backspace" && !event.currentTarget.value && at > 0) {
      event.preventDefault()
      focusAt(at - 1)
    } else if (SEPARATORS.includes(event.key)) {
      event.preventDefault()
      if (!parts[part]) return
      update(part, pad(part, parts[part]))
      focusAt(at + 1)
    }
  }

  const paste = (event: ClipboardEvent<HTMLInputElement>) => {
    const numbers = event.clipboardData.getData("text").match(/\d+/g)
    if (numbers?.length !== 3) return
    event.preventDefault()
    const named: Parts =
      numbers[0].length === 4
        ? { year: numbers[0], month: numbers[1] ?? "", day: numbers[2] ?? "" }
        : (Object.fromEntries(
            order.map((part, i) => [part, numbers[i] ?? ""])
          ) as Parts)
    onChange(
      join({
        year: named.year.slice(0, 4),
        month: pad("month", named.month.slice(0, 2)),
        day: pad("day", named.day.slice(0, 2)),
      })
    )
  }

  const leave = (event: FocusEvent) => {
    if (!group.current?.contains(event.relatedTarget) && !open) onBlur()
  }

  return (
    <Field
      data-invalid={Boolean(error)}
      aria-labelledby={`${id}-label`}
      aria-describedby={
        [hint && `${id}-hint`, error && `${id}-error`]
          .filter(Boolean)
          .join(" ") || undefined
      }
    >
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel id={`${id}-label`} htmlFor={`${id}-${order[0]}`}>
          {label}
        </FieldLabel>
        {note && (
          <span
            aria-live="polite"
            className="rounded-full bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-text tabular-nums motion-safe:animate-in motion-safe:fade-in"
          >
            {note}
          </span>
        )}
      </div>
      <div
        ref={group}
        data-invalid={Boolean(error)}
        className="flex h-8 w-full min-w-0 items-center gap-0.5 rounded-lg border border-input bg-transparent ps-2 pe-1 text-base transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-[invalid=true]:border-destructive data-[invalid=true]:ring-3 data-[invalid=true]:ring-destructive/20 md:text-sm dark:bg-input/30"
      >
        {order.map((part, i) => (
          <span key={part} className="contents">
            {i > 0 && (
              <span aria-hidden="true" className="text-muted-foreground">
                {separator}
              </span>
            )}
            <input
              ref={(input) => {
                boxes.current[part] = input
                if (i !== 0 || !inputRef) return
                if (typeof inputRef === "function") inputRef(input)
                else inputRef.current = input
              }}
              id={`${id}-${part}`}
              aria-label={t(`date.${part}`)}
              aria-invalid={Boolean(error)}
              inputMode="numeric"
              autoComplete={autoComplete && `${autoComplete}-${part}`}
              placeholder={t(`date.${part}Short`)}
              maxLength={SIZE[part]}
              dir="ltr"
              value={parts[part]}
              onChange={(event) => {
                type(part, event.target.value)
              }}
              onKeyDown={(event) => {
                keyDown(part, event)
              }}
              onFocus={(event) => {
                event.target.select()
              }}
              onBlur={(event) => {
                const typed = event.currentTarget.value
                if (part !== "year" && typed.length === 1)
                  update(part, pad(part, typed))
                leave(event)
              }}
              onPaste={paste}
              className={cn(
                "rounded-sm bg-transparent px-0.5 text-center tabular-nums outline-none placeholder:text-muted-foreground/70 focus:bg-brand-muted focus:text-brand-text",
                part === "year" ? "w-[5ch]" : "w-[3ch]"
              )}
            />
          </span>
        ))}
        <span className="flex-1" />
        {valid && (
          <Check
            aria-hidden="true"
            strokeWidth={2.5}
            className="pop me-1.5 size-4 shrink-0 text-success"
          />
        )}
        {calendar && (
          <DatePopover
            value={value}
            range={calendar}
            open={open}
            onOpenChange={(next) => {
              setOpen(next)
              if (!next) onBlur()
            }}
            onPick={(date) => {
              onChange(toIsoDate(date))
              setOpen(false)
              onBlur()
            }}
          />
        )}
      </div>
      {hint && <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </Field>
  )
}
