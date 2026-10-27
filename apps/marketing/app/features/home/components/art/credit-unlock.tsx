import { useTranslation } from "@workspace/i18n/react"
import { LockIcon, LockOpenIcon } from "lucide-react"

import { Avatar } from "@/components/art/avatar"

const FREE_CREDITS = 10

/** A worked example: scores are free to read, and one credit unlocks one interview. */
export default function CreditUnlock() {
  const { t } = useTranslation("home")
  const unlocks = t("pricing.art.unlocks", { returnObjects: true })

  return (
    <div
      aria-hidden
      className="unlock-stage overflow-hidden rounded-2xl border bg-card"
    >
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-5 py-3.5">
        <p className="flex items-baseline gap-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("pricing.art.example")}
          </span>
          <span className="font-medium">{t("pricing.art.free")}</span>
        </p>
        <p className="grid font-semibold text-brand-text tabular-nums">
          <span className="unlock-out col-start-1 row-start-1 text-end opacity-0">
            {t("pricing.art.left", { n: FREE_CREDITS })}
          </span>
          <span className="unlock-in col-start-1 row-start-1 text-end">
            {t("pricing.art.left", { n: FREE_CREDITS - 1 })}
          </span>
        </p>
      </div>

      <ul className="divide-y">
        <li className="flex items-center gap-4 p-5">
          <LockedFace />
          <div className="min-w-0 flex-1">
            <span className="block h-3 w-32 rounded-full bg-foreground/15" />
            <p className="mt-2 truncate text-sm text-muted-foreground">
              {t("pricing.art.role")}
            </p>
          </div>
          <span className="text-lg font-semibold text-muted-foreground tabular-nums">
            {78}
          </span>
        </li>

        <li className="grid">
          <div className="unlock-out col-start-1 row-start-1 flex items-center gap-4 p-5 opacity-0">
            <LockedFace />
            <div className="min-w-0 flex-1">
              <span className="block h-3 w-32 rounded-full bg-foreground/15" />
              <p className="mt-2 truncate text-sm text-muted-foreground">
                {t("pricing.art.interview")}
              </p>
            </div>
            <span className="text-lg font-semibold text-muted-foreground tabular-nums">
              {86}
            </span>
          </div>
          <div className="unlock-in col-start-1 row-start-1 flex items-start gap-4 bg-brand-muted/30 p-5">
            <Avatar name={t("hero.file.name")} className="size-11 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-semibold">
                <LockOpenIcon className="size-4 text-brand-text" />
                {t("hero.file.name")}
                <span className="ms-auto text-lg tabular-nums">{86}</span>
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {t("pricing.art.interview")}
              </p>
              <p className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                <span className="text-muted-foreground">
                  {unlocks.join(" · ")}
                </span>
                <span className="shrink-0 font-semibold text-brand-text">
                  {t("pricing.art.cost")}
                </span>
              </p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  )
}

function LockedFace() {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <LockIcon className="size-4" />
    </span>
  )
}
