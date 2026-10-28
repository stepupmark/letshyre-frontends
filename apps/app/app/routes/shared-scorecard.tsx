import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { ShieldCheck } from "lucide-react"

import { useDelayed } from "@/hooks/use-delayed"
import {
  isShareId,
  LinkUnavailable,
  ReportSkeleton,
  ScorecardView,
  SharedByFooter,
  sharedScorecardQuery,
  shareProblem,
} from "@/features/candidate"
import { namespaces } from "@/lib/i18n"

import type { Route } from "./+types/shared-scorecard"

export const clientMiddleware = [namespaces(["scorecard"])]

export default function SharedScorecard({ params }: Route.ComponentProps) {
  const { t } = useTranslation(["scorecard", "common"])
  const valid = isShareId(params.shareId)
  const query = useQuery(sharedScorecardQuery(params.shareId))
  const skeleton = useDelayed(valid && query.isPending)
  const report = query.data

  return (
    <>
      <title>{`${report?.candidate_name ? `${report.candidate_name} · ` : ""}${t("title")} · ${t("common:appName")}`}</title>
      {/* the link is the only key to a named person's results: never pass it on */}
      <meta name="referrer" content="no-referrer" />

      {!valid ? (
        <LinkUnavailable problem="invalid" />
      ) : report ? (
        <div className="flex flex-col gap-6">
          <p className="flex items-start gap-2 text-sm text-pretty text-muted-foreground">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-brand-text"
              aria-hidden="true"
            />
            {report.shared_by_company_name
              ? t("provenance.sharedBy", {
                  company: report.shared_by_company_name,
                })
              : t("provenance.private")}
          </p>
          <ScorecardView
            report={report}
            footer={<SharedByFooter company={report.shared_by_company_name} />}
          />
        </div>
      ) : query.isError ? (
        <LinkUnavailable
          problem={shareProblem(query.error)}
          onRetry={() => void query.refetch()}
          retrying={query.isRefetching}
        />
      ) : (
        skeleton && <ReportSkeleton />
      )}
    </>
  )
}
