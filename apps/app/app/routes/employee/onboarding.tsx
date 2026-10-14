import { useSession } from "@workspace/auth/react"
import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { href, Navigate } from "react-router"

import {
  CandidateOnboarding,
  myProfileQuery,
  Submitted,
} from "@/features/candidate-onboarding"

const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : ""

export default function CandidateOnboardingPage() {
  const { t } = useTranslation(["candidateOnboarding", "common"])
  const session = useSession()
  const me = useQuery(myProfileQuery())
  const [role, setRole] = useState<string | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const user: Record<string, unknown> =
    session.status === "signed-in" ? session.user : {}
  const name =
    text(user.name) ||
    [text(user.first_name), text(user.last_name)].filter(Boolean).join(" ")

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [])

  if (role !== null)
    return (
      <>
        <title>{`${t("done.title")} · ${t("common:appName")}`}</title>
        <Submitted role={role} />
      </>
    )
  if (me.data?.is_profile_complete)
    return <Navigate to={href("/employee/jobs")} replace />

  return (
    <div className="flex flex-col gap-10">
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      <header className="flex max-w-2xl flex-col gap-3">
        <p className="text-sm font-medium text-brand-text">{t("eyebrow")}</p>
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
      <CandidateOnboarding name={name} onDone={setRole} />
    </div>
  )
}
