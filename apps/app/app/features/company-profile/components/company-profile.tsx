import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"

import { LoadError, RefreshNote } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"

import { companyQuery } from "../queries/company-profile.queries"
import { AccountPanel } from "./account-panel"
import { AboutPanel, ContactPanel } from "./company-details"
import { CompanyHeader } from "./company-header"
import { ProfileSkeleton } from "./profile-skeleton"
import { VerificationPanel } from "./verification-panel"

export function CompanyProfile() {
  const { t } = useTranslation("company")
  const query = useQuery(companyQuery())
  const skeleton = useDelayed(query.isPending)

  if (!query.data) {
    if (query.isError)
      return (
        <LoadError
          title={t("loadFailed")}
          onRetry={() => void query.refetch()}
          retrying={query.isRefetching}
        />
      )
    return skeleton ? <ProfileSkeleton /> : null
  }

  const company = query.data
  return (
    <div className="flex flex-col gap-8">
      {query.isRefetchError && (
        <RefreshNote
          onRetry={() => void query.refetch()}
          retrying={query.isRefetching}
        />
      )}
      <CompanyHeader company={company} />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <AboutPanel company={company} />
          <ContactPanel company={company} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <VerificationPanel company={company} />
          <AccountPanel company={company} />
        </div>
      </div>
    </div>
  )
}
