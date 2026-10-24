import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "@workspace/i18n/react"
import { CircleAlert, Pencil } from "lucide-react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { StatusBadge, type Tone } from "@/components/status-badge"
import { buttonLink } from "@/lib/button-link"
import { industriesQuery } from "@/lib/industries"
import { safeUrl } from "@/lib/safe-url"

import {
  hostOf,
  missingOf,
  verificationOf,
  type Verification,
} from "../lib/company"
import type { Company } from "../schemas/company-profile.schema"
import { CompanyLogo, Outbound } from "./parts"

const TONE: Record<Verification, Tone> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
}

export function CompanyHeader({ company }: { company: Company }) {
  const { t } = useTranslation("company")
  const industries = useQuery(industriesQuery())
  const kyc = company.kyc ?? {}
  const state = verificationOf(kyc.kyc_status)
  const website = safeUrl(kyc.company_website)
  const linkedin = safeUrl(kyc.linkedin_url)
  const industry =
    industries.data?.find((item) => item.value === kyc.company_industry)
      ?.label ?? kyc.company_industry
  const subtitle = [industry, kyc.company_address?.trim()]
    .filter(Boolean)
    .join(" · ")
  const missing = missingOf(kyc)
  const firstField = missing.find((field) => field !== "company_logo")
  const edit = href("/employer/company/edit")

  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
      <CompanyLogo src={safeUrl(kyc.company_logo)} className="pop" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight text-balance text-brand-text outline-none"
        >
          {kyc.company_name?.trim() ? kyc.company_name : t("unnamed")}
        </h1>
        {subtitle && (
          <p className="text-sm text-pretty text-muted-foreground">
            {subtitle}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {state && (
              <StatusBadge tone={TONE[state]}>{t(`kyc.${state}`)}</StatusBadge>
            )}
            <AppLink
              to={`${href("/employer/jobs")}?status=open`}
              className="rounded-sm text-muted-foreground tabular-nums underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {t("jobs", {
                open: company.open_jobs_posted,
                count: company.total_jobs_posted,
              })}
            </AppLink>
            {missing.length > 0 && (
              <AppLink
                to={firstField ? `${edit}?focus=${firstField}` : edit}
                className="inline-flex items-center gap-1 rounded-sm text-brand-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <CircleAlert aria-hidden="true" className="size-3.5" />
                {t("missing", { count: missing.length })}
              </AppLink>
            )}
          </div>
          {(website ?? linkedin) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:border-s sm:ps-4">
              {website && (
                <Outbound href={website} className="text-foreground">
                  {hostOf(website)}
                </Outbound>
              )}
              {linkedin && (
                <Outbound href={linkedin} className="text-foreground">
                  {t("details.linkedinShort")}
                </Outbound>
              )}
            </div>
          )}
        </div>
      </div>
      <AppLink to={edit} className={buttonLink({ variant: "outline" })}>
        <Pencil />
        {t("editCompany")}
      </AppLink>
    </header>
  )
}
