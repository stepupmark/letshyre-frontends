import { useTranslation } from "@workspace/i18n/react"
import { ArrowRight, BriefcaseBusiness, UserRound } from "lucide-react"
import { Link } from "react-router"

import { REGISTER_PATH, signInPath, type Audience } from "../../lib/audience"

const SIDES = [
  { key: "employer", icon: BriefcaseBusiness },
  { key: "candidate", icon: UserRound },
] as const

/** Two doors: hiring or job seeking. Signing in leads with the side used last. */
export function RoleChoice({
  intent,
  last = null,
  search = "",
  state,
}: {
  intent: "register" | "signIn"
  last?: Audience | null
  search?: string
  state?: unknown
}) {
  const { t } = useTranslation("auth")
  const sides = last === "candidate" ? [...SIDES].reverse() : SIDES

  return (
    <ul className="flex flex-col gap-3">
      {sides.map(({ key, icon: Icon }) => (
        <li key={key}>
          <Link
            to={
              intent === "register"
                ? REGISTER_PATH[key]
                : signInPath(key) + search
            }
            state={state}
            viewTransition
            className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:p-5"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-text">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-x-2 font-medium">
                {t(
                  intent === "register"
                    ? `getStarted.${key}.title`
                    : `signIn.choose.${key}.title`
                )}
                {intent === "signIn" && key === last && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                    {t("signIn.lastUsed")}
                  </span>
                )}
              </span>
              <span className="text-sm text-muted-foreground">
                {t(
                  intent === "register"
                    ? `getStarted.${key}.body`
                    : `signIn.choose.${key}.body`
                )}
              </span>
            </span>
            <ArrowRight
              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
