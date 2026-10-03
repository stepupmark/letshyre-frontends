import { useTranslation } from "react-i18next";
import { CalendarDays } from "lucide-react";

export function ExperienceList({ items }) {
  const { t } = useTranslation("sharedScorecard");
  if (!items?.length) {
    return <p className="m-0 text-sm text-text-muted">{t("profile.empty.experience")}</p>;
  }
  return (
    <div className="ms-1.25 flex flex-col gap-6 border-s-2 border-border-soft ps-6">
      {items.map((exp, i) => (
        <div
          key={i}
          className="relative before:absolute before:top-1.5 before:-start-7.5 before:size-2.75 before:rounded-full before:bg-brand-500 before:shadow-[0_0_0_4px_var(--color-brand-100)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="m-0 text-base font-bold text-text-main">{exp.role || "—"}</h3>
            {exp.duration && (
              <span className="inline-flex w-fit shrink-0 items-center gap-1.25 rounded-full bg-brand-100 px-2.5 py-0.75 text-xs font-semibold text-brand-700">
                <CalendarDays size={13} strokeWidth={2} aria-hidden="true" />
                {exp.duration}
              </span>
            )}
          </div>
          {exp.company && <p className="mt-1 mb-0 text-sm font-medium text-brand-700">{exp.company}</p>}
          {exp.description && (
            <p className="mt-2 mb-0 max-w-prose text-sm leading-relaxed text-text-body">{exp.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default ExperienceList;
