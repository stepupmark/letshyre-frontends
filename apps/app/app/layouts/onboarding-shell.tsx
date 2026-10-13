import { logout, PUBLIC_HOME } from "@workspace/auth"
import { Logo } from "@workspace/blocks/logo"
import { SkipLink } from "@workspace/blocks/skip-link"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Outlet } from "react-router"

import { LanguagePicker } from "@/components/language-picker"
import { SessionGate } from "@/features/auth"
import { api } from "@/lib/api"

/** Before the dashboard exists for them: just the task, and a way out. */
export function OnboardingShell({ wide = false }: { wide?: boolean }) {
  const { t } = useTranslation(["shell", "common"])

  return (
    <SessionGate>
      <div className="flex min-h-svh flex-col">
        <SkipLink>{t("shell:skipToContent")}</SkipLink>
        <header className="border-b">
          <div
            className={cn(
              "mx-auto flex h-14 items-center justify-between px-4 sm:px-6",
              wide ? "max-w-6xl" : "max-w-3xl"
            )}
          >
            <Logo label={t("common:appName")} />
            <div className="flex items-center gap-1">
              <LanguagePicker display="name" />
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
          </div>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className={cn(
            "mx-auto w-full flex-1 px-(--gutter) py-8 outline-none [--gutter:--spacing(4)] sm:py-12 sm:[--gutter:--spacing(6)]",
            wide ? "max-w-6xl" : "max-w-3xl"
          )}
        >
          <Outlet />
        </main>
      </div>
    </SessionGate>
  )
}
