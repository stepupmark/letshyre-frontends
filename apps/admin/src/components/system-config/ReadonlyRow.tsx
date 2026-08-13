import type { ComponentType, SVGProps } from "react";

interface ReadonlyRowProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconColor?: string;
  iconBg?: string;
  label: string;
  description: string;
  value: string | number;
  unit?: string;
}

export default function ReadonlyRow({
  icon: Icon,
  iconColor = "text-blue-600 dark:text-blue-400",
  iconBg = "bg-blue-50 dark:bg-blue-500/10",
  label,
  description,
  value,
  unit,
}: ReadonlyRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 pr-10 rounded-2xl bg-gray-50 dark:bg-slate-800/60">
      {/* Icon + text */}
      <div className="flex items-center flex-1 min-w-0 gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {/* Value badge */}
      <div className="flex items-baseline gap-1 shrink-0">
        <span className="text-base font-semibold text-gray-900 tabular-nums dark:text-white">
          {value}
        </span>
        {unit && (
          <span className="text-xs text-gray-400 dark:text-slate-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
