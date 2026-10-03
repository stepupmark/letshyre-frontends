import { useTranslation } from "react-i18next";
import { GraduationCap, CalendarDays } from "lucide-react";

export function EducationList({ items }) {
  const { t } = useTranslation("sharedScorecard");
  if (!items?.length) {
    return <p className="m-0 text-sm text-text-muted">{t("profile.empty.education")}</p>;
  }
  return (
    <div className="flex flex-col gap-5">
      {items.map((edu, i) => (
        <div key={i} className="flex items-start gap-4">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-600"
            aria-hidden="true"
          >
            <GraduationCap size={20} strokeWidth={2} />
          </span>
          <div className="flex min-w-0 flex-col">
            <h3 className="m-0 text-base font-bold text-text-main">{edu.institution || "—"}</h3>
            {edu.degree && <p className="mt-1 mb-0 text-sm font-medium text-brand-700">{edu.degree}</p>}
            {edu.duration && (
              <span className="mt-2 inline-flex w-fit items-center gap-1.25 rounded-full bg-brand-100 px-2.5 py-0.75 text-xs font-semibold text-brand-700">
                <CalendarDays size={13} strokeWidth={2} aria-hidden="true" />
                {edu.duration}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EducationList;
