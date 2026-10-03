import { useState } from "react";
import { Link } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import { ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Pagination } from "@/components/common/Pagination";
import { localePath } from "@/i18n/config";
import { useLocale } from "@/i18n/hooks";
import { ErrorState } from "@/features/employer/components/states/ErrorState";
import { useQueryFailure } from "@/features/employer/hooks/useQueryFailure";
import { FIRST_PAGE, useInvoices } from "@/features/employer/hooks/useInvoices";
import { InvoiceTable } from "@/features/employer/components/invoices/InvoiceTable";
import { InvoiceReceipt } from "@/features/employer/components/invoices/InvoiceReceipt";

export function Invoice() {
  const { t } = useTranslation("employer");
  const lang = useLocale();
  const [page, setPage] = useState(FIRST_PAGE);
  const [selected, setSelected] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const query = useInvoices(page);
  const { data, isError, error, refetch, isFetching, isPlaceholderData } = query;
  const { failed, retry, retrying } = useQueryFailure(query);
  const loading = query.isLoading && !failed;
  const invoices = data?.invoices ?? [];

  const openReceipt = (invoice) => {
    setSelected(invoice);
    setReceiptOpen(true);
  };

  return (
    <div className="font-ui">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-bold tracking-tight text-brand-700">{t("invoice.title")}</h1>
          <p className="mt-2 text-sm leading-normal text-neutral-500">{t("invoice.subtitle")}</p>
        </div>
        <Button asChild className="h-10 rounded-sm px-5 font-semibold no-underline hover:bg-brand-700">
          <Link to={localePath(lang, "/pricing")}>{t("invoice.buyCredits")}</Link>
        </Button>
      </div>

      {isError && data && (
        <ErrorState
          layout="inline"
          stale
          error={error}
          onRetry={refetch}
          retrying={isFetching}
          className="mb-4"
        />
      )}

      {failed ? (
        <ErrorState error={error} onRetry={retry} retrying={retrying} />
      ) : !loading && invoices.length === 0 ? (
        <Empty className="rounded-lg border border-border-soft bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-brand-100 text-brand-700">
              <ReceiptText aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="font-bold text-text-main">{t("invoice.empty.title")}</EmptyTitle>
            <EmptyDescription className="text-text-muted">{t("invoice.empty.body")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <InvoiceTable invoices={invoices} loading={loading} stale={isPlaceholderData} onOpen={openReceipt} />
          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            <Trans
              t={t}
              i18nKey="invoice.note"
              components={{
                contact: (
                  <Link
                    to={localePath(lang, "/contact")}
                    className="font-medium text-brand-700 underline underline-offset-2"
                  />
                ),
              }}
            />
          </p>
          <Pagination currentPage={data?.currentPage ?? page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}

      <InvoiceReceipt invoice={selected} open={receiptOpen} onOpenChange={setReceiptOpen} />
    </div>
  );
}
