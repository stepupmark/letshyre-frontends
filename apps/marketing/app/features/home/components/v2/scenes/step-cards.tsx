import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { FileTextIcon, LockOpenIcon, PhoneIcon } from "lucide-react"

import { Avatar } from "@/components/art/avatar"
import { ScoreRing } from "@/components/art/score-ring"

import { Panel, Stage } from "../stage"

const QUESTIONS = 8
const CURRENT = 4

export function ShortlistCard() {
  const { t } = useTranslation("homeV2")

  return (
    <Stage label={t("shortlist.card.label")}>
      <Panel className="p-4">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileTextIcon className="size-3.5" />
          {t("shortlist.card.jd")}
        </p>
        <p className="mt-1 text-sm font-semibold">{t("shortlist.card.job")}</p>
        <p className="mt-3 text-xs font-medium text-brand-text">
          {t("shortlist.card.found")}
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {t("shortlist.card.chips", { returnObjects: true }).map((chip) => (
            <li
              key={chip}
              className="rounded-md bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-text"
            >
              {chip}
            </li>
          ))}
        </ul>
      </Panel>
    </Stage>
  )
}

export function EvidenceCard() {
  const { t } = useTranslation("homeV2")

  return (
    <Stage label={t("evidence.card.label")}>
      <Panel className="p-4">
        <div className="flex items-center gap-3">
          <ScoreRing score={78} caption={t("evidence.card.outOf")} compact />
          <div className="min-w-0">
            <p className="text-sm font-semibold">{t("evidence.card.title")}</p>
            <p className="mt-1 inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              {t("evidence.card.strong")}
            </p>
          </div>
        </div>
        <div className="mt-3 border-t pt-3">
          <p className="flex justify-between text-xs text-muted-foreground">
            {t("evidence.card.question")}
            <span className="tabular-nums">{t("evidence.card.duration")}</span>
          </p>
          <span className="mt-2 flex gap-1">
            {Array.from({ length: QUESTIONS }, (_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  index < CURRENT
                    ? "bg-brand"
                    : index === CURRENT
                      ? "bg-brand/40"
                      : "bg-muted"
                )}
              />
            ))}
          </span>
        </div>
      </Panel>
    </Stage>
  )
}

export function UnlockCard() {
  const { t } = useTranslation("homeV2")

  return (
    <Stage label={t("unlock.card.label")}>
      <Panel className="p-4">
        <div className="flex items-center gap-3">
          <Avatar name={t("unlock.card.name")} className="size-9 text-xs" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {t("unlock.card.name")}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {t("unlock.card.role")}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-text">
            <LockOpenIcon className="size-3" />
            {t("unlock.card.unlocked")}
          </span>
        </div>
        <p className="mt-3 flex items-center justify-between gap-3 border-t pt-3 text-sm">
          <span className="flex items-center gap-2 tabular-nums">
            <PhoneIcon className="size-4 text-muted-foreground" />
            {t("unlock.card.phone")}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {t("unlock.card.credit")}
          </span>
        </p>
      </Panel>
    </Stage>
  )
}
