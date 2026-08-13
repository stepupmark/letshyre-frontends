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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Section header */}
      <div className="mb-5 flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px bg-gray-100 dark:bg-slate-800" />

      {/* Rows */}
      <div className="space-y-3">{children}</div>
    </div>
  );
}
