import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { CircleCheck } from "lucide-react"
import { Link, useLocation, useSearchParams } from "react-router"

import { SignInForm } from "@/features/auth"
import { useGo } from "@/lib/navigation"

interface Arrival {
  email?: string
  notice?: "passwordChanged" | "accountCreated"
}

export default function SignIn() {
  const { t } = useTranslation(["auth", "common"])
  const [params] = useSearchParams()
  const arrival = (useLocation().state ?? {}) as Arrival
  const go = useGo()
  const next = params.get("next")

  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("signIn.title")} · ${t("common:appName")}`}</title>
      <div className="flex flex-col gap-1.5">
        <h1
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight outline-none"
        >
          {t("signIn.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("signIn.lead")}</p>
      </div>
      {arrival.notice && (
        <Alert>
          <CircleCheck />
          <AlertDescription>{t(`signIn.${arrival.notice}`)}</AlertDescription>
        </Alert>
      )}
      <SignInForm
        email={arrival.email}
        next={next}
        onSignedIn={(to) => {
          go(to, { replace: true })
        }}
      />
      <p className="text-sm text-muted-foreground">
        {t("signIn.noAccount")}{" "}
        <Link
          to="/get-started"
          viewTransition
          className="font-medium text-foreground underline underline-offset-4"
        >
          {t("signIn.create")}
        </Link>
      </p>
    </div>
  )
}
