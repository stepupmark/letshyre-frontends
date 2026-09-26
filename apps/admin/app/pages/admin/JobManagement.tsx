import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  BriefcaseBusiness,
  BadgeCheck,
  FileWarning,
  Hourglass,
  CalendarPlus,
  // FolderLock,
  // FileText,
  // FolderOpen,
} from "lucide-react";

import { useJobManagementCards, useJobs } from "../../hooks/useJobs";
import { JobFilters, JobStatus, ApprovalStatus } from "../../api/jobs.api";
import JobsFilters from "../../components/jobs/JobsFilters";
import JobsTable from "../../components/jobs/JobsTable";
import PageMeta from "../../components/common/PageMeta";

export default function JobManagement() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const jobStatus = (searchParams.get("jobStatus") as JobStatus) || undefined;
  const approvalStatus =
    (searchParams.get("approvalStatus") as ApprovalStatus) || undefined;
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const filters: JobFilters = {
    search,
    jobStatus,
    approvalStatus,
    fromDate,
    toDate,
    page,
  };

  const { data, isLoading, isError } = useJobs(filters);
  const { data: cardsData, isLoading: cardsLoading } = useJobManagementCards();
  const cards = cardsData?.data;

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const statsCards = [
    {
      label: "Total Job Posts",
      value: cards?.total_post_jobs || 0,
      icon: (
        <BriefcaseBusiness className="text-indigo-600 size-5 dark:text-indigo-400" />
      ),
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "border-indigo-100 dark:border-indigo-800",
      accent: "from-indigo-500 to-indigo-600",
    },

    {
      label: "Jobs Posted Today",
      value: cards?.today_job_posts || 0,
      icon: (
        <CalendarPlus className="size-5 text-emerald-600 dark:text-emerald-400" />
      ),
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-100 dark:border-emerald-800",
      accent: "from-emerald-500 to-emerald-600",
    },

    {
      label: "Approved Jobs",
      value: cards?.approved_jobs || 0,
      icon: <BadgeCheck className="text-blue-600 size-5 dark:text-blue-400" />,
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-100 dark:border-blue-800",
      accent: "from-blue-500 to-blue-600",
    },

    {
      label: "Rejected Jobs",
      value: cards?.rejected_jobs || 0,
      icon: (
        <FileWarning className="size-5 text-amber-600 dark:text-amber-400" />
      ),
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-100 dark:border-amber-800",
      accent: "from-amber-500 to-amber-600",
    },

    {
      label: "Pending Approvals",
      value: cards?.pending_approvals || 0,
      icon: (
        <Hourglass className="text-orange-600 size-5 dark:text-orange-400" />
      ),
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-100 dark:border-orange-800",
      accent: "from-orange-500 to-orange-600",
    },

    // {
    //   label: "Open Jobs",
    //   value: cards?.open_jobs || 0,
    //   icon: (
    //     <FolderOpen className="text-purple-600 size-5 dark:text-purple-400" />
    //   ),
    //   bg: "bg-purple-50 dark:bg-purple-900/20",
    //   border: "border-purple-100 dark:border-purple-800",
    //   accent: "from-purple-500 to-purple-600",
    // },

    // {
    //   label: "Closed Jobs",
    //   value: cards?.closed_jobs || 0,
    //   icon: <FolderLock className="size-5 text-rose-600 dark:text-rose-400" />,
    //   bg: "bg-rose-50 dark:bg-rose-900/20",
    //   border: "border-rose-100 dark:border-rose-800",
    //   accent: "from-rose-500 to-rose-600",
    // },

    // {
    //   label: "Total Applications",
    //   value: cards?.total_applications || 0,
    //   icon: <FileText className="size-5 text-cyan-600 dark:text-cyan-400" />,
    //   bg: "bg-cyan-50 dark:bg-cyan-900/20",
    //   border: "border-cyan-100 dark:border-cyan-800",
    //   accent: "from-cyan-500 to-cyan-600",
    // },
  ];

  useEffect(() => {
    setSelectedRows([]);
  }, [data]);

  const handleFilterChange = (newFilters: {
    search?: string;
    jobStatus?: JobStatus | "";
    approvalStatus?: ApprovalStatus | "";
    fromDate?: string;
    toDate?: string;
  }) => {
    const params = new URLSearchParams();

    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.jobStatus) params.set("jobStatus", newFilters.jobStatus);
    if (newFilters.approvalStatus)
      params.set("approvalStatus", newFilters.approvalStatus);
    if (newFilters.fromDate) params.set("fromDate", newFilters.fromDate);
    if (newFilters.toDate) params.set("toDate", newFilters.toDate);

    params.set("page", "1");

    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const toggleSelectRow = (jobId: string) => {
    setSelectedRows((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId],
    );
  };

  const toggleSelectAll = () => {
    if (!data?.results) return;
    if (selectedRows.length === data.results.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.results.map((job) => job.id));
    }
  };

  return (
    <>
      <PageMeta
        title="LetsHyre Admin – Job Management"
        description="Review, approve, and manage all job postings across employers"
      />

      <div className="w-full max-w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Job Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            Review, approve, and manage all job postings across employers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 mb-6 sm:grid-cols-2 xl:grid-cols-5">
          {statsCards.map((card) => (
            <div
              key={card.label}
              className="relative p-8 overflow-hidden transition-all duration-300 bg-card border border-border shadow-xs group rounded-2xl hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${card.accent} opacity-70 transition-opacity duration-300 group-hover:opacity-100`}
              />

              <div className="flex items-start justify-between gap-4 mt-1">
                <div>
                  <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                    {cardsLoading ? "--" : card.value}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${card.bg} ${card.border} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <JobsFilters
          initialSearch={search}
          initialJobStatus={jobStatus}
          initialApprovalStatus={approvalStatus}
          initialFromDate={fromDate}
          initialToDate={toDate}
          onFilterChange={handleFilterChange}
        />

        <JobsTable
          jobs={data?.results || []}
          isLoading={isLoading}
          selectedRows={selectedRows}
          onToggleSelectRow={toggleSelectRow}
          onToggleSelectAll={toggleSelectAll}
        />

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 mt-6 bg-card border border-border rounded-xl shadow-xs">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {(data.currentPage - 1) * data.pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(data.currentPage * data.pageSize, data.count)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {data.count}
              </span>{" "}
              jobs
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(data.currentPage - 1)}
                disabled={data.currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-input bg-card text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(data.currentPage + 1)}
                disabled={data.currentPage === data.totalPages}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-input bg-card text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
