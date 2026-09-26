import type { ComponentType, ReactNode, SVGProps } from "react";

interface ConfigSectionProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconColor?: string;
  iconBg?: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function ConfigSection({
  icon: Icon,
  iconColor = "text-indigo-600 dark:text-indigo-400",
  iconBg = "bg-indigo-50 dark:bg-indigo-500/10",
  title,
  description,
  children,
}: ConfigSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="mb-5 flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="mb-4 h-px bg-muted" />

      <div className="space-y-3">{children}</div>
    </div>
  );
}
