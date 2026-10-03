import { useTranslation } from "react-i18next";
import { FileText, ExternalLink } from "lucide-react";
import { safeUrl } from "@/lib/safeUrl";

export function ResumeLink({ url }) {
  const { t } = useTranslation("sharedScorecard");
  const href = safeUrl(url);
  if (!href) {
    return <p className="m-0 text-sm text-text-muted">{t("profile.empty.resume")}</p>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="flex items-center gap-3 rounded-md border border-border-soft px-4 py-3 text-text-body transition-colors hover:border-brand-300 hover:bg-brand-100"
    >
      <FileText size={18} strokeWidth={2} className="shrink-0 text-brand-600" aria-hidden="true" />
      <span className="flex-1 text-sm font-medium">{t("profile.viewResume")}</span>
      <ExternalLink size={15} strokeWidth={2} className="shrink-0 text-text-faint" aria-hidden="true" />
    </a>
  );
}

export default ResumeLink;
