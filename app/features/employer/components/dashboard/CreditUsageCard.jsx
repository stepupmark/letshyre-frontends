import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { localePath } from "@/i18n/config";
import { useAppLocale } from "@/i18n/appLocale";
import { cn } from "@/lib/utils";

const CARD =
  "rounded-lg border border-border-soft bg-white p-6 shadow-[0_2px_10px_rgb(0_0_0_/_0.02)] sm:p-8 3xl:p-10";
const LAYOUT = "grid items-center gap-8 md:grid-cols-[auto_1fr] md:gap-12 3xl:gap-16";
const RING = "relative size-64 shrink-0 max-md:mx-auto 3xl:size-80 4xl:size-96";
const DETAILS =
  "flex flex-col gap-8 max-md:items-center max-md:text-center md:border-s md:border-border-soft md:ps-12 3xl:ps-16";
const BUTTON =
  "h-12 min-w-52 justify-between gap-6 rounded-md px-5 text-base font-semibold transition-all active:scale-97 max-sm:w-full motion-reduce:active:scale-100 3xl:h-14 3xl:min-w-60 3xl:text-lg";

const CreditUsageSkeleton = () => (
  <div className={CARD}>
    <Skeleton className="mb-8 h-6 w-45 rounded-sm" />
    <div className={LAYOUT}>
      <Skeleton className={cn(RING, "rounded-full")} />
      <div className={DETAILS}>
        <div className="flex w-full flex-col gap-3 max-md:items-center">
          <Skeleton className="h-5 w-full max-w-xl rounded-sm" />
          <Skeleton className="h-5 w-3/5 max-w-md rounded-sm" />
        </div>
        <div className="flex gap-3 max-sm:w-full max-sm:flex-col">
          <Skeleton className="h-12 w-52 rounded-md max-sm:w-full 3xl:h-14 3xl:w-60" />
          <Skeleton className="h-12 w-52 rounded-md max-sm:w-full 3xl:h-14 3xl:w-60" />
        </div>
      </div>
    </div>
  </div>
);

const CreditUsageCard = ({ credits, isLoading }) => {
  const navigate = useNavigate();
  const { locale } = useAppLocale();
  const { t } = useTranslation("employer");
  if (isLoading) {
    return <CreditUsageSkeleton />;
  }

  const rawPercentage = credits?.usage_percent || 0;
  const creditPercentage = Math.round(rawPercentage);
  const creditsLeft = credits?.available || 0;
  const size = 220;
  const center = size / 2;

  // Mask drives the pie reveal from the usage percentage.
  const maskRadius = size / 2 - 16;
  const maskCircumference = 2 * Math.PI * maskRadius;
  const strokeDashoffset = maskCircumference * (1 - rawPercentage / 100);

  const rOuter = size / 2 - 10;
  const rInner = size / 2 - 32;

  const maskId = `progressMask-${creditPercentage}`;

  return (
    <div className={CARD}>
      <h3 className="mt-0 mb-8 text-lg font-semibold text-text-main 3xl:text-xl">
        {t("dashboard.credits.heading")}
      </h3>

      <div className={LAYOUT}>
        <div className={RING}>
          <svg viewBox={`0 0 ${size} ${size}`} className="block size-full">
            <defs>
              <mask id={maskId}>
                <circle
                  cx={center}
                  cy={center}
                  r={maskRadius}
                  fill="none"
                  stroke="white"
                  strokeWidth={size}
                  strokeDasharray={maskCircumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </mask>
            </defs>

            {/* Rotated so 0 progress starts at 12 o'clock. */}
            <g transform={`rotate(-90 ${center} ${center})`}>
              <circle
                cx={center}
                cy={center}
                r={rOuter}
                fill="none"
                stroke="#eef0f3"
                strokeWidth="10"
                strokeDasharray="6 12"
                strokeLinecap="round"
              />
              <circle
                cx={center}
                cy={center}
                r={rInner}
                fill="none"
                stroke="#eef0f3"
                strokeWidth="8"
                strokeDasharray="4 12"
                strokeLinecap="round"
              />

              <g mask={`url(#${maskId})`}>
                <circle
                  cx={center}
                  cy={center}
                  r={rOuter}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="10"
                  strokeDasharray="6 12"
                  strokeLinecap="round"
                />
                <circle
                  cx={center}
                  cy={center}
                  r={rInner}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray="4 12"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </svg>

          {/* Inset to the inner ring so long translations wrap inside it. */}
          <div className="absolute inset-x-[17%] inset-y-[22%] flex flex-col items-center justify-center text-center">
            <p className="m-0 font-[system-ui,-apple-system] text-[40px] leading-none font-extrabold tracking-[-1.5px] text-text-main 3xl:text-5xl">
              {creditPercentage}%
            </p>
            <p className="mt-1 mb-0 text-sm leading-snug font-semibold text-balance text-neutral-500 3xl:text-base">
              {t("dashboard.credits.used")}
            </p>
            <p className="mt-1 mb-0 text-xs leading-snug font-medium text-balance text-neutral-500 3xl:text-sm">
              {t("dashboard.credits.creditsLeft", { count: creditsLeft })}
            </p>
          </div>
        </div>

        <div className={DETAILS}>
          <p className="m-0 max-w-2xl text-lg leading-relaxed text-neutral-600 3xl:text-xl">
            {t("dashboard.credits.blurb")}
          </p>
          <div className="flex flex-wrap gap-3 max-sm:w-full max-sm:flex-col">
            <Button
              className={cn(BUTTON, "bg-brand-600 text-white hover:bg-brand-600 hover:brightness-110")}
              onClick={() => navigate(localePath(locale, "/pricing"))}
            >
              {t("dashboard.credits.addCredits")}
              <Plus className="size-5" aria-hidden="true" />
            </Button>
            <Button
              className={cn(BUTTON, "bg-neutral-100 text-neutral-700 hover:bg-neutral-200")}
              onClick={() => navigate("/employer/invoice")}
            >
              {t("dashboard.credits.viewTransactions")}
              <ChevronRight className="size-5 rtl:-scale-x-100" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditUsageCard;
