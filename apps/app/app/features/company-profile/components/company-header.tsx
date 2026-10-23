import { useTranslation } from "@workspace/i18n/react"
import { Pencil } from "lucide-react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { StatusBadge, type Tone } from "@/components/status-badge"
import { buttonLink } from "@/lib/button-link"
import { safeUrl } from "@/lib/safe-url"

import { hostOf, verificationOf, type Verification } from "../lib/company"
import type { Company } from "../schemas/company-profile.schema"
import { CompanyLogo, Outbound } from "./parts"

const TONE: Record<Verification, Tone> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
}

export function CompanyHeader({ company }: { company: Company }) {
  const { t } = useTranslation("company")
  const kyc = company.kyc ?? {}
  const state = verificationOf(kyc.kyc_status)
  const website = safeUrl(kyc.company_website)
  const linkedin = safeUrl(kyc.linkedin_url)

  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <CompanyLogo src={safeUrl(kyc.company_logo)} className="pop" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h1
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight text-balance text-brand-text outline-none"
        >
          {kyc.company_name?.trim() ? kyc.company_name : t("unnamed")}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          {state && (
            <StatusBadge tone={TONE[state]}>{t(`kyc.${state}`)}</StatusBadge>
          )}
          <span className="tabular-nums">
            {t("jobs", {
              open: company.open_jobs_posted,
              count: company.total_jobs_posted,
            })}
          </span>
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
      </div>
      <AppLink
        to={href("/employer/company/edit")}
        className={buttonLink({ variant: "outline" })}
      >
        <Pencil />
        {t("editCompany")}
      </AppLink>
    </header>
  )
}
