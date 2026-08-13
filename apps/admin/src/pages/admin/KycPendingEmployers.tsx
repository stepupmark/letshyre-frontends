import { useEffect, useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { usePendingKycEmployers } from "../../hooks/useKyc";
import { Link } from "react-router";
import { AxiosError } from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ChevronRight } from "lucide-react";

const GlobeIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
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
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// ─── Utilities ───────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-blue-600",
];

function avatarGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function KycPendingEmployers() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "Pending" | "Verified" | "Rejected"
  >("Pending");
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusOptions: ("Pending" | "Verified" | "Rejected")[] = [
    "Pending",
    "Verified",
    "Rejected",
  ];

  // Queries
  const {
    data: pageData,
    isLoading,
    isError,
    error,
  } = usePendingKycEmployers(page, statusFilter);

  // Error formatted safely
  const errorMessage = isError
    ? (error as AxiosError<{ message: string }>)?.response?.data?.message ||
      "Failed to fetch KYC records."
    : null;

  const handleNextPage = () => {
    if (pageData && pageData.current_page < pageData.total_pages) {
      setPage((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageData && pageData.current_page > 1) {
      setPage((p) => p - 1);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <PageMeta
        title="Admin – KYC Approvals"
        description="Verify and manage employer KYC records"
      />

      <div className="pb-10 space-y-6 overflow-x-hidden bg-gray-50 dark:bg-gray-900 ">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Employer KYC Verifications
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review and manage employer background verifications.
            </p>
          </div>

          {/* new t start */}

          <div className="flex items-center gap-4">
            <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              Status:
            </label>

            <div className="relative" ref={dropdownRef}>
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
            flex items-center justify-between w-40 px-4 py-2.5 text-sm font-bold transition-all duration-200
            bg-white dark:bg-gray-900 border-2 rounded-2xl outline-none
            ${
              isOpen
                ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-sm"
                : "border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-200"
            }
          `}
              >
                {statusFilter}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors pointer-events-none group-hover:text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Custom Dropdown Menu */}
              {isOpen && (
                <div className="absolute left-0 z-50 w-full mt-2 overflow-hidden bg-white border border-gray-100 shadow-2xl dark:bg-gray-900 dark:border-gray-800 rounded-2xl animate-in fade-in slide-in-from-top-1">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setStatusFilter(status);
                        setIsOpen(false);
                        setPage(1); // Call your page reset here
                      }}
                      className={`
                  flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-colors
                  ${
                    statusFilter === status
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }
                `}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* end */}
        </div>

        {/* ── Data Section ────────────────────────────────────────────────── */}
        {errorMessage && (
          <div className="p-4 text-sm border rounded-xl bg-rose-50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50 text-rose-600 dark:text-rose-400">
            <div className="flex items-center gap-2 font-medium">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {errorMessage}
            </div>
          </div>
        )}

        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="overflow-x-auto">
            <Table className="w-full min-w-[1000px] text-sm text-left">
              <TableHeader className="border-b border-gray-100 bg-gray-50/50 dark:bg-gray-800/20 dark:border-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                  >
                    Company
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                  >
                    HR Mail
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                  >
                    Created At
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-xs font-semibold tracking-wider text-right text-gray-500 uppercase dark:text-gray-400"
                  >
                    ""
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-gray-300 dark:text-gray-600">
                          <LoaderIcon />
                        </div>
                        <span className="font-medium text-gray-400 dark:text-gray-500">
                          Loading records...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !pageData || pageData.results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📭</span>
                        <p className="mt-2 font-medium text-gray-500 dark:text-gray-400">
                          {isError
                            ? "Unable to display records due to an error."
                            : `No ${statusFilter.toLowerCase()} KYC requests found.`}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pageData?.results.map((record) => (
                    <TableRow
                      key={record.id}
                      className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                    >
                      {/* Name & Website */}
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {record.company_logo ? (
                            <img
                              src={record.company_logo}
                              alt={record.company_name}
                              className="object-contain w-10 h-10 p-1 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                          ) : (
                            <div
                              className={`flex items-center justify-center w-10 h-10 shrink-0 font-bold text-white rounded-lg shadow-sm bg-gradient-to-br ${avatarGradient(
                                record.company_name || "Unknown",
                              )}`}
                            >
                              {(record.company_name || "U")
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {record.company_name || "Unknown Company"}
                            </span>
                            {record.company_website && (
                              <a
                                href={
                                  record.company_website.startsWith("http")
                                    ? record.company_website
                                    : `https://${record.company_website}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 mt-1 text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors font-medium"
                              >
                                <GlobeIcon />
                                Website
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* HR Mail */}
                      <TableCell className="px-6 py-5 align-top">
                        {record.official_email ? (
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {record.official_email}
                          </span>
                        ) : (
                          <span className="text-sm italic text-gray-400">
                            Not Specified
                          </span>
                        )}
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="px-6 py-5 align-top">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(record.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </TableCell>

                      {/* View Details Link */}
                      <TableCell className="px-6 py-5 align-top">
                        <div className="flex justify-end">
                          <Link
                            to={`/dashboard/kyc/${record.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-600 transition bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20 dark:hover:bg-brand-500/20"
                          >
                            View Details
                            <ChevronRight className="size-5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pageData && pageData.total_pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100 dark:bg-gray-900 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-200">
                  {pageData.current_page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-200">
                  {pageData.total_pages}
                </span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={pageData.current_page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={pageData.current_page === pageData.total_pages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
