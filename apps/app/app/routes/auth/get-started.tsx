import { useTranslation } from "@workspace/i18n/react"
import { href, Link } from "react-router"

import { AuthHeading, RoleChoice } from "@/features/auth"

export default function GetStarted() {
  const { t } = useTranslation(["auth", "common"])

  return (
    <div className="flex flex-col gap-8">
      <title>{`${t("getStarted.title")} · ${t("common:appName")}`}</title>
      <AuthHeading title={t("getStarted.title")} lead={t("getStarted.lead")} />
      <RoleChoice intent="register" />
      <p className="text-sm text-muted-foreground">
        {t("register.haveAccount")}{" "}
        <Link
          to={href("/sign-in")}
          viewTransition
          className="font-medium text-foreground underline underline-offset-4"
        >
          {t("register.signIn")}
        </Link>
      </p>
    </div>
  )
}
