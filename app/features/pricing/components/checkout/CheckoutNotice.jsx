import { useTranslation } from "react-i18next";
import { CircleAlert, Info, RefreshCw, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ICONS = {
  cancelled: Info,
  priceChanged: RefreshCw,
  failed: CircleAlert,
  blocked: ShieldAlert,
  error: CircleAlert,
};

export function CheckoutNotice({ notice }) {
  const { t } = useTranslation("pricing");
  const Icon = ICONS[notice.kind];
  const calm = notice.kind === "cancelled" || notice.kind === "priceChanged";

  return (
    <Alert variant={calm ? "default" : "destructive"} className="rounded-sm border-border">
      <Icon aria-hidden="true" />
      <AlertTitle className="line-clamp-none font-semibold">{t(`checkout.notice.${notice.kind}.title`)}</AlertTitle>
      <AlertDescription className={calm ? "text-text-muted" : undefined}>
        {notice.detail || t(`checkout.notice.${notice.kind}.body`)}
      </AlertDescription>
    </Alert>
  );
}
