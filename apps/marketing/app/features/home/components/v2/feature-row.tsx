import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon } from "lucide-react"
import type { ReactNode } from "react"

import { BandHeading } from "@/components/band-heading"
import { Band } from "@/components/band"

export function FeatureRow({
  id,
  eyebrow,
  title,
  accent,
  body,
  points,
  actions,
  scene,
  flip,
  muted,
}: {
  id: string
  eyebrow: string
  title: string
  accent: string
  body: string
  points: readonly string[]
  actions?: ReactNode
  scene: ReactNode
  flip?: boolean
  muted?: boolean
}) {
  return (
    <Band
      id={id}
      muted={muted}
      className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16"
    >
      <div className={cn("slide-in", flip && "lg:order-last")}>
        <BandHeading
          id={`${id}-title`}
          eyebrow={eyebrow}
          title={title}
          accent={accent}
          description={body}
        />
        <ul className="mt-8 flex flex-col gap-3">
          {points.map((point) => (
            <li key={point} className="flex gap-3 text-pretty">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-text">
                <CheckIcon aria-hidden className="size-3" />
              </span>
              {point}
            </li>
          ))}
        </ul>
        {actions && (
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            {actions}
          </div>
        )}
      </div>
      <div className="reveal">{scene}</div>
    </Band>
  )
}
