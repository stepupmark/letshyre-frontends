import React from "react";
import { Briefcase, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardStatsSkeleton from "@/features/employer/components/dashboard/DashboardStatsSkeleton";
import { cn } from "@/lib/utils";

// Per-card tone for the icon, number and accent bar, keyed by card type.
const DASH_CARD_TONE = {
  "active-jobs": { icon: "bg-brand-600", number: "text-brand-600", bar: "bg-brand-400" },
  "inactive-jobs": { icon: "bg-brand-400", number: "text-brand-400", bar: "bg-brand-300" },
  "total-applications": { icon: "bg-warning", number: "text-warning", bar: "bg-warning-bg" },
};

const BAR_MONTHS = ["Dec", "Jan", "Feb", "Mar"];

const ChartPlaceholder = ({ bars, cardType }) => (
  <div className="flex h-10 items-end gap-1.5">
    {bars.map((height, i) => (
      <div key={BAR_MONTHS[i]} className="flex flex-col items-center justify-end gap-1">
        {/* Height is prop data, so it stays an inline style. */}
        <div
          className={cn("w-1.5 rounded-xs", DASH_CARD_TONE[cardType].bar)}
          style={{ height: `${height}px` }}
        ></div>
        <span className="text-xs font-medium text-neutral-400">{BAR_MONTHS[i]}</span>
      </div>
    ))}
  </div>
);

// One stat card, driven by `cardType`.
const StatCard = ({ cardType, label, icon, value, caption, bars }) => {
  // Assigned, not renamed in the destructure — the `icon: Icon` form reads as unused to eslint.
  const Icon = icon;
  const tone = DASH_CARD_TONE[cardType];
  return (
    <div className="flex h-37.5 flex-col justify-between rounded-lg border border-border-soft bg-card p-5 shadow-sm 3xl:h-44 3xl:p-6 transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0">
      <div className="text-sm font-semibold text-neutral-900 3xl:text-base">{label}</div>
      <div className="mt-4 flex h-full items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex size-12 items-center justify-center rounded-full text-white 3xl:size-14", tone.icon)}>
            <Icon size={22} strokeWidth={2} />
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className={cn("m-0 text-3xl leading-none font-bold 3xl:text-4xl", tone.number)}>{value}</h2>
            <p className="m-0 text-xs leading-tight font-medium text-neutral-500 [&>span]:block">
              {caption.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>
        </div>
        <div>
          <ChartPlaceholder bars={bars} cardType={cardType} />
        </div>
      </div>
    </div>
  );
};

const DashboardTopCards = ({ stats, isLoading }) => {
  const { t } = useTranslation("employer");
  if (isLoading) {
    return <DashboardStatsSkeleton />;
  }

  return (
    <>
      <StatCard
        cardType="active-jobs"
        label={t("dashboard.cards.activeJobs")}
        icon={Briefcase}
        value={stats?.active_jobs || 0}
        caption={[t("dashboard.cards.activeCaption1"), t("dashboard.cards.activeCaption2")]}
        bars={[12, 18, 14, 28]}
      />

      <StatCard
        cardType="inactive-jobs"
        label={t("dashboard.cards.inactiveJobs")}
        icon={Briefcase}
        value={stats?.in_active_jobs || 0}
        caption={[t("dashboard.cards.inactiveCaption1"), t("dashboard.cards.inactiveCaption2")]}
        bars={[22, 12, 16, 26]}
      />

      <StatCard
        cardType="total-applications"
        label={t("dashboard.cards.totalApplications")}
        icon={FileText}
        value={stats?.total_applications || 0}
        caption={[t("dashboard.cards.applicationsCaption1"), t("dashboard.cards.applicationsCaption2")]}
        bars={[26, 14, 22, 12]}
      />
    </>
  );
};

export default DashboardTopCards;
