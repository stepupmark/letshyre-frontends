import { useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { RoleChoice } from "@/features/auth"

export default function GetStarted() {
  const { t } = useTranslation(["auth", "common"])

  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("getStarted.title")} · ${t("common:appName")}`}</title>
      <div className="flex flex-col gap-1.5">
        <h1
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight outline-none"
        >
          {t("getStarted.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("getStarted.lead")}</p>
      </div>
      <RoleChoice />
      <p className="text-sm text-muted-foreground">
        {t("register.haveAccount")}{" "}
        <Link
          to="/sign-in"
          viewTransition
          className="font-medium text-foreground underline underline-offset-4"
        >
          {t("register.signIn")}
        </Link>
      </p>
    </div>
  )
}
