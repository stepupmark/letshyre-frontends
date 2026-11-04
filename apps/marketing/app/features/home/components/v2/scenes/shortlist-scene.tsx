import { useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon, FileTextIcon, UsersIcon } from "lucide-react"
import type { CSSProperties } from "react"

import { Avatar } from "@/components/art/avatar"

import { Bar, Panel, Stage } from "../stage"

export function ShortlistScene() {
  const { t } = useTranslation("homeV2")
  const text = t("shortlist.scene.text", { returnObjects: true })
  const chips = t("shortlist.scene.chips", { returnObjects: true })
  const people = t("shortlist.scene.people", { returnObjects: true })
  const markOrder = text.map(
    (_, index) => text.slice(0, index).filter((part) => part.mark).length
  )

  return (
    <Stage label={t("shortlist.scene.label")}>
      <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,0.9fr)_auto_minmax(0,1.2fr)]">
        <Panel className="p-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileTextIcon className="size-3.5" />
            {t("shortlist.scene.jd")}
          </p>
          <p className="mt-2 text-sm font-semibold">
            {t("shortlist.scene.title")}
          </p>
          <p className="isolate mt-2 text-sm text-pretty text-muted-foreground">
            {text.map((part, index) =>
              part.mark ? (
                <span
                  key={index}
                  className="relative font-medium text-brand-text"
                >
                  <span
                    className="mark-in absolute -inset-x-0.5 inset-y-0 -z-10 rounded-sm bg-brand-muted"
                    style={{ "--i": markOrder[index] } as CSSProperties}
                  />
                  {part.text}
                </span>
              ) : (
                <span key={index}>{part.text}</span>
              )
            )}
          </p>
          <p className="mt-4 border-t pt-3 text-xs font-medium text-brand-text">
            {t("shortlist.scene.found")}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {chips.map((chip, index) => (
              <li
                key={chip}
                className="drop-in rounded-md bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-text"
                style={{ "--i": index + 2 } as CSSProperties}
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
          <p className="flex items-center justify-between gap-3 border-b px-4 py-2.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {t("shortlist.scene.ranked")}
            </span>
            <span className="tabular-nums">{t("shortlist.scene.applied")}</span>
          </p>
          <ol>
            {people.map((person, index) => (
              <li
                key={person.name}
                className="drop-in flex items-center gap-2.5 border-b px-4 py-2.5 last:border-0"
                style={{ "--i": index + 3 } as CSSProperties}
              >
                <span className="w-3 text-xs text-muted-foreground tabular-nums">
                  {index + 1}
                </span>
                <Avatar name={person.name} className="size-7 text-xs" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">
                      {person.name}
                    </span>
                    {person.pool && (
                      <UsersIcon className="size-3.5 shrink-0 text-brand-text" />
                    )}
                  </span>
                  <span className="mt-1.5 block">
                    <Bar value={person.score} />
                  </span>
                </span>
                <span className="w-7 text-end font-semibold text-brand-text tabular-nums">
                  {person.score}
                </span>
              </li>
            ))}
          </ol>
          <p className="flex items-center gap-1.5 border-t px-4 py-2 text-xs text-muted-foreground">
            <UsersIcon className="size-3.5 text-brand-text" />
            {t("shortlist.scene.pool")}
          </p>
        </Panel>
      </div>
    </Stage>
  )
}
