import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

export function SharedLinkStatusBadge({ link }) {
  const { t } = useTranslation("sharedLinks");

  if (link.is_expired) {
    return (
      <Badge
        variant="outline"
        className="border-danger-bg bg-danger-bg text-danger"
      >
        {t("status.expired")}
      </Badge>
    );
  }
  if (link.has_reached_max_views) {
    return (
      <Badge
        variant="outline"
        className="border-warning-bg bg-warning-bg text-warning"
      >
        {t("status.limitReached")}
      </Badge>
    );
  }
  if (!link.is_active) {
    return (
      <Badge
        variant="outline"
        className="border-border bg-bg-subtle text-neutral-500"
      >
        {t("status.inactive")}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-success-bg bg-success-bg text-success"
    >
      {t("status.active")}
    </Badge>
  );
}
