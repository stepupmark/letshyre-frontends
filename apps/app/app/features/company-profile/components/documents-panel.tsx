import { safeUrl } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import { FileText } from "lucide-react"

import type { Company } from "../schemas/company-profile.schema"
import { Outbound, Panel } from "./parts"

const DOCUMENTS = [
  "registration_certificate",
  "gst_certificate",
  "address_proof",
  "bank_proof",
] as const

export function DocumentsPanel({ company }: { company: Company }) {
  const { t } = useTranslation("company")
  const kyc = company.kyc ?? {}
  const documents = DOCUMENTS.flatMap((key) => {
    const link = safeUrl(kyc[key])
    return link ? [{ key, link }] : []
  })

  return (
    <Panel title={t("documents.title")}>
      {documents.length ? (
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {documents.map(({ key, link }) => (
            <li key={key} className="flex min-w-0 items-center gap-2">
              <FileText
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
              <Outbound href={link}>{t(`documents.${key}`)}</Outbound>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{t("documents.none")}</p>
      )}
    </Panel>
  )
}
