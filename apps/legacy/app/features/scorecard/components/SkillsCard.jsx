import { useTranslation } from "react-i18next";

/**
 * Candidate skills as compact chips. On desktop the card is height-matched to
 * the left column (profile + metrics) via an absolute fill, and the chip list
 * scrolls internally when the skills overflow that height.
 */
export function SkillsCard({ skills }) {
  const { t } = useTranslation("scorecard");
  return (
    <div className="min-h-0 lg:relative">
      <div className="flex min-h-0 flex-col rounded-lg border border-border-soft bg-card p-5 shadow-sm lg:absolute lg:inset-0">
        <h3 className="mt-0 mb-4 shrink-0 text-base font-bold text-text-main">{t("skills.heading")}</h3>
        {skills.length === 0 ? (
          <p className="m-0 text-sm text-text-muted">{t("skills.empty")}</p>
        ) : (
          <div className="scrollbar-thin flex min-h-0 flex-1 flex-wrap content-start gap-2 overflow-y-auto">
            {skills.map((skill, i) => (
              <span key={i} className="inline-flex items-center rounded-full border border-border-soft bg-brand-100 px-3 py-1.5 text-xs font-medium text-brand-700">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillsCard;
