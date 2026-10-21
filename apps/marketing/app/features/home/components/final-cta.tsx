import { useTranslation } from "@workspace/i18n/react"

import { ClosingBand } from "@/components/closing-band"

import { AudienceCtas } from "./audience-ctas"

export function FinalCta() {
  const { t } = useTranslation("home")

  return (
    <ClosingBand
      title={t("final.title")}
      accent={t("final.accent")}
      description={t("final.description")}
      flushTop
    >
      <AudienceCtas className="justify-center" />
    </ClosingBand>
  )
}
