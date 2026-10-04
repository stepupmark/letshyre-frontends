import { useSession } from "@workspace/auth/react"
import { useTranslation } from "@workspace/i18n/react"
import { useState } from "react"

import { PageHeader } from "@/components/page-header"
import { OnboardingForm, Submitted } from "@/features/employer-onboarding"

export default function EmployerOnboarding() {
  const { t } = useTranslation(["onboarding", "common"])
  const session = useSession()
  const [submitted, setSubmitted] = useState(false)
  const email =
    session.status === "signed-in" && typeof session.user.email === "string"
      ? session.user.email
      : ""

  return (
    <>
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      {submitted ? (
        <Submitted email={email} />
      ) : (
        <div className="flex flex-col gap-8">
          <PageHeader title={t("title")} description={t("lead")} />
          <OnboardingForm
            email={email}
            onSubmitted={() => {
              setSubmitted(true)
            }}
          />
        </div>
      )}
    </>
  )
}
