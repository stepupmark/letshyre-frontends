import { useTranslation } from "react-i18next";
import { Link2Off, TimerOff, EyeOff, TriangleAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const REASON_ICON = {
  invalid: Link2Off,
  expired: TimerOff,
  limit: EyeOff,
  unavailable: TriangleAlert,
};

/** The four terminal states a shared link can end in — each with its own copy. */
export function ShareLinkUnavailable({ reason, onRetry }) {
  const { t } = useTranslation("sharedScorecard");
  const Icon = REASON_ICON[reason] || REASON_ICON.unavailable;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-bg-subtle text-text-faint" aria-hidden="true">
        <Icon size={30} strokeWidth={1.75} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-xl font-bold text-text-main">{t(`unavailable.${reason}.title`)}</h1>
        <p className="m-0 text-sm text-text-muted">{t(`unavailable.${reason}.description`)}</p>
      </div>
      {reason === "unavailable" && onRetry && (
        <Button type="button" variant="outline" onClick={onRetry} className="gap-1.5">
          <RefreshCw size={15} aria-hidden="true" />
          {t("unavailable.retry")}
        </Button>
      )}
    </div>
  );
}

export default ShareLinkUnavailable;
