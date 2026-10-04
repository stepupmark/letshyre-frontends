import { logout, PUBLIC_HOME } from "@workspace/auth"
import { Logo } from "@workspace/blocks/logo"
import { SkipLink } from "@workspace/blocks/skip-link"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Outlet } from "react-router"

import { SessionGate } from "@/features/auth"
import { api } from "@/lib/api"

/** Before the dashboard exists for them: just the task, and a way out. */
export function OnboardingShell() {
  const { t } = useTranslation(["shell", "common"])

  return (
    <SessionGate>
      <div className="flex min-h-svh flex-col">
        <SkipLink>{t("shell:skipToContent")}</SkipLink>
        <header className="border-b">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
            <Logo label={t("common:appName")} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void logout(api).then(() => {
                  window.location.assign(PUBLIC_HOME)
                })
              }}
            >
              {t("shell:user.signOut")}
            </Button>
          </div>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 outline-none sm:px-6 sm:py-12"
        >
          <Outlet />
        </main>
      </div>
    </SessionGate>
  )
}
