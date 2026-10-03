import { useTranslation } from "react-i18next";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function CheckoutHeader({ item }) {
  const { t } = useTranslation("pricing");

  const title =
    item.kind === "topUp"
      ? t("checkout.topUp.title", { count: item.credits })
      : t("checkout.plan.title", {
          name: t(`plans.${item.plan.id}.name`, { defaultValue: item.plan.name }),
        });
  const summary =
    item.kind === "topUp"
      ? t("checkout.topUp.summary")
      : t("checkout.plan.summary", { count: item.credits });

  return (
    <DialogHeader className="gap-1.5 pe-8 text-start sm:text-start">
      <DialogTitle className="text-xl leading-tight font-bold text-text-main">{title}</DialogTitle>
      <DialogDescription className="text-sm leading-relaxed text-text-muted">{summary}</DialogDescription>
    </DialogHeader>
  );
}
