import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFormatters } from "@/i18n/format";
import { cn } from "@/lib/utils";
import { purchaseLabel } from "@/features/employer/components/invoices/purchaseLabel";

const TH = "h-auto px-5 py-3 text-xs font-semibold text-text-muted";
const TD = "px-5 py-4 align-middle text-sm whitespace-normal";
const ROW = "border-border-soft";
const DATE_COLUMN = "max-sm:hidden";
const INVOICE_COLUMN = "max-md:hidden";

function SkeletonRows() {
  return [1, 2, 3, 4, 5].map((i) => (
    <TableRow key={i} className={cn(ROW, "hover:bg-transparent")}>
      <TableCell className={cn(TD, DATE_COLUMN)}>
        <Skeleton className="h-4 w-24 rounded-sm" />
      </TableCell>
      <TableCell className={TD}>
        <Skeleton className="h-4 w-44 max-w-full rounded-sm" />
      </TableCell>
      <TableCell className={TD}>
        <Skeleton className="ms-auto h-4 w-16 rounded-sm" />
      </TableCell>
      <TableCell className={cn(TD, INVOICE_COLUMN)}>
        <Skeleton className="ms-auto h-4 w-28 rounded-sm" />
      </TableCell>
    </TableRow>
  ));
}

function InvoiceRow({ invoice, onOpen }) {
  const { t } = useTranslation("employer");
  const { formatDateLong, formatCurrency } = useFormatters();
  const label = purchaseLabel(t, invoice);
  const date = formatDateLong(invoice.paidAt);

  return (
    <TableRow className={cn(ROW, "cursor-pointer hover:bg-bg-subtle")} onClick={() => onOpen(invoice)}>
      <TableCell className={cn(TD, DATE_COLUMN, "text-text-muted tabular-nums")}>{date}</TableCell>
      <TableCell className={TD}>
        <Button
          type="button"
          variant="link"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(invoice);
          }}
          className="inline h-auto p-0 text-start font-medium whitespace-normal text-text-main"
        >
          {label.name} <span className="font-normal text-text-muted">· {label.credits}</span>
        </Button>
        <span className="mt-0.5 block text-xs text-text-muted tabular-nums sm:hidden">{date}</span>
      </TableCell>
      <TableCell className={cn(TD, "text-end font-semibold text-text-main tabular-nums")}>
        {formatCurrency(invoice.total, "INR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </TableCell>
      <TableCell className={cn(TD, INVOICE_COLUMN)}>
        <div className="flex items-center justify-end gap-2">
          {invoice.invoiceNumber ? (
            <span className="font-mono text-xs text-text-body">{invoice.invoiceNumber}</span>
          ) : (
            <span className="text-xs text-text-muted">{t("invoice.preparing")}</span>
          )}
          {invoice.invoiceUrl && (
            <Button asChild variant="ghost" size="icon-sm" className="text-brand-700">
              <a
                href={invoice.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                aria-label={t("invoice.downloadLabel", { number: invoice.invoiceNumber ?? "" })}
              >
                <Download aria-hidden="true" />
              </a>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function InvoiceTable({ invoices, loading, stale, onOpen }) {
  const { t } = useTranslation("employer");

  return (
    <div
      aria-busy={loading || stale}
      className={cn(
        "overflow-hidden rounded-lg border border-border-soft bg-card shadow-sm transition-opacity duration-200",
        stale && "opacity-60",
      )}
    >
      {loading && (
        <span role="status" className="sr-only">
          {t("states.loading")}
        </span>
      )}
      <Table className="border-collapse">
        <TableCaption className="sr-only">{t("invoice.caption")}</TableCaption>
        <TableHeader>
          <TableRow className={cn(ROW, "bg-bg-subtle hover:bg-bg-subtle")}>
            <TableHead className={cn(TH, DATE_COLUMN)}>{t("invoice.columns.date")}</TableHead>
            <TableHead className={TH}>{t("invoice.columns.purchase")}</TableHead>
            <TableHead className={cn(TH, "text-end")}>{t("invoice.columns.amount")}</TableHead>
            <TableHead className={cn(TH, INVOICE_COLUMN, "text-end")}>{t("invoice.columns.invoice")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <SkeletonRows />
          ) : (
            invoices.map((invoice) => <InvoiceRow key={invoice.id} invoice={invoice} onOpen={onOpen} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
