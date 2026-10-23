import { useTranslation } from "@workspace/i18n/react"
import { BadgeCheck, CircleAlert, Clock, FileText } from "lucide-react"

import { safeUrl } from "@/lib/safe-url"

import { verificationOf, type Verification } from "../lib/company"
import type { Company } from "../schemas/company-profile.schema"
import { MaskedId } from "./masked-id"
import { Fact, Outbound, Panel } from "./parts"

const ICON = { verified: BadgeCheck, pending: Clock, rejected: CircleAlert }

const DOCUMENTS = [
  "registration_certificate",
  "gst_certificate",
  "address_proof",
  "bank_proof",
] as const

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
  const documents = DOCUMENTS.flatMap((key) => {
    const link = safeUrl(kyc[key])
    return link ? [{ key, link }] : []
  })

  return (
    <Panel title={t("legal.title")} note={t("legal.note")}>
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

      <div className="flex flex-col gap-2 border-t pt-4">
        <h3 className="text-xs text-muted-foreground">
          {t("documents.title")}
        </h3>
        {documents.length ? (
          <ul className="flex flex-col gap-1">
            {documents.map(({ key, link }) => (
              <li key={key} className="flex items-center gap-2">
                <FileText
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <Outbound href={link}>{t(`documents.${key}`)}</Outbound>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">{t("documents.none")}</p>
        )}
      </div>
    </Panel>
  )
}
