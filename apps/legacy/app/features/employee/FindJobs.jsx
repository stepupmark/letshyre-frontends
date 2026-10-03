import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/lib/toast";
import { Trans, useTranslation } from "react-i18next";
import { Search, RotateCw, SearchX, Briefcase } from "lucide-react";

import {
  useFindJobs,
  useApplyForJob,
  INITIAL_FIND_JOBS_FILTERS,
} from "@/features/employee/hooks/useFindJobs";
import { useIndustries } from "@/hooks/useIndustries";

import JobCard from "@/features/employee/components/find-jobs/JobCard";
import JobCardSkeleton from "@/features/employee/components/find-jobs/JobCardSkeleton";
import JobDetailModal from "@/features/employee/components/find-jobs/JobDetailModal";
import FindJobsFilters from "@/features/employee/components/find-jobs/FindJobsFilters";
import EmptyState from "@/features/employee/components/find-jobs/EmptyState";
import { getStoredUser } from "@/lib/getUser";

import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatWidget } from "@/features/common/chatbot/ChatWidget";
import { sendChatMessage } from "@/services/chatbot.service";
import { EMPLOYEE_ACCENT } from "@/features/common/chatbot/accents";

const DEBOUNCE_MS = 400;

const { page: _initialPage, ...INITIAL_FILTERS } = INITIAL_FIND_JOBS_FILTERS;

export function FindJobs() {
  const { t } = useTranslation("employee");

  const [selectedJob, setSelectedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const debounceTimer = useRef(null);

  const storedUser = getStoredUser();
  const userName =
    storedUser?.first_name ||
    storedUser?.name ||
    storedUser?.username ||
    "User";

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer.current);
  }, [searchText]);

  const queryFilters = {
    ...filters,
    job_search: debouncedSearch,
    page: currentPage,
  };

  const {
    data: jobsData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useFindJobs(queryFilters);
  const { data: industries = [], isLoading: industriesLoading } =
    useIndustries();
  const applyMutation = useApplyForJob();

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSearchText("");
    setDebouncedSearch("");
    setCurrentPage(1);
  }, []);

  const handleApply = useCallback(
    (jobId) => {
      applyMutation.mutate(jobId, {
        onSuccess: () => {
          setSelectedJob((prev) =>
            prev?.id === jobId
              ? { ...prev, status: "Applied", application_id: "temp" }
              : prev,
          );
        },
        onError: () => {
          toast.error(t("findJobs.applyFailed"));
        },
      });
    },
    [applyMutation, t],
  );

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const jobs = jobsData?.results || [];
  const totalCount = jobsData?.count || 0;
  const totalPages = jobsData?.totalPages || 1;

  return (
    <>
      <header className="mb-7 flex items-start gap-3.5">
        <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-500">
          <Briefcase size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-snug text-text-body">
            {t("findJobs.welcome", { name: userName })}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {t("findJobs.subtitle")}
          </p>
        </div>
      </header>

      <div className="mt-2 max-w-225 flex items-center gap-3 rounded-lg border-[1.5px] border-brand-100 bg-card px-3.5 py-2.5 transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] focus-within:border-brand-500 focus-within:ring-3 focus-within:ring-brand-500/10 max-md:max-w-none max-md:sticky max-md:top-15 max-md:z-10 max-md:-mx-3.5 max-md:rounded-none max-md:border-x-0 max-md:bg-bg-page max-md:p-3.5 max-md:focus-within:border-brand-100 max-md:focus-within:ring-0 max-sm:px-2.5 max-sm:py-2">
        <Search
          size={18}
          className="shrink-0 text-neutral-400"
          strokeWidth={2.5}
        />
        <Input
          className="h-auto flex-1 border-0 outline-none rounded-none bg-transparent p-0 text-sm text-text-body shadow-none placeholder:text-neutral-400 focus-visible:border-0 focus-visible:ring-0 max-sm:text-xs"
          type="text"
          placeholder={t("findJobs.searchPlaceholder")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="max-w-225 max-md:max-w-none">
        <FindJobsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
          industries={industries}
          industriesLoading={industriesLoading}
        />
      </div>

      <div className="mt-5 mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-text-muted [&_span]:text-brand-500">
          {isLoading ? (
            t("findJobs.searching")
          ) : (
            <Trans
              t={t}
              i18nKey="findJobs.showing"
              values={{ count: totalCount }}
              components={{ b: <span /> }}
            />
          )}
        </p>
        {isFetching && !isLoading && (
          <span className="text-xs font-medium text-neutral-400">
            {t("findJobs.updating")}
          </span>
        )}
      </div>

      <div className="flex max-w-225 flex-col gap-3.5">
        {isLoading ? (
          <JobCardSkeleton count={4} />
        ) : isError ? (
          <div className="rounded-lg border-[1.5px] border-danger-bg bg-card px-6 py-12.5 text-center [&_p]:mb-4 [&_p]:text-sm [&_p]:text-danger">
            <p>{t("findJobs.errorLoad")}</p>
            <Button
              variant="outline"
              className="h-auto rounded-md border-[1.5px] border-border bg-card px-6 py-2.5 text-sm font-semibold text-text-muted"
              onClick={() => refetch()}
            >
              <RotateCw size={15} strokeWidth={2.5} className="me-1.5" />
              {t("findJobs.tryAgain")}
            </Button>
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={<SearchX size={48} strokeWidth={1.5} />}
            title={t("findJobs.noJobsTitle")}
            subtitle={t("findJobs.noJobsSubtitle")}
          />
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={(j) => setSelectedJob(j)}
            />
          ))
        )}
      </div>

      {!isLoading && !isError && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
          isApplying={applyMutation.isPending}
        />
      )}

      <ChatWidget
        chat="employee"
        namespace="employee"
        sender={sendChatMessage}
        accent={EMPLOYEE_ACCENT}
      />
    </>
  );
}
