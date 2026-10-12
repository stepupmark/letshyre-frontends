import { useTranslation } from "@workspace/i18n/react"
import { useId, type ReactNode } from "react"

import {
  audienceFromPath,
  REGISTER_PATH,
  type Audience,
} from "../../lib/audience"
import { useRegisterScene, useResetScene } from "./use-flow-scene"
import { CandidateScene, EmployerScene, GeneralScene } from "./scenes"

const SCENES = {
  employer: EmployerScene,
  candidate: CandidateScene,
  general: GeneralScene,
}

/** The illustrated half of the auth screens from lg up. */
export function AuthPanel({ pathname }: { pathname: string }) {
  const audience = audienceFromPath(pathname)
  let content: ReactNode
  if (pathname === "/forgot-password") content = <ResetPanel />
  else if (audience && pathname === REGISTER_PATH[audience])
    content = <RegisterPanel key={audience} audience={audience} />
  else content = <StaticPanel key={audience} side={audience ?? "general"} />

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border bg-muted/50">
      <Backdrop />
      {content}
    </div>
  )
}

function StaticPanel({ side }: { side: keyof typeof SCENES }) {
  const { t } = useTranslation("auth")
  const Scene = SCENES[side]
  return (
    <Frame note={t(`art.${side}.note`)} tagline={t(`art.${side}.tagline`)}>
      <Scene />
    </Frame>
  )
}

function RegisterPanel({ audience }: { audience: Audience }) {
  const { scene, ...caption } = useRegisterScene(audience)
  return <Frame {...caption}>{scene}</Frame>
}

function ResetPanel() {
  const { scene, ...caption } = useResetScene()
  return <Frame {...caption}>{scene}</Frame>
}

function Frame({
  note,
  tagline,
  children,
}: {
  note: string
  tagline: string
  children: ReactNode
}) {
  return (
    <figure className="short:gap-8 short:p-10 relative flex flex-1 flex-col justify-center gap-12 p-12 xl:p-16">
      <div aria-hidden="true" className="mx-auto w-full max-w-lg 2xl:max-w-xl">
        {children}
      </div>
      <figcaption className="settle mx-auto flex w-full max-w-lg flex-col gap-2 delay-300 2xl:max-w-xl">
        <span className="text-sm font-medium text-brand-text first-letter:uppercase">
          {note}
        </span>
        <span className="text-2xl/tight font-semibold tracking-tight text-balance xl:text-[1.75rem]/tight">
          {tagline}
        </span>
      </figcaption>
    </figure>
  )
}

function Backdrop() {
  const id = `dots${useId().replace(/\W/g, "")}`
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 size-full mask-[radial-gradient(ellipse_at_center,black_20%,transparent_70%)] text-foreground/10"
    >
      <defs>
        <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
