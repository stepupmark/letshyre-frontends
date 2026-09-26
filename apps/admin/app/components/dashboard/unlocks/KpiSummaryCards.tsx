import { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  CalendarCheck,
  CalendarDays,
  CalendarHeart,
  Info,
} from "lucide-react";
import { UnlocksDashboardData } from "../../../api/unlocks.api";

interface KpiCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  index: number;
  trendText?: string;
  trendColor?: string;
}

const Sparkline = ({ color }: { color: string }) => (
  <svg
    width="48"
    height="24"
    viewBox="0 0 48 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 18L14 8L24 16L46 4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 18L14 8L24 16L46 4V24H2V18Z"
      fill={`url(#gradient-${color.replace("#", "")})`}
      opacity="0.15"
    />
    <defs>
      <linearGradient
        id={`gradient-${color.replace("#", "")}`}
        x1="24"
        y1="4"
        x2="24"
        y2="24"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={color} />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

const KpiCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor,
  iconColor,
  index,
  trendText,
  trendColor,
}: KpiCardProps) => {
  const sparklineColor = iconColor.includes("blue")
    ? "#3B82F6"
    : iconColor.includes("green")
      ? "#22C55E"
      : iconColor.includes("purple")
        ? "#A855F7"
        : "#F97316";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs transition-shadow duration-300 hover:shadow-md"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgColor} ${iconColor} shrink-0`}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <h3 className="text-xs font-semibold text-muted-foreground">
              {title}
            </h3>
            <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
          </div>
          <p className="mb-2 text-2xl font-bold tracking-tight text-foreground">
            {value.toLocaleString()}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <p className="mb-0.5 text-[11px] font-medium whitespace-nowrap text-muted-foreground">
            {subtitle}{" "}
            {trendText && (
              <span className={`ml-1 font-semibold ${trendColor}`}>
                {trendText}
              </span>
            )}
          </p>
          <div className="flex shrink-0">
            <Sparkline color={sparklineColor} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function KpiSummaryCards({
  summary,
}: {
  summary: UnlocksDashboardData["summary"];
}) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        index={0}
        title="Total Unlocks"
        value={summary.total_unlocks || 0}
        subtitle="All time unlocks"
        icon={<Lock className="h-5 w-5" strokeWidth={2} />}
        iconBgColor="bg-blue-50 dark:bg-blue-900/30"
        iconColor="text-blue-500"
      />
      <KpiCard
        index={1}
        title="Today Unlocks"
        value={summary.today_unlocks || 0}
        subtitle=""
        trendText=""
        trendColor="text-green-500"
        icon={<CalendarCheck className="h-5 w-5" strokeWidth={2} />}
        iconBgColor="bg-green-50 dark:bg-green-900/30"
        iconColor="text-green-500"
      />
      <KpiCard
        index={2}
        title="Week Unlocks"
        value={summary.week_unlocks || 0}
        subtitle=""
        trendText=""
        trendColor="text-green-500"
        icon={<CalendarDays className="h-5 w-5" strokeWidth={2} />}
        iconBgColor="bg-purple-50 dark:bg-purple-900/30"
        iconColor="text-purple-500"
      />
      <KpiCard
        index={3}
        title="Month Unlocks"
        value={summary.month_unlocks || 0}
        subtitle=""
        trendText=""
        trendColor="text-green-500"
        icon={<CalendarHeart className="h-5 w-5" strokeWidth={2} />}
        iconBgColor="bg-orange-50 dark:bg-orange-900/30"
        iconColor="text-orange-500"
      />
    </div>
  );
}
