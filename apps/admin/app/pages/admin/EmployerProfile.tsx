import { useParams, Link } from "react-router";
import { useEmployerProfile } from "../../hooks/useEmployers";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/legacy-ui/badge/Badge";
import { ArrowLeft } from "lucide-react";
import EmployerProfileSkeleton from "../../components/Skeletons/EmployerProfileSkeleton";

function getKycBadgeColor(
  status?: string,
): "success" | "warning" | "error" | "light" {
  switch (status) {
    case "Verified":
      return "success";
    case "Pending":
      return "warning";
    case "Rejected":
      return "error";
    default:
      return "light";
  }
}

function initials(name: string | null | undefined) {
  if (!name) return "UN";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function EmployerProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: employer, isLoading, isError } = useEmployerProfile(id || "");

  if (isLoading) {
    return <EmployerProfileSkeleton />;
  }

  if (isError || !employer) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-4xl shadow-lg shadow-red-100">
          ⚠️
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">
            Profile Not Found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn't load the employer profile.
          </p>
        </div>
        <Link
          to="/dashboard/employers"
          className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
        >
          ← Back to Employers
        </Link>
      </div>
    );
  }

  const kyc = employer.employer_kyc;
  const cName = kyc?.company_name || "Unknown Company";

  return (
    <>
      <PageMeta
        title={`Employer Profile – ${cName}`}
        description="Detailed view of an employer"
      />
      <div className="space-y-6 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/dashboard/employers"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <Badge
            variant="solid"
            color={getKycBadgeColor(kyc?.kyc_status)}
            size="md"
          >
            {kyc?.kyc_status || "Pending KYC"}
          </Badge>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
          <div className="h-28 bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600" />

          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-background bg-card shadow-lg">
                  {kyc?.company_logo ? (
                    <img
                      src={kyc.company_logo}
                      alt={cName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-foreground">
                      {initials(cName)}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-6">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                      {cName}
                    </h1>

                    <Badge
                      variant="solid"
                      color={getKycBadgeColor(kyc?.kyc_status)}
                      size="md"
                    >
                      {kyc?.kyc_status || "Pending KYC"}
                    </Badge>
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">
                    {kyc?.company_industry || "Unspecified Industry"}
                  </p>

                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                      {employer.role}
                    </span>

                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                      {employer.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Jobs Posted
                  </p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {employer.job_posts || 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Phone
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {employer.phone_number || "--"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Member Since
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {kyc?.created_at
                      ? new Date(kyc.created_at).toLocaleDateString()
                      : "--"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h2 className="text-lg font-semibold text-foreground">
                About Company
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {kyc?.company_description || "No description available."}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h2 className="text-lg font-semibold text-foreground">
                Registration & Compliance
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Registration / CIN
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {kyc?.company_registration_number || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    GST Number
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {kyc?.gst_number || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    PAN Number
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {kyc?.pan_number || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Remarks
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {kyc?.verification_remarks || "No remarks"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Uploaded Documents
                </h2>

                <span className="text-xs text-muted-foreground">
                  Opens in new tab
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Registration Certificate",
                    url: kyc?.registration_certificate,
                  },
                  {
                    label: "GST Certificate",
                    url: kyc?.gst_certificate,
                  },
                  {
                    label: "Address Proof",
                    url: kyc?.address_proof,
                  },
                  {
                    label: "Authorized ID Proof",
                    url: kyc?.authorized_id_proof,
                  },
                  {
                    label: "Bank Proof",
                    url: kyc?.bank_proof,
                  },
                ].map((doc, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border p-4"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {doc.label}
                    </p>

                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        View Document
                      </a>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Not Uploaded
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h2 className="text-lg font-semibold text-foreground">
                Contact Details
              </h2>

              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Official Email
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {kyc?.official_email || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Account Email
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {employer.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Phone
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {employer.phone_number || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Website
                  </p>
                  <p className="mt-1 font-medium break-all text-foreground">
                    {kyc?.website_url || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Address
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {kyc?.company_address || "--"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h2 className="text-lg font-semibold text-foreground">
                Account Info
              </h2>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User Name</span>
                  <span className="font-medium text-foreground">
                    {employer.user_name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium text-foreground">
                    {employer.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
