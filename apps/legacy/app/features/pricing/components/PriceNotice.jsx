import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CloudAlert, RotateCw, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const ICONS = { offline: WifiOff, error: CloudAlert };

export function PriceNotice({ status, onRetry, isRetrying }) {
  const { t } = useTranslation("pricing");

  // Remount the message after each failed retry so screen readers announce it again.
  const [attempt, setAttempt] = useState(0);
  const [wasRetrying, setWasRetrying] = useState(isRetrying);
  if (isRetrying !== wasRetrying) {
    setWasRetrying(isRetrying);
    if (!isRetrying) setAttempt((n) => n + 1);
  }

  const Icon = ICONS[status];
  if (!Icon) return null;

  return (
    <Alert
      role="none"
      className="mx-auto mb-6 flex max-w-md flex-col gap-4 rounded-lg border-border bg-card px-4 py-4 shadow-none sm:px-5 md:max-w-none md:flex-row md:items-center"
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md",
          status === "error" ? "bg-warning-bg text-warning" : "bg-neutral-100 text-text-muted",
        )}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>

      <div key={attempt} role="alert" className="min-w-0 flex-1">
        <AlertTitle className="line-clamp-none text-sm font-semibold text-text-main md:text-base">
          {t(`prices.${status}.title`)}
        </AlertTitle>
        <AlertDescription className="text-sm leading-relaxed text-text-muted">
          {t(`prices.${status}.body`)}
        </AlertDescription>
      </div>

      <Button
        type="button"
        onClick={() => !isRetrying && onRetry()}
        aria-disabled={isRetrying}
        className="h-10 w-full gap-2 rounded-sm px-5 font-semibold hover:bg-brand-700 aria-disabled:cursor-wait aria-disabled:opacity-80 md:w-auto md:shrink-0"
      >
        {isRetrying ? <Spinner /> : <RotateCw aria-hidden="true" />}
        {isRetrying ? t("prices.retrying") : t("prices.retry")}
      </Button>
    </Alert>
  );
}
