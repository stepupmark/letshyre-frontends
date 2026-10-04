import { Logo } from "@workspace/blocks/logo"
import { SkipLink } from "@workspace/blocks/skip-link"
import { useTranslation } from "@workspace/i18n/react"
import { Outlet, useLocation } from "react-router"

import { ProofPanel, type Proof } from "@/features/auth"
import { guestOnly } from "@/lib/guard"
import { namespaces } from "@/lib/i18n"

export const clientMiddleware = [guestOnly, namespaces(["auth", "shell"])]

const proofFor = (pathname: string): Proof =>
  pathname.startsWith("/employer/")
    ? "employer"
    : pathname.startsWith("/employee/")
      ? "candidate"
      : "general"

/** Form on the left, what LetsHyre does on the right (from lg up). */
export default function AuthLayout() {
  const { t } = useTranslation(["shell", "common"])
  const proof = proofFor(useLocation().pathname)

  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <SkipLink>{t("shell:skipToContent")}</SkipLink>
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <header>
          <a href="/" className="inline-block rounded-sm">
            <Logo label={t("common:appName")} />
          </a>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10 outline-none"
        >
          <Outlet />
        </main>
      </div>
      <aside className="hidden border-s bg-muted/40 lg:block">
        <ProofPanel proof={proof} />
      </aside>
    </div>
  )
}
