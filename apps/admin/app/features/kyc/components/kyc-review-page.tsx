import { useState } from "react"
import { Link, useParams } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Check, X } from "lucide-react"
import {
  DocumentViewer,
  DocumentViewerDialog,
} from "@/components/document-viewer"
import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { ErrorState } from "@/components/feedback/error-state"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { formatDate } from "@/lib/format"
import { kycDocuments } from "@/lib/company-kyc"
import { useApproveKyc } from "../mutations/use-review-kyc"
import { kycQueries } from "../queries/kyc.queries"
import { CompanyKycDetails } from "@/components/company-kyc-details"
import { CompanyAvatar, KycStatusBadge } from "@/components/kyc-status-badge"
import { RejectKycDialog } from "./reject-kyc-dialog"

export function KycReviewPage() {
  const { id = "" } = useParams()
  const kyc = useQuery(kycQueries.detail(id))
  useDocumentTitle(
    kyc.data && `${kyc.data.company_name || "Unnamed company"} · KYC`
  )
  const approve = useApproveKyc()
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [documentIndex, setDocumentIndex] = useState(0)
  const [expanded, setExpanded] = useState<number | null>(null)

  const back = (
    <Button
      variant="ghost"
      size="sm"
      className="-ms-2 mb-4"
      nativeButton={false}
      render={<Link to="/dashboard/kyc" />}
    >
      <ArrowLeft /> KYC requests
    </Button>
  )

  if (kyc.isError)
    return (
      <>
        {back}
        <ErrorState error={kyc.error} onRetry={() => void kyc.refetch()} />
      </>
    )

  if (!kyc.data)
    return (
      <>
        {back}
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    )

  const record = kyc.data
  const name = record.company_name || "this company"
  const status = record.kyc_status ?? "Pending"
  const documents = kycDocuments(record)

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
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-brand-text">
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
              <Button
                variant="outline"
                onClick={() => {
                  setRejectOpen(true)
                }}
              >
                <X /> Reject
              </Button>
            )}
            <Button
              onClick={() => {
                setApproveOpen(true)
              }}
            >
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

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="grid gap-4">
          <CompanyKycDetails kyc={record} showDocuments={false} />
        </div>
        <DocumentViewer
          documents={documents}
          index={documentIndex}
          onIndexChange={setDocumentIndex}
          onExpand={() => {
            setExpanded(documentIndex)
          }}
          className="h-[70svh] lg:sticky lg:top-20 lg:h-[calc(100svh-7rem)]"
        />
      </div>
      <DocumentViewerDialog
        documents={documents}
        index={expanded}
        onIndexChange={(index) => {
          setExpanded(index)
          if (index !== null) setDocumentIndex(index)
        }}
      />

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title={`Approve ${name}?`}
        description="Check every document first. The employer can start posting jobs and unlocking candidates right away."
        confirmLabel="Approve"
        pending={approve.isPending}
        onConfirm={() => {
          approve.mutate(record.id)
          setApproveOpen(false)
        }}
      />
      <RejectKycDialog
        kycId={record.id}
        companyName={name}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />
    </>
  )
}
