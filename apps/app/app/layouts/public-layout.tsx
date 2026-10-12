import { Logo } from "@workspace/blocks/logo"
import { SkipLink } from "@workspace/blocks/skip-link"
import { useTranslation } from "@workspace/i18n/react"
import { Outlet } from "react-router"

import { LanguagePicker } from "@/components/language-picker"
import { namespaces } from "@/lib/i18n"

export const clientMiddleware = [namespaces(["shell"])]

/** Pages anyone with the link can open: no sidebar, no session. */
export default function PublicLayout() {
  const { t } = useTranslation(["shell", "common"])

  return (
    <div className="flex min-h-svh flex-col">
      <SkipLink>{t("shell:skipToContent")}</SkipLink>
      <header className="border-b print:hidden">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* the marketing site, so a full page load */}
          <a href="/" className="rounded-sm">
            <Logo label={t("common:appName")} />
          </a>
          <LanguagePicker />
        </div>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none sm:px-6 sm:py-12"
      >
        <Outlet />
      </main>
    </div>
  )
}
