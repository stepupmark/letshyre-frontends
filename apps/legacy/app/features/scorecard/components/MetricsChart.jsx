import { useTranslation } from "react-i18next";

/**
 * Vertical bar chart for the audio communication metrics. Each bar owns its
 * own value and caption, so labels line up with their bars exactly (the old
 * design rendered bars and labels as two separate rows that only roughly
 * aligned).
 */
export function MetricsChart({ metrics }) {
  const { t } = useTranslation("scorecard");
  return (
    <div className="rounded-lg border border-border-soft bg-card px-6 py-5 shadow-sm">
      <h3 className="mt-0 mb-5 text-base font-bold text-text-main [&_span]:font-medium [&_span]:text-text-faint">
        {t("metrics.heading")} <span>{t("metrics.range")}</span>
      </h3>
      <div className="flex items-end gap-3 max-sm:gap-1">
        {metrics.map((item) => {
          const value = Math.round(item.value || 0);
          return (
            <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="text-sm font-bold text-brand-700">{value}%</span>
              <div className="flex h-45 w-full max-w-17 items-end overflow-hidden rounded-md bg-brand-100 max-sm:h-32.5">
                <div
                  className="w-full rounded-t-md bg-gradient-to-b from-brand-400 to-brand-600 transition-[height] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                  style={{ height: `${Math.max(0, Math.min(100, value))}%` }}
                />
              </div>
              <span className="text-center text-xs leading-[1.3] font-medium text-text-muted max-sm:text-[9px]">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MetricsChart;
