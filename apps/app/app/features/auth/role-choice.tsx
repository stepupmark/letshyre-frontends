import { useTranslation } from "@workspace/i18n/react"
import { ArrowRight, BriefcaseBusiness, UserRound } from "lucide-react"
import { Link } from "react-router"

const ROLES = [
  { key: "employer", to: "/employer/register", icon: BriefcaseBusiness },
  { key: "candidate", to: "/employee/register", icon: UserRound },
] as const

/** Two doors: hiring or job seeking. */
export function RoleChoice() {
  const { t } = useTranslation("auth")
  return (
    <ul className="flex flex-col gap-3">
      {ROLES.map(({ key, to, icon: Icon }) => (
        <li key={key}>
          <Link
            to={to}
            viewTransition
            className="group flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:p-5"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-medium">
                {t(`getStarted.${key}.title`)}
              </span>
              <span className="text-sm text-muted-foreground">
                {t(`getStarted.${key}.body`)}
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
