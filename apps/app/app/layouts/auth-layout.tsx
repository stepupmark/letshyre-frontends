import { Logo } from "@workspace/blocks/logo"
import { SkipLink } from "@workspace/blocks/skip-link"
import { useTranslation } from "@workspace/i18n/react"
import { ArrowRight } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router"

import { LanguagePicker } from "@/components/language-picker"
import { audienceFromPath, AuthPanel, signInPath } from "@/features/auth"
import { guestOnly } from "@/lib/guard"
import { namespaces } from "@/lib/i18n"

export const clientMiddleware = [guestOnly, namespaces(["auth", "shell"])]

/** The form on the right; from lg up, what this side of LetsHyre gets on the left. */
export default function AuthLayout() {
  const { t } = useTranslation(["shell", "common", "auth"])
  const { pathname, search } = useLocation()
  const audience = audienceFromPath(pathname)
  const other = audience === "employer" ? "candidate" : "employer"
  const onSignIn = audience !== null && pathname === signInPath(audience)

  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)]">
      <SkipLink>{t("shell:skipToContent")}</SkipLink>
      <div className="flex flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-6 xl:px-16">
        <header className="flex min-h-9 items-center justify-between gap-3 lg:justify-end">
          {/* sits on the illustration panel from lg up */}
          <a
            href="/"
            className="rounded-sm lg:fixed lg:inset-s-10 lg:top-9 lg:z-10"
          >
            <Logo label={t("common:appName")} />
          </a>
          <div className="flex items-center gap-1">
            {onSignIn && (
              <Link
                to={signInPath(other) + search}
                viewTransition
                className="group inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {t(`auth:switch.${other}`)}
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            )}
            <LanguagePicker display="name" />
          </div>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="short:py-6 mx-auto flex w-full max-w-100 flex-1 flex-col justify-center py-10 outline-none sm:py-16"
        >
          <Outlet />
        </main>
      </div>
      <aside className="sticky top-0 hidden h-svh p-3 lg:order-first lg:block">
        <AuthPanel pathname={pathname} />
      </aside>
    </div>
  )
}
