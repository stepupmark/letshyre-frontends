import { useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon, FileTextIcon } from "lucide-react"
import type { CSSProperties } from "react"

import { Avatar } from "@/components/art/avatar"

import { Bar, Panel, Stage } from "../stage"

const TEXT_LINES = [92, 80, 86, 64]

export function ShortlistScene() {
  const { t } = useTranslation("homeV2")
  const chips = t("shortlist.scene.chips", { returnObjects: true })
  const people = t("shortlist.scene.people", { returnObjects: true })
  const scores = t("shortlist.scene.scores", { returnObjects: true })

  return (
    <Stage label={t("shortlist.scene.label")}>
      <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)]">
        <Panel className="p-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileTextIcon className="size-3.5" />
            {t("shortlist.scene.jd")}
          </p>
          <p className="mt-2 text-sm font-semibold">
            {t("shortlist.scene.title")}
          </p>
          <div className="mt-3 flex flex-col gap-1.5">
            {TEXT_LINES.map((width) => (
              <span
                key={width}
                className="h-1.5 rounded-full bg-muted"
                style={{ width: `${String(width)}%` }}
              />
            ))}
          </div>
          <p className="mt-4 text-xs font-medium text-brand-text">
            {t("shortlist.scene.found")}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {chips.map((chip, index) => (
              <li
                key={chip}
                className="drop-in rounded-md bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-text"
                style={{ "--i": index } as CSSProperties}
              >
                {chip}
              </li>
            ))}
          </ul>
        </Panel>

        <span className="mx-auto flex size-8 items-center justify-center rounded-full border bg-card text-muted-foreground max-sm:rotate-90">
          <ArrowRightIcon className="size-4 rtl:-scale-x-100" />
        </span>

        <Panel>
          <p className="border-b px-4 py-2.5 text-xs text-muted-foreground">
            {t("shortlist.scene.ranked")}
          </p>
          <ol>
            {people.map((name, index) => (
              <li
                key={name}
                className="drop-in flex items-center gap-3 border-b px-4 py-2.5 last:border-0"
                style={{ "--i": index + 2 } as CSSProperties}
              >
                <Avatar name={name} className="size-7 text-xs" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {name}
                  </span>
                  <Bar value={scores[index] ?? 0} />
                </span>
                <span className="w-7 text-end font-semibold text-brand-text tabular-nums">
                  {scores[index]}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </Stage>
  )
}
