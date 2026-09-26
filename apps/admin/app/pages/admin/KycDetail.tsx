import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import { useKycDetail, useUpdateKycStatus } from "../../hooks/useKyc";
import { Modal } from "../../components/legacy-ui/modal/model2";
import { KycRejectFormValues, kycRejectSchema } from "../../schemas/kyc.schema";
import { getErrorMessage } from "~/lib/api/api-error";

const CheckCircleIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const XCircleIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const LoaderIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const BackIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const MailIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </svg>
);

const GlobeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
    />
  </svg>
);

const MapPinIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </svg>
);

const LinkIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
    />
  </svg>
);

const BuildingIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
    />
  </svg>
);

const FileTextIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

interface RejectModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => void;
}

function RejectModal({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: RejectModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<KycRejectFormValues>({
    resolver: zodResolver(kycRejectSchema),
    defaultValues: { remarks: "" },
  });

  const submit = (data: KycRejectFormValues) => {
    onConfirm(data.remarks);
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="w-full max-w-md p-6"
    >
      <div className="flex items-center gap-3 mb-4 text-rose-600 dark:text-rose-400">
        <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/30">
          <XCircleIcon />
        </div>
        <h3 className="text-xl font-bold text-foreground">
          Reject Application
        </h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Please provide the reason for verifying this employer's KYC as rejected.
        The feedback will be stored.
      </p>

      <form onSubmit={handleSubmit(submit)}>
        <div className="mt-6">
          <label className="block text-sm font-semibold text-foreground">
            Remarks / Reason
          </label>
          <textarea
            {...register("remarks")}
            className="w-full p-3 mt-2 text-sm text-foreground transition-all border border-border resize-none bg-muted/50 rounded-xl focus:ring-2 focus:ring-ring/50 focus:border-ring"
            rows={4}
            placeholder="e.g., GST document is heavily blurred..."
          />
          {errors.remarks && (
            <p className="mt-1 text-xs text-red-500">
              {errors.remarks.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-foreground transition bg-card border border-input rounded-xl hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition shadow-xs bg-rose-600 rounded-xl hover:bg-rose-700 focus:ring-4 focus:ring-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <LoaderIcon /> : "Confirm Rejection"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function KycDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: record, isLoading, isError, error } = useKycDetail(id || "");
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateKycStatus();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  const errorMessage = isError
    ? getErrorMessage(error, "Failed to fetch KYC detail.")
    : null;

  const handleApprove = () => {
    if (!id) return;
    setApproving(true);
    updateStatus(
      { kycId: id, status: "Verified" },
      {
        onSuccess: () => {
          setApproving(false);
          toast.success("KYC Verified successfully");
        },
        onError: (err: unknown) => {
          setApproving(false);
          toast.error(getErrorMessage(err, "Failed to approve KYC."));
        },
      },
    );
  };

  const handleConfirmReject = (remarks: string) => {
    if (!id) return;
    updateStatus(
      { kycId: id, status: "Rejected", remarks },
      {
        onSuccess: () => {
          setIsRejectModalOpen(false);
          toast.error("KYC Rejected successfully");
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err, "Failed to reject KYC."));
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="p-4 rounded-full bg-primary/10 text-primary">
          <LoaderIcon />
        </div>
        <span className="font-semibold text-muted-foreground animate-pulse">
          Loading details...
        </span>
      </div>
    );
  }

  if (isError || !record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center">
        <div className="p-4 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500">
          <XCircleIcon />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          Record Not Found
        </h2>
        <span className="max-w-md text-sm text-muted-foreground">
          {errorMessage ||
            "The requested KYC detailed record could not be loaded."}
        </span>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 mt-4 text-sm font-semibold text-foreground transition bg-card border border-border shadow-xs rounded-xl hover:bg-accent"
        >
          Go Back to KYC List
        </button>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Admin – KYC Detail"
        description="Comprehensive review of employer KYC verification"
      />

      <div className="pb-12 space-y-6 font-sans bg-muted/50">
        <div className="flex items-center text-sm font-medium text-muted-foreground">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 transition-colors hover:text-foreground py-1 pr-2"
          >
            <BackIcon />
            Back to Employers
          </button>
          <span className="mx-2 text-muted-foreground/70">/</span>
          <span className="text-foreground">
            KYC Verification
          </span>
        </div>

        <div className="relative overflow-hidden bg-card border border-border shadow-xs rounded-3xl">
          <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-r from-primary/10 via-background to-background" />

          <div className="relative flex flex-col justify-between gap-6 p-6 sm:p-8 md:flex-row md:items-end">
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="flex items-center justify-center p-1.5 bg-card border border-border shadow-md shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl">
                {record.company_logo ? (
                  <img
                    src={record.company_logo}
                    alt={record.company_name}
                    className="object-contain w-full h-full rounded-xl"
                  />
                ) : (
                  <span className="text-2xl font-black text-muted-foreground/70">
                    {(record.company_name || "U").substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {record.company_name || "Unknown Company"}
                  </h1>

                  {record.kyc_status === "Verified" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-800/40 dark:text-emerald-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                      Verified
                    </span>
                  )}
                  {record.kyc_status === "Rejected" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 rounded-lg dark:bg-rose-900/20 dark:border-rose-800/40 dark:text-rose-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />{" "}
                      Rejected
                    </span>
                  )}
                  {record.kyc_status === "Pending" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800/40 dark:text-amber-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />{" "}
                      Pending Review
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-1 text-sm font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <BuildingIcon />
                    {record.company_industry || "Industry Not Specified"}
                  </span>
                </div>
              </div>
            </div>

            {(record.kyc_status === "Pending" ||
              record.kyc_status === "Rejected") && (
              <div className="flex flex-col w-full gap-3 sm:flex-row sm:w-auto md:shrink-0">
                {record.kyc_status === "Pending" && (
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={approving || isUpdating}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-foreground transition bg-card border border-border rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-xs disabled:opacity-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                  >
                    <XCircleIcon />
                    Reject Request
                  </button>
                )}
                <button
                  onClick={handleApprove}
                  disabled={approving || isUpdating}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-primary-foreground transition shadow-xs bg-primary rounded-xl hover:bg-primary/90 focus:ring-4 focus:ring-ring/20 disabled:opacity-70"
                >
                  {approving ? <LoaderIcon /> : <CheckCircleIcon />}
                  {approving ? "Approving..." : "Approve Now"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="flex flex-col gap-6 xl:col-span-2">
            <div className="overflow-hidden bg-card border border-border shadow-xs rounded-3xl">
              <div className="px-6 py-5 border-b border-border bg-muted/50">
                <h2 className="text-lg font-bold text-foreground">
                  Profile Overview
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl border border-border bg-muted/50 text-muted-foreground">
                      <MailIcon />
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        Official Email
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {record.official_email || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl border border-border bg-muted/50 text-muted-foreground">
                      <GlobeIcon />
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        Website URL
                      </p>
                      {record.website_url || record.company_website ? (
                        <a
                          href={
                            record.website_url || record.company_website || "#"
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 mt-1 text-sm font-semibold text-primary hover:text-primary hover:underline"
                        >
                          {record.website_url || record.company_website}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          N/A
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl border border-border bg-muted/50 text-muted-foreground">
                      <LinkIcon />
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        LinkedIn
                      </p>
                      {record.linkedin_url ? (
                        <a
                          href={record.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 mt-1 text-sm font-semibold text-primary hover:text-primary hover:underline"
                        >
                          Visit LinkedIn Profile
                        </a>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          N/A
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 sm:col-span-2">
                    <div className="p-2.5 rounded-xl border border-border bg-muted/50 text-muted-foreground">
                      <MapPinIcon />
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        Company Address
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {record.company_address || "No address provided."}
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="my-8 border-border" />

                <div>
                  <h3 className="mb-3 text-sm font-bold tracking-wider text-foreground uppercase">
                    About the Company
                  </h3>
                  <div className="p-5 text-sm leading-relaxed text-foreground border border-border bg-muted/50 rounded-2xl">
                    {record.company_description ? (
                      <p className="whitespace-pre-line">
                        {record.company_description}
                      </p>
                    ) : (
                      <span className="italic text-muted-foreground">
                        No company description provided.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden bg-card border border-border shadow-xs rounded-3xl">
              <div className="px-6 py-5 border-b border-border bg-muted/50">
                <h2 className="text-lg font-bold text-foreground">
                  Tax & Registration
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="p-4 bg-card border border-border shadow-xs rounded-2xl">
                    <span className="block mb-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      PAN Status
                    </span>
                    <span className="block font-mono text-sm font-black tracking-wide text-foreground">
                      {record.pan_number || "PENDING"}
                    </span>
                  </div>
                  <div className="p-4 bg-card border border-border shadow-xs rounded-2xl">
                    <span className="block mb-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      GST Status
                    </span>
                    <span className="block font-mono text-sm font-black tracking-wide text-foreground">
                      {record.gst_number || "PENDING"}
                    </span>
                  </div>
                  <div className="col-span-2 p-4 bg-card border border-border shadow-xs sm:col-span-1 rounded-2xl">
                    <span className="block mb-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      Reg Number
                    </span>
                    <span className="block font-mono text-sm font-black tracking-wide text-foreground">
                      {record.company_registration_number || "PENDING"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="sticky overflow-hidden bg-card border border-border shadow-xs rounded-3xl top-6">
              <div className="px-6 py-5 border-b border-border bg-muted/50">
                <h2 className="text-lg font-bold text-foreground">
                  Proof Documents
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Provided attachments for verification
                </p>
              </div>

              <div className="p-6 space-y-4">
                {[
                  {
                    label: "Registration Certificate",
                    url: record.registration_certificate,
                  },
                  { label: "GST Certificate", url: record.gst_certificate },
                  { label: "Address Proof", url: record.address_proof },
                  {
                    label: "Authorized ID Proof",
                    url: record.authorized_id_proof,
                  },
                  { label: "Bank Proof", url: record.bank_proof },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 transition-colors border border-border shadow-xs group rounded-2xl hover:border-border hover:shadow-md dark:bg-muted/30 dark:hover:bg-accent"
                  >
                    <div className="flex items-center justify-center p-2.5 text-primary bg-primary/10 rounded-xl">
                      <FileTextIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {doc.label}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                        {doc.url ? "ATTACHED" : "MISSING"}
                      </p>
                    </div>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 text-xs font-bold text-foreground transition-colors bg-card border border-border shadow-xs shrink-0 rounded-xl hover:bg-accent hover:text-primary"
                      >
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RejectModal
        isOpen={isRejectModalOpen}
        isSubmitting={isUpdating}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
      />
    </>
  );
}
