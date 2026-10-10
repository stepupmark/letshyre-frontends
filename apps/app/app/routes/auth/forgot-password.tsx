import { useTranslation } from "@workspace/i18n/react"
import { useNavigate, useSearchParams } from "react-router"

import { ForgotFlow, lastAudience, signInPath } from "@/features/auth"

export default function ForgotPassword() {
  const { t } = useTranslation(["auth", "common"])
  const navigate = useNavigate()
  const as = useSearchParams()[0].get("as")
  const signIn = signInPath(
    as === "employer" || as === "candidate" ? as : lastAudience()
  )

  const done = (email: string) => {
    void navigate(signIn, {
      replace: true,
      viewTransition: true,
      state: { email, notice: "passwordChanged" },
    })
  }

  return (
    <>
      <title>{`${t("forgot.title")} · ${t("common:appName")}`}</title>
      <ForgotFlow signIn={signIn} onDone={done} />
    </>
  )
}
