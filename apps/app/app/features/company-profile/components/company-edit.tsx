import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { href, useSearchParams } from "react-router"

import { BackLink } from "@/components/back-link"
import { LoadError } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"

import { companyQuery } from "../queries/company-profile.queries"
import { CompanyForm } from "./company-form"
import { FormSkeleton } from "./profile-skeleton"

const FOCUS = "focus"

export function CompanyEdit() {
  const { t } = useTranslation("company")
  const [search] = useSearchParams()
  const query = useQuery(companyQuery())
  const skeleton = useDelayed(query.isPending)

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <BackLink to={href("/employer/company")}>{t("back")}</BackLink>
        <div className="flex flex-col gap-1">
          <h1
            tabIndex={-1}
            className="text-2xl font-semibold tracking-tight text-balance text-brand-text outline-none"
          >
            {t("edit.title")}
          </h1>
          <p className="text-sm text-pretty text-muted-foreground">
            {t("edit.lead")}
          </p>
        </div>
      </div>
      {query.data ? (
        <CompanyForm company={query.data} focus={search.get(FOCUS)} />
      ) : query.isError ? (
        <LoadError
          title={t("loadFailed")}
          onRetry={() => void query.refetch()}
          retrying={query.isRefetching}
        />
      ) : (
        skeleton && <FormSkeleton />
      )}
    </div>
  )
}
