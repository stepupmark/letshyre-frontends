import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { localePath } from "@/i18n/config";
import { useLocale } from "@/i18n/hooks";
import { CheckoutHeader } from "@/features/pricing/components/checkout/CheckoutHeader";
import { checkoutSearch } from "@/features/pricing/lib/checkout";

const PRIMARY = "h-11 w-full rounded-sm font-semibold no-underline hover:bg-brand-700";
const SECONDARY = "h-11 w-full rounded-sm border-border font-semibold text-text-main no-underline";
const FOOTER = "flex-col gap-2 sm:flex-col";

function GuestGate({ item }) {
  const { t } = useTranslation("pricing");
  const lang = useLocale();
  const from = { pathname: localePath(lang, "/pricing"), search: checkoutSearch(item.key) };

  return (
    <>
      <CheckoutHeader item={item} />
      <p className="text-sm leading-relaxed text-text-body">{t("checkout.gate.guest.body")}</p>
      <DialogFooter className={FOOTER}>
        <Button asChild size="lg" className={PRIMARY}>
          <Link to="/employer/sign-in" state={{ from }}>
            {t("checkout.gate.guest.signIn")}
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className={SECONDARY}>
          <Link to="/employer/register">{t("checkout.gate.guest.register")}</Link>
        </Button>
      </DialogFooter>
      <p className="text-center text-xs text-text-muted">{t("checkout.gate.guest.candidates")}</p>
    </>
  );
}

function RoleGate({ title, body, action, to, onClose }) {
  const { t } = useTranslation("pricing");

  return (
    <>
      <DialogHeader className="gap-1.5 pe-8 text-start sm:text-start">
        <DialogTitle className="text-xl leading-tight font-bold text-text-main">{title}</DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-text-muted">{body}</DialogDescription>
      </DialogHeader>
      <DialogFooter className={FOOTER}>
        <Button asChild size="lg" className={PRIMARY}>
          <Link to={to}>{action}</Link>
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={onClose} className={SECONDARY}>
          {t("checkout.close")}
        </Button>
      </DialogFooter>
    </>
  );
}

export function BuyerGate({ gate, item, onClose }) {
  const { t } = useTranslation("pricing");

  if (gate === "candidate") {
    return (
      <RoleGate
        title={t("checkout.gate.candidate.title")}
        body={t("checkout.gate.candidate.body")}
        action={t("checkout.gate.candidate.action")}
        to="/employee"
        onClose={onClose}
      />
    );
  }

  if (gate === "onboarding") {
    return (
      <RoleGate
        title={t("checkout.gate.onboarding.title")}
        body={t("checkout.gate.onboarding.body")}
        action={t("checkout.gate.onboarding.action")}
        to="/employer/onboarding"
        onClose={onClose}
      />
    );
  }

  return <GuestGate item={item} />;
}
