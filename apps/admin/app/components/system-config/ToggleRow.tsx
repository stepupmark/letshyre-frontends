interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  value: boolean;
  onLabel?: string;
  offLabel?: string;
  colorOn?: "emerald" | "amber" | "red" | "blue";
  isPending: boolean;
  onChange: (next: boolean) => void;
}

const colorMap = {
  emerald: "bg-emerald-500 dark:bg-emerald-500 focus-visible:ring-emerald-400",
  amber: "bg-amber-500 dark:bg-amber-500 focus-visible:ring-amber-400",
  red: "bg-red-500 dark:bg-red-500 focus-visible:ring-red-400",
  blue: "bg-blue-500 dark:bg-blue-500 focus-visible:ring-blue-400",
};

const pillOn = {
  emerald:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
};

export default function ToggleRow({
  id,
  label,
  description,
  value,
  onLabel = "Enabled",
  offLabel = "Disabled",
  colorOn = "emerald",
  isPending,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-muted/50">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
            value
              ? pillOn[colorOn]
              : "bg-muted text-muted-foreground"
          }`}
        >
          {value ? onLabel : offLabel}
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
              ? colorMap[colorOn]
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
