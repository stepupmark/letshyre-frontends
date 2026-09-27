import { useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, X } from "lucide-react";
import { ConfirmDialog } from "~/components/feedback/confirm-dialog";
import { ErrorState } from "~/components/feedback/error-state";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useDocumentTitle } from "~/hooks/use-document-title";
import { formatDate } from "~/lib/format";
import { useApproveKyc } from "../mutations/use-review-kyc";
import { kycQueries } from "../queries/kyc.queries";
import { CompanyKycDetails } from "./company-kyc-details";
import { CompanyAvatar, KycStatusBadge } from "./kyc-status-badge";
import { RejectKycDialog } from "./reject-kyc-dialog";

export function KycReviewPage() {
  const { id = "" } = useParams();
  const kyc = useQuery(kycQueries.detail(id));
  useDocumentTitle(
    kyc.data && `${kyc.data.company_name || "Unnamed company"} · KYC`,
  );
  const approve = useApproveKyc();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const back = (
    <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
      <Link to="/dashboard/kyc">
        <ArrowLeft /> KYC requests
      </Link>
    </Button>
  );

  if (kyc.isError)
    return (
      <>
        {back}
        <ErrorState error={kyc.error} onRetry={() => void kyc.refetch()} />
      </>
    );

  if (!kyc.data)
    return (
      <>
        {back}
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    );

  const record = kyc.data;
  const name = record.company_name || "this company";
  const status = record.kyc_status ?? "Pending";

  return (
    <>
      {back}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CompanyAvatar
            name={record.company_name}
            logo={record.company_logo}
            className="size-14"
          />
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              {record.company_name || "Unnamed company"}
              <KycStatusBadge status={status} />
            </h1>
            <p className="text-sm text-muted-foreground">
              Submitted {formatDate(record.created_at)}
            </p>
          </div>
        </div>
        {status !== "Verified" && (
          <div className="flex gap-2">
            {status === "Pending" && (
              <Button variant="outline" onClick={() => setRejectOpen(true)}>
                <X /> Reject
              </Button>
            )}
            <Button onClick={() => setApproveOpen(true)}>
              <Check /> Approve
            </Button>
          </div>
        )}
      </div>

      {status === "Rejected" && record.verification_remarks?.trim() && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Rejected</AlertTitle>
          <AlertDescription>{record.verification_remarks}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        <CompanyKycDetails kyc={record} />
      </div>

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title={`Approve ${name}?`}
        description="Check every document first. The employer can start posting jobs and unlocking candidates right away."
        confirmLabel="Approve"
        pending={approve.isPending}
        onConfirm={() =>
          approve.mutate(record.id, { onSuccess: () => setApproveOpen(false) })
        }
      />
      <RejectKycDialog
        kycId={record.id}
        companyName={name}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />
    </>
  );
}
