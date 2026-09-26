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
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/50 px-5 py-4 pr-10">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-baseline gap-1">
        <span className="text-base font-semibold text-foreground tabular-nums">
          {value}
        </span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}
