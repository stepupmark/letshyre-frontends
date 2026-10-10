import serif from "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2?url"
import serifItalic from "@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2?url"
import script from "@fontsource/ms-madi/files/ms-madi-latin-400-normal.woff2?url"
import { Logo } from "@workspace/blocks/logo"
import { SkipLink } from "@workspace/blocks/skip-link"
import { useTranslation } from "@workspace/i18n/react"
import { ArrowRight } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router"

import {
  audienceFromPath,
  AuthBand,
  AuthPanel,
  signInPath,
} from "@/features/auth"
import { guestOnly } from "@/lib/guard"
import { namespaces } from "@/lib/i18n"

import type { Route } from "./+types/auth-layout"

export const clientMiddleware = [guestOnly, namespaces(["auth", "shell"])]

export const links: Route.LinksFunction = () =>
  [serif, serifItalic, script].map((href) => ({
    rel: "preload",
    href,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  }))

/** Form on one side, what this side of LetsHyre gets on the other. */
export default function AuthLayout() {
  const { t } = useTranslation(["shell", "common", "auth"])
  const { pathname, search } = useLocation()
  const audience = audienceFromPath(pathname)
  const other = audience === "employer" ? "candidate" : "employer"
  const onSignIn = audience !== null && pathname === signInPath(audience)

  return (
    <div className="min-[2560px]:grid min-[2560px]:min-h-svh min-[2560px]:place-items-center min-[2560px]:bg-muted/50 min-[2560px]:p-12">
      <SkipLink>{t("shell:skipToContent")}</SkipLink>
      <div className="auth-canvas grid min-[1440px]:grid-cols-[minmax(0,4fr)_minmax(0,5fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] min-[1440px]:px-16 sm:bg-muted/40 sm:p-8 lg:bg-transparent lg:px-12">
          <header className="flex items-center justify-between gap-4">
            <a href="/" className="inline-block rounded-sm">
              <Logo label={t("common:appName")} />
            </a>
            {onSignIn && (
              <Link
                to={signInPath(other) + search}
                viewTransition
                className="group inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {t(`auth:switch.${other}`)}
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            )}
          </header>
          <main
            id="main"
            tabIndex={-1}
            className="short:py-6 mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8 outline-none min-[1440px]:max-w-104 sm:py-12 lg:max-w-sm"
          >
            <div className="flex flex-col gap-8 sm:rounded-3xl sm:border sm:bg-card sm:p-8 sm:shadow-xl lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              <AuthBand pathname={pathname} />
              <Outlet />
            </div>
          </main>
        </div>
        <aside className="short:py-8 hidden items-center justify-center bg-muted/40 p-10 min-[1440px]:p-20 lg:flex xl:p-16">
          <AuthPanel pathname={pathname} />
        </aside>
      </div>
    </div>
  )
}
