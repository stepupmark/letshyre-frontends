import { useTranslation } from "@workspace/i18n/react"
import { CirclePlayIcon, ListOrderedIcon, ShieldCheckIcon } from "lucide-react"

import { Avatar } from "@/components/art/avatar"
import { ScoreRing } from "@/components/art/score-ring"

import { Panel } from "../stage"

const PILE = [
  { rotate: -8, x: -22, y: 14 },
  { rotate: 6, x: 18, y: 6 },
  { rotate: -1, x: 0, y: 0 },
]
const LINES = [92, 74, 84]

export function ResumePile() {
  const { t } = useTranslation("homeV2")
  const words = t("contrast.scene.buzzwords", { returnObjects: true })

  return (
    <div aria-hidden className="relative h-44 w-full max-w-60">
      {PILE.map((card) => (
        <Panel
          key={card.rotate}
          className="fan-out absolute inset-x-0 top-2 p-4"
          style={{
            rotate: `${String(card.rotate)}deg`,
            translate: `${String(card.x)}px ${String(card.y)}px`,
          }}
        >
          <span className="flex items-center gap-2.5">
            <span className="size-7 shrink-0 rounded-full bg-muted" />
            <span className="flex flex-1 flex-col gap-1.5">
              <span className="h-2 w-3/5 rounded-full bg-muted-foreground/25" />
              <span className="h-1.5 w-2/5 rounded-full bg-muted" />
            </span>
          </span>
          <span className="mt-4 flex flex-col gap-1.5">
            {LINES.map((width) => (
              <span
                key={width}
                className="h-1.5 rounded-full bg-muted"
                style={{ width: `${String(width)}%` }}
              />
            ))}
          </span>
          <span className="mt-4 flex flex-wrap gap-1.5">
            {words.map((word) => (
              <span
                key={word}
                className="rounded-md border px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                {word}
              </span>
            ))}
          </span>
        </Panel>
      ))}
      <span className="absolute inset-e-0 -bottom-2 rounded-full border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground tabular-nums">
        {t("contrast.scene.resumes")}
      </span>
    </div>
  )
}

export function VerifiedProfile() {
  const { t } = useTranslation("homeV2")

  return (
    <Panel aria-hidden className="pop-in w-full max-w-72 border-brand/30 p-4">
      <div className="flex items-center gap-3">
        <Avatar name={t("contrast.scene.name")} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{t("contrast.scene.name")}</p>
          <p className="truncate text-xs text-muted-foreground">
            {t("contrast.scene.role")}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 border-t pt-4">
        <ScoreRing score={78} caption={t("contrast.scene.outOf")} compact />
        <ul className="flex min-w-0 flex-col gap-1.5 text-xs">
          <li className="flex items-center gap-1.5 font-medium text-success">
            <ShieldCheckIcon className="size-3.5 shrink-0" />
            {t("contrast.scene.verified")}
          </li>
          <li className="flex items-center gap-1.5 text-muted-foreground">
            <CirclePlayIcon className="size-3.5 shrink-0 text-brand-text" />
            {t("contrast.scene.recording")}
          </li>
          <li className="flex items-center gap-1.5 text-muted-foreground">
            <ListOrderedIcon className="size-3.5 shrink-0 text-brand-text" />
            {t("contrast.scene.rank")}
          </li>
        </ul>
      </div>
    </Panel>
  )
}
