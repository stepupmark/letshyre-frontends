import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/**
 * Wizard progress indicator: a segmented "Step X of N" bar on tablet/desktop, a
 * compact circular ring on mobile. `current` is 1-based; `total` excludes the
 * terminal/success step.
 */
export function AuthProgress({ current, total }) {
  const { t } = useTranslation("auth");
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - current / total);

  return (
    <div
      className="flex items-center"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={t("progress.step", { current, total })}
    >
      {/* Segmented bar — tablet + desktop */}
      <div className="flex items-center gap-3 max-sm:hidden">
        <div className="flex gap-1.25" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 w-4.5 rounded-full transition-colors",
                i < current ? "bg-brand-600" : "bg-border",
              )}
            />
          ))}
        </div>
        <span className="flex-none text-sm font-semibold whitespace-nowrap text-neutral-500">
          {t("progress.step", { current, total })}
        </span>
      </div>

      {/* Circular ring — mobile only (the bar felt cramped below sm) */}
      <div className="relative hidden size-11 max-sm:block" aria-hidden="true">
        <svg viewBox="0 0 44 44" className="block h-full w-full">
          <circle
            className="fill-none stroke-border stroke-[4]"
            cx="22"
            cy="22"
            r={radius}
          />
          <circle
            className="fill-none stroke-brand-600 stroke-[4] transition-[stroke-dashoffset] duration-350 [stroke-linecap:round]"
            cx="22"
            cy="22"
            r={radius}
            transform="rotate(-90 22 22)"
            style={{ strokeDasharray: circumference, strokeDashoffset: dashoffset }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text-main">
          {current}
          <span className="font-semibold text-neutral-400">/{total}</span>
        </span>
      </div>
    </div>
  );
}
