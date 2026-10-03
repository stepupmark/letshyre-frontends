import { useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shared success screen for the end of an auth flow (register / forgot).
 *
 * @param {{
 *   title: string, subtitle: string,
 *   actionLabel: string, onAction: () => void,
 *   autoRedirect?: () => void, redirectMs?: number,
 * }} props
 */
export function AuthSuccess({
  title,
  subtitle,
  actionLabel,
  onAction,
  autoRedirect,
  redirectMs = 5000,
}) {
  useEffect(() => {
    if (!autoRedirect) return;
    const t = setTimeout(autoRedirect, redirectMs);
    return () => clearTimeout(t);
  }, [autoRedirect, redirectMs]);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-success-bg text-success">
        <Check size={32} aria-hidden="true" />
      </div>
      <h2 className="m-0 text-2xl font-extrabold text-text-main">{title}</h2>
      <p className="m-0 text-sm leading-[1.6] text-neutral-500">{subtitle}</p>
      <Button className="mt-2 h-auto w-full rounded-full border-0 bg-text-main px-6 py-4 text-base font-bold text-white shadow-lg transition-all duration-150 hover:-translate-y-px hover:bg-text-main hover:shadow-xl disabled:opacity-65 motion-reduce:hover:translate-y-0" type="button" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
