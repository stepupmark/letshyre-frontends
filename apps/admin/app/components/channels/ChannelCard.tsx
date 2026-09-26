import type { ComponentType, SVGProps } from "react";

export type ChannelColor = "blue" | "emerald" | "violet";

interface ChannelCardProps {
  id: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  description: string;
  value: boolean;
  color: ChannelColor;
  isPending: boolean;
  onChange: (next: boolean) => void;
}

const iconBgMap: Record<ChannelColor, string> = {
  blue: "bg-blue-50 dark:bg-blue-500/10",
  emerald: "bg-emerald-50 dark:bg-emerald-500/10",
  violet: "bg-violet-50 dark:bg-violet-500/10",
};

const iconColorMap: Record<ChannelColor, string> = {
  blue: "text-blue-600 dark:text-blue-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  violet: "text-violet-600 dark:text-violet-400",
};

const pillOnMap: Record<ChannelColor, string> = {
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  emerald:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  violet:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
};

const toggleOnMap: Record<ChannelColor, string> = {
  blue: "bg-blue-500 focus-visible:ring-blue-400",
  emerald: "bg-emerald-500 focus-visible:ring-emerald-400",
  violet: "bg-violet-500 focus-visible:ring-violet-400",
};

const glowMap: Record<ChannelColor, string> = {
  blue: "shadow-blue-200 dark:shadow-blue-500/20",
  emerald: "shadow-emerald-200 dark:shadow-emerald-500/20",
  violet: "shadow-violet-200 dark:shadow-violet-500/20",
};

const borderOnMap: Record<ChannelColor, string> = {
  blue: "border-blue-200 dark:border-blue-500/30",
  emerald: "border-emerald-200 dark:border-emerald-500/30",
  violet: "border-violet-200 dark:border-violet-500/30",
};

export default function ChannelCard({
  id,
  icon: Icon,
  label,
  description,
  value,
  color,
  isPending,
  onChange,
}: ChannelCardProps) {
  return (
    <div
      className={`
        group relative flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-xs transition-all duration-200
        ${
          value
            ? `${borderOnMap[color]} shadow-md ${glowMap[color]}`
            : "border-border"
        }
      `}
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBgMap[color]}`}
        >
          <Icon className={`h-6 w-6 ${iconColorMap[color]}`} />
        </span>

        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide transition-all ${
            value
              ? pillOnMap[color]
              : "bg-muted text-muted-foreground"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      </div>

      <div>
        <p className="text-base font-semibold text-foreground">
          {label}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="h-px bg-muted" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {value ? "Enabled — click to disable" : "Disabled — click to enable"}
        </span>

        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={value}
          disabled={isPending}
          onClick={() => onChange(!value)}
          className={`relative h-7 w-12 rounded-full transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            value
              ? toggleOnMap[color]
              : "bg-muted focus-visible:ring-input"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow transition-all duration-200 ${
              value ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
