import { useTranslation } from "react-i18next";
import { Link2, ExternalLink } from "lucide-react";
import { safeUrl } from "@/lib/safeUrl";

export function PortfolioLinks({ links }) {
  const { t } = useTranslation("sharedScorecard");
  if (!links?.length) {
    return <p className="m-0 text-sm text-text-muted">{t("profile.empty.portfolio")}</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {links.map((link, i) => {
        const href = safeUrl(link);
        if (!href) return null;
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center gap-3 rounded-md border border-border-soft px-4 py-3 text-text-body transition-colors hover:border-brand-300 hover:bg-brand-100"
          >
            <Link2 size={18} strokeWidth={2} className="shrink-0 text-brand-600" aria-hidden="true" />
            <span className="flex-1 truncate text-sm font-medium">{href}</span>
            <ExternalLink size={15} strokeWidth={2} className="shrink-0 text-text-faint" aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}

export default PortfolioLinks;
