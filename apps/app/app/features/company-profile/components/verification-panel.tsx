import { useTranslation } from "@workspace/i18n/react"
import { BadgeCheck, CircleAlert, Clock } from "lucide-react"

import { verificationOf, type Verification } from "../lib/company"
import type { Company } from "../schemas/company-profile.schema"
import { MaskedId } from "./masked-id"
import { Fact, Panel } from "./parts"

const ICON = { verified: BadgeCheck, pending: Clock, rejected: CircleAlert }

export function VerificationPanel({ company }: { company: Company }) {
  const { t } = useTranslation("company")
  const kyc = company.kyc ?? {}
  const state: Verification = verificationOf(kyc.kyc_status) ?? "pending"
  const Icon = ICON[state]
  const ids = [
    [t("legal.registration"), kyc.company_registration_number],
    [t("legal.gst"), kyc.gst_number],
    [t("legal.pan"), kyc.pan_number],
  ] as const
  return (
    <Panel
      title={t("legal.title")}
      note={t("legal.note")}
      className="lg:sticky lg:top-20"
    >
      <p
        data-state={state}
        className="flex items-start gap-2.5 rounded-lg bg-muted px-3 py-2.5 data-[state=rejected]:bg-destructive/10 data-[state=verified]:bg-success/10"
      >
        <Icon
          aria-hidden="true"
          data-state={state}
          className="pop mt-0.5 size-4 shrink-0 text-warning data-[state=rejected]:text-destructive data-[state=verified]:text-success"
        />
        <span className="flex flex-col gap-0.5">
          <span className="font-medium">{t(`kyc.${state}`)}</span>
          <span className="text-xs text-pretty">
            {t(`verification.${state}`)}
          </span>
        </span>
      </p>

      <dl className="flex flex-col gap-4">
        {ids.map(([label, value]) => (
          <Fact key={label} label={label}>
            {value ? (
              <MaskedId label={label} value={value} />
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </Fact>
        ))}
      </dl>
    </Panel>
  )
}
