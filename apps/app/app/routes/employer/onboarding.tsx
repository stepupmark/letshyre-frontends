import { useSession } from "@workspace/auth/react"
import { useTranslation } from "@workspace/i18n/react"
import { useEffect, useRef, useState } from "react"

import { OnboardingForm, Submitted } from "@/features/employer-onboarding"

export default function EmployerOnboarding() {
  const { t } = useTranslation(["onboarding", "common"])
  const session = useSession()
  const [submitted, setSubmitted] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const email =
    session.status === "signed-in" && typeof session.user.email === "string"
      ? session.user.email
      : ""

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [])

  return (
    <>
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      {submitted ? (
        <Submitted email={email} />
      ) : (
        <div className="flex flex-col gap-10">
          <header className="flex max-w-2xl flex-col gap-3">
            <p className="text-sm font-medium text-brand-text">
              {t("eyebrow")}
            </p>
            <h1
              tabIndex={-1}
              ref={heading}
              className="text-3xl font-semibold tracking-tight text-balance outline-none sm:text-4xl"
            >
              {t("title")}
            </h1>
            <p className="text-base text-pretty text-muted-foreground">
              {t("lead")}
            </p>
          </header>
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
