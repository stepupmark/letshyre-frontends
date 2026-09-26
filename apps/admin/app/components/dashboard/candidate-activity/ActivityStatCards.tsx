import { ActivitySummaryData } from "../../../api/candidateActivity.api";
import { UserCheck, Calendar, CalendarDays } from "lucide-react";

interface ActivityStatCardsProps {
  data: ActivitySummaryData;
}

export default function ActivityStatCards({ data }: ActivityStatCardsProps) {
  const stats = [
    {
      title: "Today Active",
      value: data.today_active,
      icon: <UserCheck className="h-6 w-6" />,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-100 dark:border-emerald-500/20",
    },
    {
      title: "Weekly Active",
      value: data.weekly_active,
      icon: <Calendar className="h-6 w-6" />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-100 dark:border-blue-500/20",
    },
    {
      title: "Monthly Active",
      value: data.monthly_active,
      icon: <CalendarDays className="h-6 w-6" />,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      border: "border-purple-100 dark:border-purple-500/20",
    },
  ];

  return (
    <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <h4 className="text-3xl font-bold text-foreground">
                {stat.value}
              </h4>
            </div>
            <div
              className={`rounded-xl p-3 ${stat.bg} ${stat.color} border ${stat.border}`}
            >
              {stat.icon}
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Active Candidates
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
