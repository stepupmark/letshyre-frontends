import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { Navigate, useNavigate } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import {
  CandidateOnboarding,
  myProfileQuery,
} from "@/features/candidate-onboarding"

const HOME = "/employee"

export default function CandidateOnboardingPage() {
  const { t } = useTranslation(["candidateOnboarding", "common"])
  const navigate = useNavigate()
  const me = useQuery(myProfileQuery())

  if (me.data?.is_profile_complete) return <Navigate to={HOME} replace />

  return (
    <div className="flex flex-col gap-8">
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      <PageHeader title={t("title")} description={t("lead")} />
      <CandidateOnboarding
        onDone={() => {
          toast.success(t("done"))
          void navigate(HOME, { replace: true })
        }}
      />
    </div>
  )
}
