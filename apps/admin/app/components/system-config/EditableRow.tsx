import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";
import { Check, Pencil, X } from "lucide-react";

interface EditableRowProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconColor?: string;
  iconBg?: string;
  label: string;
  description: string;
  value: number;
  unit?: string;
  min?: number;
  max?: number;
  isPending: boolean;
  onSave: (next: number) => void;
}

export default function EditableRow({
  icon: Icon,
  iconColor = "text-blue-600 dark:text-blue-400",
  iconBg = "bg-blue-50 dark:bg-blue-500/10",
  label,
  description,
  value,
  unit,
  min = 1,
  max = 99999,
  isPending,
  onSave,
}: EditableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // sync the draft when the saved value changes
  useEffect(() => {
    if (!isEditing) setDraft(String(value));
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  function handleEdit() {
    setDraft(String(value));
    setError(null);
    setIsEditing(true);
  }

  function handleCancel() {
    setDraft(String(value));
    setError(null);
    setIsEditing(false);
  }

  function handleSave() {
    const parsed = Number(draft);
    if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
      setError(`Enter a whole number between ${min} and ${max}.`);
      return;
    }
    if (parsed === value) {
      setIsEditing(false);
      return;
    }
    onSave(parsed);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  }

  return (
    <div className="group rounded-2xl bg-muted/50 px-5 py-4 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
          >
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                type="number"
                min={min}
                max={max}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                disabled={isPending}
                className="h-8 w-24 rounded-xl border border-input bg-card px-3 text-right text-sm font-semibold text-foreground tabular-nums shadow-xs ring-0 outline-hidden transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
              />
              {unit && (
                <span className="text-xs text-muted-foreground">{unit}</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              title="Save"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              title="Cancel"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-input hover:text-foreground disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-base font-semibold text-foreground tabular-nums">
                {value}
              </span>
              {unit && (
                <span className="text-xs text-muted-foreground">{unit}</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleEdit}
              disabled={isPending}
              title={`Edit ${label}`}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground opacity-80 transition group-hover:opacity-100 hover:bg-accent hover:text-foreground disabled:cursor-not-allowed"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 pl-12 text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
