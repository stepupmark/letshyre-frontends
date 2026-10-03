import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { formatNumberFor } from "@/i18n/format";
import { useLocale } from "@/i18n/hooks";
import { formatAmount } from "@/features/pricing/lib/plans";

const ROW = "border-border hover:bg-transparent";
const LABEL = "h-auto px-0 py-3 font-normal whitespace-normal text-text-muted";
const AMOUNT = "px-0 py-3 text-end font-medium text-text-main tabular-nums";

function SummarySkeleton() {
  const { t } = useTranslation("pricing");

  return (
    <>
      <span role="status" className="sr-only">
        {t("checkout.loading.body")}
      </span>
      <Table aria-hidden="true">
        <TableBody>
          {["w-36", "w-24", "w-28"].map((width) => (
            <TableRow key={width} className={ROW}>
              <TableCell className="px-0 py-3">
                <Skeleton className={`h-4 rounded-sm ${width}`} />
              </TableCell>
              <TableCell className="px-0 py-3">
                <Skeleton className="ms-auto h-4 w-20 rounded-sm" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

// Every figure here is the server's. Nothing is recalculated in the browser,
// so what the payer reads is what Razorpay charges.
export function OrderSummary({ quote, coupon }) {
  const { t } = useTranslation("pricing");
  const lang = useLocale();

  if (!quote) return <SummarySkeleton />;

  return (
    <Table>
      <TableCaption className="sr-only">{t("checkout.breakdown.caption")}</TableCaption>
      <TableBody>
        <TableRow className={ROW}>
          <TableHead scope="row" className={LABEL}>
            {t("checkout.breakdown.credits", {
              count: quote.credits,
              rate: formatAmount(lang, quote.rate),
            })}
          </TableHead>
          <TableCell className={AMOUNT}>{formatAmount(lang, quote.subtotal)}</TableCell>
        </TableRow>
        {quote.discount > 0 && (
          <TableRow className={ROW}>
            <TableHead scope="row" className={LABEL}>
              {coupon
                ? t("checkout.breakdown.coupon", { code: coupon.code })
                : t("checkout.breakdown.discount")}
            </TableHead>
            <TableCell className={AMOUNT}>{formatAmount(lang, -quote.discount)}</TableCell>
          </TableRow>
        )}
        <TableRow className={ROW}>
          <TableHead scope="row" className={LABEL}>
            {t("checkout.breakdown.gst", { percent: formatNumberFor(lang, quote.gstPercent) })}
          </TableHead>
          <TableCell className={AMOUNT}>{formatAmount(lang, quote.gst)}</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter className="border-border bg-transparent">
        <TableRow className={ROW}>
          <TableHead scope="row" className="h-auto px-0 pt-4 pb-1 text-base font-bold text-text-main">
            {t("checkout.breakdown.total")}
          </TableHead>
          <TableCell className="px-0 pt-4 pb-1 text-end text-lg font-bold text-text-main tabular-nums">
            {formatAmount(lang, quote.total)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
