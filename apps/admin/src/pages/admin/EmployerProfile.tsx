import { useParams, Link } from "react-router";
import { useEmployerProfile } from "../../hooks/useEmployers";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
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

const AVATAR_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-400 to-teal-500",
  "from-rose-500 to-pink-600",
  "from-amber-400 to-orange-500",
  "from-violet-500 to-fuchsia-600",
];

function avatarGradient(name: string | null | undefined) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
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
        <div className="flex items-center justify-center w-20 h-20 text-4xl rounded-full shadow-lg bg-red-50 shadow-red-100">
          ⚠️
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Profile Not Found</h2>
          <p className="mt-2 text-sm text-gray-500">
            We couldn't load the employer profile.
          </p>
        </div>
        <Link
          to="/dashboard/employers"
          className="mt-4 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-xl dark:bg-white dark:text-gray-900"
        >
          ← Back to Employers
        </Link>
      </div>
    );
  }

  const kyc = employer.employer_kyc;
  const cName = kyc?.company_name || "Unknown Company";
  // const grad = avatarGradient(cName);

  return (
    <>
      <PageMeta
        title={`Employer Profile – ${cName}`}
        description="Detailed view of an employer"
      />
      <div className="pb-6 space-y-6">
        {/* top bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to={-1}
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
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

        {/* premium header */}
        <div className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />

          <div className="px-6 pb-6">
            <div className="flex flex-col gap-6 -mt-12 xl:flex-row xl:items-end xl:justify-between">
              {/* left */}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="flex items-center justify-center w-24 h-24 overflow-hidden bg-white border-4 border-white shadow-lg rounded-3xl dark:border-slate-900 dark:bg-slate-800">
                  {kyc?.company_logo ? (
                    <img
                      src={kyc.company_logo}
                      alt={cName}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-slate-700 dark:text-slate-200">
                      {initials(cName)}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-6">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
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

                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    {kyc?.company_industry || "Unspecified Industry"}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {employer.role}
                    </span>

                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {employer.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* right stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="px-4 py-3 border rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
                  <p className="text-xs font-medium text-slate-500">
                    Jobs Posted
                  </p>
                  <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                    {employer.job_posts || 0}
                  </p>
                </div>

                <div className="px-4 py-3 border rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
                  <p className="text-xs font-medium text-slate-500">Phone</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                    {employer.phone_number || "--"}
                  </p>
                </div>

                <div className="px-4 py-3 border rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
                  <p className="text-xs font-medium text-slate-500">
                    Member Since
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                    {kyc?.created_at
                      ? new Date(kyc.created_at).toLocaleDateString()
                      : "--"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* left */}
          <div className="space-y-6 xl:col-span-2">
            {/* about */}
            <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                About Company
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {kyc?.company_description || "No description available."}
              </p>
            </div>

            {/* kyc */}
            <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Registration & Compliance
              </h2>

              <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Registration / CIN
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {kyc?.company_registration_number || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    GST Number
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {kyc?.gst_number || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    PAN Number
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {kyc?.pan_number || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">Remarks</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    {kyc?.verification_remarks || "No remarks"}
                  </p>
                </div>
              </div>
            </div>

            {/* uploaded documents */}
            <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Uploaded Documents
                </h2>

                <span className="text-xs text-slate-500">Opens in new tab</span>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-2">
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
                    className="p-4 border rounded-xl border-slate-200 dark:border-slate-800"
                  >
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {doc.label}
                    </p>

                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        View Document
                      </a>
                    ) : (
                      <p className="mt-3 text-sm text-slate-400">
                        Not Uploaded
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* right */}
          <div className="space-y-6">
            {/* contact */}
            <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Contact Details
              </h2>

              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Official Email
                  </p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {kyc?.official_email || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Account Email
                  </p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {employer.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">Phone</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {employer.phone_number || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">Website</p>
                  <p className="mt-1 font-medium break-all text-slate-900 dark:text-white">
                    {kyc?.website_url || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">Address</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {kyc?.company_address || "--"}
                  </p>
                </div>
              </div>
            </div>

            {/* account */}
            <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Account Info
              </h2>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">User Name</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {employer.user_name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Role</span>
                  <span className="font-medium text-slate-900 dark:text-white">
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
