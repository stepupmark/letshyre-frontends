import { audienceFromPath, REGISTER_PATH } from "../../lib/audience"
import { AuthArt, AuthStrip } from "./auth-art"
import { RegisterBand, RegisterCard, ResetBand, ResetCard } from "./flow-cards"

function sceneFor(pathname: string) {
  const audience = audienceFromPath(pathname)
  if (pathname === "/forgot-password") return { kind: "reset" } as const
  if (audience && pathname === REGISTER_PATH[audience])
    return { kind: "register", audience } as const
  return { kind: "art", side: audience ?? "general" } as const
}

/** The side panel from lg up: a live card while a flow runs, art otherwise. */
export function AuthPanel({ pathname }: { pathname: string }) {
  const scene = sceneFor(pathname)
  if (scene.kind === "reset") return <ResetCard />
  if (scene.kind === "register")
    return <RegisterCard key={scene.audience} audience={scene.audience} />
  return <AuthArt key={scene.side} side={scene.side} />
}

/** The same, as a slim band above the form below lg. */
export function AuthBand({ pathname }: { pathname: string }) {
  const scene = sceneFor(pathname)
  if (scene.kind === "reset") return <ResetBand />
  if (scene.kind === "register")
    return <RegisterBand audience={scene.audience} />
  return <AuthStrip side={scene.side} />
}
