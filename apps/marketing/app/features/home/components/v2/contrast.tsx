import { useTranslation } from "@workspace/i18n/react"
import { CheckIcon, ShieldCheckIcon, XIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Avatar } from "@/components/art/avatar"
import { BandHeading } from "@/components/band-heading"
import { Band } from "@/components/band"

import { Panel } from "./stage"

const PILE = [-4, 2, -1]

export function Contrast() {
  const { t } = useTranslation(["homeV2"])
  const words = t("contrast.scene.buzzwords", { returnObjects: true })

  return (
    <Band id="contrast" muted>
      <BandHeading
        id="contrast-title"
        eyebrow={t("contrast.eyebrow")}
        title={t("contrast.title")}
        accent={t("contrast.accent")}
        className="slide-in max-w-3xl"
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Side
          tone="before"
          title={t("contrast.before.title")}
          items={t("contrast.before.items", { returnObjects: true })}
          scene={
            <div aria-hidden className="relative mx-auto h-36 w-full max-w-64">
              {PILE.map((tilt, index) => (
                <Panel
                  key={tilt}
                  className="absolute inset-x-0 top-0 p-3"
                  style={{
                    rotate: `${String(tilt)}deg`,
                    translate: `${String(index * 10)}px ${String(index * 16)}px`,
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="size-6 rounded-full bg-muted" />
                    <span className="h-1.5 w-24 rounded-full bg-muted-foreground/25" />
                  </span>
                  <span className="mt-3 flex flex-wrap gap-1.5">
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
          }
        />
        <Side
          tone="after"
          title={t("contrast.after.title")}
          items={t("contrast.after.items", { returnObjects: true })}
          scene={
            <div aria-hidden className="flex h-36 items-center">
              <Panel className="pop-in mx-auto flex w-full max-w-72 items-center gap-3 border-brand/30 p-4">
                <Avatar name={t("contrast.scene.name")} />
                <span className="min-w-0">
                  <span className="block font-semibold">
                    {t("contrast.scene.name")}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {t("contrast.scene.role")}
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
                    <span className="inline-flex items-center gap-1 text-success">
                      <ShieldCheckIcon className="size-3.5" />
                      {t("contrast.scene.verified")}
                    </span>
                    <span className="text-brand-text tabular-nums">
                      {t("contrast.scene.score")}
                    </span>
                  </span>
                </span>
              </Panel>
            </div>
          }
        />
      </div>
    </Band>
  )
}

function Side({
  tone,
  title,
  items,
  scene,
}: {
  tone: "before" | "after"
  title: string
  items: readonly string[]
  scene: ReactNode
}) {
  const Icon = tone === "before" ? XIcon : CheckIcon

  return (
    <article className="slide-in flex flex-col rounded-3xl border bg-card p-6 sm:p-8">
      {scene}
      <h3 className="mt-10 text-lg font-semibold">{title}</h3>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-pretty">
            <span
              className={
                tone === "before"
                  ? "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  : "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-text"
              }
            >
              <Icon aria-hidden className="size-3" />
            </span>
            <span
              className={
                tone === "before" ? "text-muted-foreground" : undefined
              }
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </article>
  )
}
