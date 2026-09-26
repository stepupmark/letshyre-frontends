import { ReactNode, useEffect, useState } from "react";
import { Info } from "lucide-react";
import { motion } from "framer-motion";

function AnimatedCounter({
  value,
  isCurrency,
  currency,
}: {
  value: number;
  isCurrency?: boolean;
  currency?: "USD" | "INR";
}) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1500;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);

      setCurrentValue(value * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentValue(value);
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [value]);

  const formattedValue = isCurrency
    ? currentValue.toLocaleString(currency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency: currency === "INR" ? "INR" : "USD",
        maximumFractionDigits: 0,
      })
    : currentValue.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return <>{formattedValue}</>;
}

interface RevenueStatCardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  currency?: "USD" | "INR";
  subtitle?: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  trendIndicator?: ReactNode;
  index?: number;
}

export default function RevenueStatCard({
  title,
  value,
  isCurrency,
  currency,
  subtitle,
  icon,
  iconBgColor,
  iconColor,
  trendIndicator,
  index = 0,
}: RevenueStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group flex cursor-pointer flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgColor} ${iconColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
            {icon}
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <h3 className="text-sm font-medium text-muted-foreground">
                {title}
              </h3>
              <Info className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-blue-500" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              <AnimatedCounter
                value={value}
                isCurrency={isCurrency}
                currency={currency}
              />
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        <div className="flex h-8 items-end justify-end">{trendIndicator}</div>
      </div>
    </motion.div>
  );
}
