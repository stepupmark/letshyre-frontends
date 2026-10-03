import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { TicketPercent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { formatNumberFor } from "@/i18n/format";
import { useLocale } from "@/i18n/hooks";
import { makeCouponSchema } from "@/features/pricing/schemas/checkout.schema";
import { useApplyCoupon } from "@/features/pricing/mutations/checkout.mutations";

function AppliedCoupon({ coupon, onRemove }) {
  const { t } = useTranslation("pricing");
  const lang = useLocale();

  const saving =
    coupon.discountType === "percentage" && coupon.discountValue != null
      ? t("checkout.coupon.percentOff", { value: formatNumberFor(lang, coupon.discountValue) })
      : t("checkout.coupon.applied");

  return (
    <div role="status" className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Badge variant="outline" className="gap-1.5 rounded-sm border-border px-2 py-1 font-mono text-text-main">
          <TicketPercent className="text-success" aria-hidden="true" />
          {coupon.code}
        </Badge>
        <span className="truncate text-sm text-text-muted">{saving}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        aria-label={t("checkout.coupon.removeLabel", { code: coupon.code })}
        className="rounded-sm text-text-muted hover:text-text-main"
      >
        {t("checkout.coupon.remove")}
      </Button>
    </div>
  );
}

function rejection(error, t) {
  const status = error?.response?.status;
  if (!status || status >= 500) return t("checkout.coupon.error");
  const message = error.response.data?.message;
  return typeof message === "string" && message ? message : t("checkout.coupon.rejected");
}

export function CouponForm({ checkout }) {
  const { t } = useTranslation("pricing");
  const [open, setOpen] = useState(false);
  const schema = useMemo(() => makeCouponSchema(t), [t]);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { code: "" } });
  const apply = useApplyCoupon(checkout.base);

  if (checkout.coupon) {
    return <AppliedCoupon coupon={checkout.coupon} onRemove={checkout.removeCoupon} />;
  }

  const onSubmit = async ({ code }) => {
    if (apply.isPending) return;
    try {
      const quote = await apply.mutateAsync(code);
      if (quote.coupon?.applied) {
        checkout.applyCoupon(code);
        return;
      }
      form.setError("code", { message: quote.coupon?.error || t("checkout.coupon.rejected") });
    } catch (error) {
      form.setError("code", { message: rejection(error, t) });
    }
  };

  const pending = form.formState.isSubmitting;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button type="button" variant="link" className="h-auto p-0 text-sm font-semibold text-brand-700">
          {t("checkout.coupon.toggle")}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="pt-3">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">{t("checkout.coupon.label")}</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        autoFocus
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        maxLength={32}
                        className="h-10 rounded-sm border-border font-mono uppercase"
                      />
                    </FormControl>
                    <Button
                      type="submit"
                      variant="outline"
                      aria-disabled={pending}
                      className="h-10 rounded-sm border-border px-4 font-semibold text-text-main aria-disabled:cursor-wait"
                    >
                      {pending && <Spinner />}
                      {t("checkout.coupon.apply")}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CollapsibleContent>
    </Collapsible>
  );
}
