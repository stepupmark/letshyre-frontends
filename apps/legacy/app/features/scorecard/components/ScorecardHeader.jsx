import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormatters } from "@/i18n/format";

/**
 * Top of the scorecard: a "Go Back" control, the page title, and a details
 * strip (candidate name / role / interview date). Title/subtitle default to
 * the employer (viewing-a-candidate) copy but can be overridden — e.g. the
 * candidate's own view passes first-person wording.
 */
export function ScorecardHeader({
  name,
  role,
  date,
  title,
  subtitle,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation("scorecard");
  const { formatDate } = useFormatters();
  const na = t("header.na");

  const cols = [
    { key: "name", label: t("header.name"), value: name || na },
    { key: "role", label: t("header.role"), value: role || na, capitalize: true },
    {
      key: "date",
      label: t("header.date"),
      value: formatDate(date, { month: "short", day: "2-digit", year: "numeric" }) ?? na,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant="outline"
        className="h-auto self-start gap-1.5 rounded-full border-border-soft bg-card px-3.5 py-2 text-sm font-semibold text-text-body transition-all hover:-translate-x-0.5 hover:bg-brand-100 hover:text-brand-700 motion-reduce:hover:translate-x-0"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" className="rtl:-scale-x-100" />
        {t("header.goBack")}
      </Button>

      {/* `.sv-title-block` had no rule in the stylesheet; the wrapper stays as
          a plain grouping element for the title and subtitle. */}
      <div>
        <h1 className="m-0 text-2xl font-bold text-text-main">{title ?? t("header.title")}</h1>
        <p className="mt-1 mb-0 max-w-[60ch] text-sm text-text-muted">{subtitle ?? t("header.subtitle")}</p>
      </div>

      <div className="flex gap-4 rounded-lg border border-border-soft bg-card px-6 py-4 shadow-sm max-sm:flex-col max-sm:px-5">
        {cols.map((c, i) => (
          <div key={c.key} className="relative flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-semibold tracking-[0.06em] uppercase text-brand-600">{c.label}</span>
            <span className={cn("text-base font-bold break-words text-text-main", c.capitalize && "capitalize")}>
              {c.value}
            </span>
            {i < cols.length - 1 && (
              <span className="absolute top-1/2 -end-2 h-10 w-px -translate-y-1/2 bg-border max-sm:hidden" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScorecardHeader;
