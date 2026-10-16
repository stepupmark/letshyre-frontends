import { useTranslation } from "@workspace/i18n/react"
import {
  BriefcaseIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  FileUpIcon,
  LockIcon,
  LockOpenIcon,
  UserRoundIcon,
  VideoIcon,
} from "lucide-react"

const LOCKED_ICONS = [
  FileTextIcon,
  UserRoundIcon,
  FileUpIcon,
  ClipboardCheckIcon,
  VideoIcon,
]

/** What a candidate file shows up front, and what unlocking adds. */
export function FileAnatomy() {
  const { t } = useTranslation("home")
  const open = t("evidence.open.items", { returnObjects: true })
  const locked = t("evidence.locked.items", { returnObjects: true })

  return (
    <div className="reveal overflow-hidden rounded-2xl border bg-card">
      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">{t("evidence.open.title")}</h3>
          <span
            aria-hidden
            className="rounded-full border border-brand/30 bg-brand-muted px-2.5 py-0.5 text-xs font-medium text-brand-text"
          >
            {t("evidence.notes.compare")}
          </span>
        </div>
        <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {open.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-text">
                <CheckIcon aria-hidden className="size-3" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <details className="group border-t bg-muted/40">
        <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-6 py-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset sm:px-7 [&::-webkit-details-marker]:hidden">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-background transition-colors group-open:border-primary group-open:bg-primary group-open:text-primary-foreground">
            <LockIcon aria-hidden className="size-4 group-open:hidden" />
            <LockOpenIcon
              aria-hidden
              className="pop hidden size-4 group-open:block"
            />
          </span>
          <span className="flex-1 font-semibold">
            {t("evidence.locked.title")}
          </span>
          <span
            aria-hidden
            className="text-xs font-medium text-muted-foreground max-sm:hidden"
          >
            {t("evidence.notes.full")}
          </span>
          <ChevronDownIcon
            aria-hidden
            className="size-4 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <ul className="rise grid gap-x-6 gap-y-3 px-6 pb-6 sm:grid-cols-2 sm:px-7">
          {locked.map((item, index) => {
            const Icon = LOCKED_ICONS[index] ?? BriefcaseIcon
            return (
              <li key={item} className="flex items-center gap-2.5 text-sm">
                <Icon aria-hidden className="size-4 shrink-0 text-brand-text" />
                {item}
              </li>
            )
          })}
        </ul>
      </details>
    </div>
  )
}
