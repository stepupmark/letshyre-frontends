import { useTranslation } from "@workspace/i18n/react"
import { useNavigate } from "react-router"

import { ForgotFlow } from "@/features/auth"

export default function ForgotPassword() {
  const { t } = useTranslation(["auth", "common"])
  const navigate = useNavigate()
  const done = (email: string) => {
    void navigate("/sign-in", {
      replace: true,
      viewTransition: true,
      state: { email, notice: "passwordChanged" },
    })
  }

  return (
    <>
      <title>{`${t("forgot.title")} · ${t("common:appName")}`}</title>
      <ForgotFlow onDone={done} />
    </>
  )
}
