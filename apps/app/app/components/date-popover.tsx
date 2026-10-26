import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { useQuery } from "@tanstack/react-query"
import { CalendarDays } from "lucide-react"
import type { Locale } from "react-day-picker"

import { parseIsoDate, startOfToday } from "@/lib/date"

export interface CalendarRange {
  min: Date
  max: Date
}

export function DatePopover({
  value,
  range,
  open,
  onOpenChange,
  onPick,
}: {
  value: string
  range: CalendarRange
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (date: Date) => void
}) {
  const { t } = useTranslation("common")
  const locale = useLocale()
  const picked = parseIsoDate(value) ?? undefined
  const today = startOfToday()
  const dates = useQuery({
    queryKey: ["calendar-locale", locale],
    queryFn: () => loadLocale(locale),
    enabled: open,
    staleTime: Infinity,
  })
  const format = (options: Intl.DateTimeFormatOptions) => (date: Date) =>
    new Intl.DateTimeFormat(locale, options).format(date)

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        aria-label={t("date.open")}
        className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-brand-muted aria-expanded:text-brand-text"
      >
        <CalendarDays className="size-4" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-1">
        <Calendar
          mode="single"
          required
          captionLayout="dropdown"
          locale={dates.data}
          dir={dirFor(locale)}
          selected={picked}
          defaultMonth={picked ?? (today > range.max ? range.max : today)}
          startMonth={range.min}
          endMonth={range.max}
          disabled={[{ before: range.min }, { after: range.max }]}
          formatters={{
            formatCaption: format({ month: "long", year: "numeric" }),
            formatMonthDropdown: format({ month: "short" }),
            formatWeekdayName: format({ weekday: "narrow" }),
          }}
          onSelect={onPick}
          className="**:data-[selected-single=true]:text-on-media [--cell-size:--spacing(8)] **:data-today:bg-transparent **:data-today:font-semibold **:data-today:text-brand-text **:data-today:ring-1 **:data-today:ring-brand/40 **:data-today:ring-inset **:data-[selected-single=true]:bg-brand **:data-[selected-single=true]:hover:bg-brand/90 **:data-today:data-selected:ring-0"
        />
      </PopoverContent>
    </Popover>
  )
}

// Malayalam and Urdu have no DayPicker locale; Intl still names their months
const LOCALES: Record<string, () => Promise<Locale>> = {
  ar: () => import("react-day-picker/locale/ar").then((m) => m.ar),
  bn: () => import("react-day-picker/locale/bn").then((m) => m.bn),
  de: () => import("react-day-picker/locale/de").then((m) => m.de),
  es: () => import("react-day-picker/locale/es").then((m) => m.es),
  fr: () => import("react-day-picker/locale/fr").then((m) => m.fr),
  hi: () => import("react-day-picker/locale/hi").then((m) => m.hi),
  id: () => import("react-day-picker/locale/id").then((m) => m.id),
  it: () => import("react-day-picker/locale/it").then((m) => m.it),
  ja: () => import("react-day-picker/locale/ja").then((m) => m.ja),
  kn: () => import("react-day-picker/locale/kn").then((m) => m.kn),
  ko: () => import("react-day-picker/locale/ko").then((m) => m.ko),
  nl: () => import("react-day-picker/locale/nl").then((m) => m.nl),
  pt: () => import("react-day-picker/locale/pt").then((m) => m.pt),
  ru: () => import("react-day-picker/locale/ru").then((m) => m.ru),
  ta: () => import("react-day-picker/locale/ta").then((m) => m.ta),
  te: () => import("react-day-picker/locale/te").then((m) => m.te),
}

const loadLocale = (locale: string) =>
  (
    LOCALES[locale.split("-")[0] ?? ""] ??
    (() => import("react-day-picker/locale/en-IN").then((m) => m.enIN))
  )()
