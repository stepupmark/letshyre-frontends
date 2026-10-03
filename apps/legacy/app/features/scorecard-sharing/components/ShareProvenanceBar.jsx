import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";

/**
 * Trust strip above the report: who shared it. Sets expectations before the
 * reader sees a single score — this is a confidential document, not a
 * public page.
 */
export function ShareProvenanceBar({ companyName }) {
  const { t } = useTranslation("sharedScorecard");

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border-soft bg-bg-subtle px-4 py-3 text-xs font-medium text-text-muted sm:text-sm">
      <span className="inline-flex items-center gap-1.5">
        <ShieldCheck size={15} strokeWidth={2.2} className="shrink-0 text-brand-600" aria-hidden="true" />
        {companyName
          ? t("provenance.sharedBy", { company: companyName })
          : t("provenance.confidential")}
      </span>
    </div>
  );
}

export default ShareProvenanceBar;
