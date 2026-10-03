import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { useFormatters } from "@/i18n/format";
import { purchaseLabel } from "@/features/employer/components/invoices/purchaseLabel";

const ROW = "border-border hover:bg-transparent";
const LABEL = "h-auto px-0 py-2.5 font-normal whitespace-normal text-text-muted";
const AMOUNT = "px-0 py-2.5 text-end font-medium text-text-main tabular-nums";
const PAISE = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

function Amount({ label, value }) {
  return (
    <TableRow className={ROW}>
      <TableHead scope="row" className={LABEL}>
        {label}
      </TableHead>
      <TableCell className={AMOUNT}>{value}</TableCell>
    </TableRow>
  );
}

// Figures are the server's, as charged; nothing is recalculated here.
export function InvoiceReceipt({ invoice, open, onOpenChange }) {
  const { t } = useTranslation("employer");
  const { formatDate, formatCurrency } = useFormatters();

  if (!invoice) return null;

  const label = purchaseLabel(t, invoice);
  const money = (value) => formatCurrency(value, "INR", PAISE);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 rounded-lg border-border p-6 sm:max-w-md">
        <DialogHeader className="gap-1.5 pe-8 text-start sm:text-start">
          <DialogTitle className="text-lg leading-tight font-bold text-text-main">
            {label.name} · {label.credits}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            {t("invoice.receipt.paidOn", {
              date: formatDate(invoice.paidAt, { dateStyle: "medium", timeStyle: "short" }),
            })}
          </DialogDescription>
        </DialogHeader>

        <Table className="border-collapse">
          <TableCaption className="sr-only">{t("invoice.receipt.caption")}</TableCaption>
          <TableBody>
            <Amount label={t("invoice.receipt.subtotal")} value={money(invoice.subtotal)} />
            {invoice.discount > 0 && (
              <Amount
                label={
                  invoice.couponCode
                    ? t("invoice.receipt.coupon", { code: invoice.couponCode })
                    : t("invoice.receipt.discount")
                }
                value={money(-invoice.discount)}
              />
            )}
            <Amount label={t("invoice.receipt.gst")} value={money(invoice.gst)} />
          </TableBody>
          <TableFooter className="border-border bg-transparent">
            <TableRow className={ROW}>
              <TableHead scope="row" className="h-auto px-0 pt-3 pb-1 text-base font-bold text-text-main">
                {t("invoice.receipt.total")}
              </TableHead>
              <TableCell className="px-0 pt-3 pb-1 text-end text-base font-bold text-text-main tabular-nums">
                {money(invoice.total)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-xs">
          {invoice.invoiceNumber && (
            <>
              <dt className="text-text-muted">{t("invoice.receipt.invoiceNumber")}</dt>
              <dd className="text-end font-mono text-text-main">{invoice.invoiceNumber}</dd>
            </>
          )}
          {invoice.paymentRef && (
            <>
              <dt className="text-text-muted">{t("invoice.receipt.reference")}</dt>
              <dd className="text-end font-mono break-all text-text-main select-all">{invoice.paymentRef}</dd>
            </>
          )}
        </dl>

        {invoice.invoiceUrl && (
          <DialogFooter>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 w-full gap-2 rounded-sm border-border font-semibold text-text-main no-underline"
            >
              <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer">
                <Download aria-hidden="true" />
                {t("invoice.receipt.download")}
              </a>
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
