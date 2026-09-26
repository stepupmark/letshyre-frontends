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
} from "../../components/legacy-ui/table";
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

  const {
    data: pageData,
    isLoading,
    isError,
    error,
  } = usePendingKycEmployers(page, statusFilter);

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

      <div className="pb-10 space-y-6 overflow-x-hidden bg-muted/50 ">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Employer KYC Verifications
            </h1>
            <p className="text-sm text-muted-foreground">
              Review and manage employer background verifications.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Status:
            </label>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
            flex items-center justify-between w-40 px-4 py-2.5 text-sm font-bold transition-all duration-200 bg-card border-2 rounded-2xl outline-hidden
            ${
              isOpen
                ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-xs"
                : "border-border text-foreground hover:border-border"
            }
          `}
              >
                {statusFilter}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors pointer-events-none group-hover:text-muted-foreground">
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

              {isOpen && (
                <div className="absolute left-0 z-50 w-full mt-2 overflow-hidden bg-card border border-border shadow-2xl rounded-2xl animate-in fade-in slide-in-from-top-1">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setStatusFilter(status);
                        setIsOpen(false);
                        setPage(1);
                      }}
                      className={`
                  flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-colors
                  ${
                    statusFilter === status
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-muted-foreground hover:bg-accent"
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
        </div>

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

        <div className="overflow-hidden bg-card border border-border shadow-xs rounded-2xl">
          <div className="overflow-x-auto">
            <Table className="w-full min-w-[1000px] text-sm text-left">
              <TableHeader className="border-b border-border bg-muted/50">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    Company
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    HR Mail
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    Created At
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-xs font-semibold tracking-wider text-right text-muted-foreground uppercase"
                  >
                    ""
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-muted-foreground/70">
                          <LoaderIcon />
                        </div>
                        <span className="font-medium text-muted-foreground">
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
                        <p className="mt-2 font-medium text-muted-foreground">
                          {isError
                            ? "Unable to display records due an error."
                            : `No ${statusFilter.toLowerCase()} KYC requests found.`}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pageData?.results.map((record) => (
                    <TableRow
                      key={record.id}
                      className="transition-colors hover:bg-accent/80"
                    >
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {record.company_logo ? (
                            <img
                              src={record.company_logo}
                              alt={record.company_name}
                              className="object-contain w-10 h-10 p-1 bg-muted border border-border rounded-lg"
                            />
                          ) : (
                            <div
                              className={`flex items-center justify-center w-10 h-10 shrink-0 font-bold text-white rounded-lg shadow-xs bg-linear-to-br ${avatarGradient(
                                record.company_name || "Unknown",
                              )}`}
                            >
                              {(record.company_name || "U")
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
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
                                className="flex items-center gap-1.5 mt-1 text-xs text-primary hover:text-primary transition-colors font-medium"
                              >
                                <GlobeIcon />
                                Website
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-5 align-top">
                        {record.official_email ? (
                          <span className="text-sm font-medium text-foreground">
                            {record.official_email}
                          </span>
                        ) : (
                          <span className="text-sm italic text-muted-foreground">
                            Not Specified
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-5 align-top">
                        <span className="text-sm text-muted-foreground">
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

                      <TableCell className="px-6 py-5 align-top">
                        <div className="flex justify-end">
                          <Link
                            to={`/dashboard/kyc/${record.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary transition bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/10"
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

          {pageData && pageData.total_pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-card border-t border-border">
              <span className="text-sm text-muted-foreground">
                Page{" "}
                <span className="font-semibold text-foreground">
                  {pageData.current_page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {pageData.total_pages}
                </span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={pageData.current_page === 1}
                  className="px-4 py-2 text-sm font-medium text-foreground transition-colors bg-card border border-border shadow-xs rounded-xl hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={pageData.current_page === pageData.total_pages}
                  className="px-4 py-2 text-sm font-medium text-foreground transition-colors bg-card border border-border shadow-xs rounded-xl hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
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
