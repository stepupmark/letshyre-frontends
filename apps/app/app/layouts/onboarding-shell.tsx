import { logout, PUBLIC_HOME } from "@workspace/auth"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Outlet } from "react-router"

import { BareHeader } from "@/components/bare-header"
import { SessionGate } from "@/features/auth"
import { api } from "@/lib/api"

export function OnboardingShell() {
  const { t } = useTranslation("shell")

  return (
    <SessionGate>
      <div className="flex min-h-svh flex-col">
        <BareHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void logout(api).then(() => {
                window.location.assign(PUBLIC_HOME)
              })
            }}
          >
            {t("user.signOut")}
          </Button>
        </BareHeader>
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl flex-1 px-(--gutter) py-8 outline-none [--gutter:--spacing(4)] sm:py-12 sm:[--gutter:--spacing(6)]"
        >
          <Outlet />
        </main>
      </div>
    </SessionGate>
  )
}
