import { usePaymentCards } from "../../hooks/usePayments";
import { CreditCard, CheckCircle, Clock, XCircle, Users } from "lucide-react";

export default function PaymentsCards() {
  const { data: cards, isLoading } = usePaymentCards();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-border/80 bg-card p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-3">
                <div className="h-3.5 w-24 rounded-sm bg-muted"></div>
                <div className="h-7 w-10 rounded-sm bg-muted"></div>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!cards) return null;

  const metrics = [
    {
      title: "Total Payments",
      value: cards.total_payments,
      icon: CreditCard,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50/80 dark:bg-blue-500/10",
    },
    {
      title: "Success",
      value: cards.success_payments,
      icon: CheckCircle,
      color: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-50/80 dark:bg-emerald-500/10",
    },
    {
      title: "Pending",
      value: cards.pending_payments,
      icon: Clock,
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-50/80 dark:bg-amber-500/10",
    },
    {
      title: "Failed",
      value: cards.failed_payments,
      icon: XCircle,
      color: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-50/80 dark:bg-red-500/10",
    },
    {
      title: "Repeated Customers",
      value: cards.repeated_customers,
      icon: Users,
      color: "text-foreground",
      bgColor: "bg-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className="group rounded-2xl border border-border/80 bg-card p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
          >
            <div className="flex h-full items-center justify-between">
              <div className="flex h-full flex-col justify-between gap-2.5">
                <h3 className="text-[13px] font-medium whitespace-nowrap text-muted-foreground">
                  {metric.title}
                </h3>
                <p className="text-[28px] leading-none font-bold tracking-tight text-foreground">
                  {metric.value}
                </p>
              </div>
              <div
                className={`flex h-[42px] w-[42px] items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${metric.bgColor}`}
              >
                <Icon className={`h-5 w-5 ${metric.color}`} strokeWidth={2} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
