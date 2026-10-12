import { useTranslation } from "@workspace/i18n/react"
import { useState } from "react"
import { href, Link, useLocation } from "react-router"

import {
  ArrivalNotice,
  AuthHeading,
  lastAudience,
  RoleChoice,
} from "@/features/auth"

export default function SignIn() {
  const { t } = useTranslation(["auth", "common"])
  const location = useLocation()
  const [last] = useState(lastAudience)

  return (
    <div className="flex flex-col gap-8">
      <title>{`${t("signIn.title")} · ${t("common:appName")}`}</title>
      <AuthHeading title={t("signIn.title")} lead={t("signIn.chooseLead")} />
      <ArrivalNotice />
      <RoleChoice
        intent="signIn"
        last={last}
        search={location.search}
        state={location.state as unknown}
      />
      <p className="text-sm text-muted-foreground">
        {t("signIn.noAccount")}{" "}
        <Link
          to={href("/")}
          viewTransition
          className="font-medium text-foreground underline underline-offset-4"
        >
          {t("signIn.create")}
        </Link>
      </p>
    </div>
  )
}
