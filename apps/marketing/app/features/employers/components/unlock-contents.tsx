import { useTranslation } from "@workspace/i18n/react"
import {
  ContactIcon,
  FileTextIcon,
  FolderIcon,
  LockIcon,
  LockOpenIcon,
  ScrollTextIcon,
  VideoIcon,
} from "lucide-react"

import { Band } from "@/components/band"
import { BandHeading } from "@/components/band-heading"

interface Item {
  label: string
  body: string
}

const PAID_ICONS = [
  FileTextIcon,
  ContactIcon,
  FolderIcon,
  ScrollTextIcon,
  VideoIcon,
]

export function UnlockContents() {
  const { t } = useTranslation("employers")
  const free = t("unlock.free.items", { returnObjects: true })
  const paid = t("unlock.paid.items", { returnObjects: true }) as Item[]

  return (
    <Band id="unlock">
      <BandHeading
        id="unlock-title"
        className="slide-in"
        eyebrow={t("unlock.eyebrow")}
        title={t("unlock.title")}
        accent={t("unlock.accent")}
        description={t("unlock.description")}
      />

      <div className="mt-14 grid gap-4 lg:grid-cols-[minmax(0,2fr)_auto_minmax(0,3fr)] lg:items-stretch">
        <div className="reveal rounded-3xl border p-6 sm:p-7">
          <h3 className="text-lg font-semibold">{t("unlock.free.title")}</h3>
          <ul className="mt-5 flex flex-wrap gap-2">
            {free.map((item) => (
              <li
                key={item}
                className="rounded-full border bg-muted/40 px-3 py-1.5 text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          aria-hidden
          className="flex items-center justify-center gap-3 lg:flex-col"
        >
          <span className="h-px w-12 bg-border lg:h-12 lg:w-px" />
          <span className="flex size-12 items-center justify-center rounded-full border bg-background text-brand-text">
            <LockIcon className="size-5" />
          </span>
          <span className="h-px w-12 bg-border lg:h-12 lg:w-px" />
        </div>

        <div className="reveal rounded-3xl border border-brand/25 bg-brand-muted/30 p-6 sm:p-7">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-brand-text">
            <LockOpenIcon aria-hidden className="size-5" />
            {t("unlock.paid.title")}
          </h3>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {paid.map((item, i) => {
              const Icon = PAID_ICONS[i] ?? FileTextIcon
              return (
                <li key={item.label} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-brand-text">
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <span>
                    <span className="block font-medium">{item.label}</span>
                    <span className="block text-sm text-pretty text-muted-foreground">
                      {item.body}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </Band>
  )
}
