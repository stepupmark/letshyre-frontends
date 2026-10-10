import { useTranslation } from "@workspace/i18n/react"
import { Link, useLocation, useSearchParams } from "react-router"

import {
  ArrivalNotice,
  audienceFromPath,
  AuthHeading,
  REGISTER_PATH,
  rememberAudience,
  SignInForm,
  useArrival,
} from "@/features/auth"
import { useGo } from "@/lib/navigation"

export default function RoleSignIn() {
  const { t } = useTranslation(["auth", "common"])
  const audience = audienceFromPath(useLocation().pathname) ?? "candidate"
  const arrival = useArrival()
  const next = useSearchParams()[0].get("next")
  const go = useGo()

  return (
    <div className="flex flex-col gap-8">
      <title>{`${t(`signIn.${audience}.pageTitle`)} · ${t("common:appName")}`}</title>
      <AuthHeading
        title={t(`signIn.${audience}.title`)}
        accent={t(`signIn.${audience}.accent`)}
        lead={t(`signIn.${audience}.lead`)}
      />
      <ArrivalNotice />
      <SignInForm
        key={audience}
        audience={audience}
        email={arrival.email}
        next={next}
        onSignedIn={(to) => {
          rememberAudience(audience)
          go(to, { replace: true })
        }}
      />
      <p className="text-sm text-muted-foreground">
        {t("signIn.noAccount")}{" "}
        <Link
          to={REGISTER_PATH[audience]}
          viewTransition
          className="font-medium text-foreground underline underline-offset-4"
        >
          {t("signIn.create")}
        </Link>
      </p>
    </div>
  )
}
