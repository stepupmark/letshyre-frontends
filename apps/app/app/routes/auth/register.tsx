import { useTranslation } from "@workspace/i18n/react"
import { useLocation } from "react-router"

import { audienceFromPath, RegisterFlow } from "@/features/auth"
import { useGo } from "@/lib/navigation"

export default function Register() {
  const { t } = useTranslation(["auth", "common"])
  const employer = audienceFromPath(useLocation().pathname) === "employer"
  const go = useGo()

  return (
    <>
      <title>{`${t(employer ? "register.employerTitle" : "register.candidateTitle")} · ${t("common:appName")}`}</title>
      <RegisterFlow
        key={employer ? "employer" : "candidate"}
        role={employer ? "Employer" : "Candidate"}
        onDone={(to) => {
          go(to, { replace: true })
        }}
      />
    </>
  )
}
