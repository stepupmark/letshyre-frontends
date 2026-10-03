import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useJobs } from "@/features/employer/hooks/useEmployerJobs";
import { buildJobsQueryParams } from "@/lib/queryKeys";
import { JobList } from "@/features/employer/components/view-jobs/JobList";
import { Pagination } from "@/components/common/Pagination";
import { LoadingSkeleton } from "@/features/employer/components/view-jobs/LoadingSkeleton";
import { ErrorState } from "@/features/employer/components/states/ErrorState";
import { LoadingRegion } from "@/features/employer/components/states/LoadingRegion";
import { useQueryFailure } from "@/features/employer/hooks/useQueryFailure";
import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Underline tab: transparent bottom border pulled -1px onto the list's own border.
const CD_TAB =
  "-mb-px h-auto gap-2 rounded-none border-b-2 border-transparent bg-transparent px-0.5 py-2.5 text-sm font-medium whitespace-nowrap text-neutral-500 transition-all hover:bg-transparent hover:text-brand-600 max-md:shrink-0 max-md:text-xs";
const CD_TAB_ACTIVE = "border-b-brand-500 font-semibold text-brand-600 hover:text-brand-600";

const CD_TAB_DOT = "size-2 shrink-0 rounded-full";
const CD_TAB_DOT_TONE = {
  open: "bg-success",
  closed: "bg-danger",
  paused: "bg-neutral-400",
};

// On mobile the tab row becomes a horizontally swipeable strip with a hidden scrollbar.
const CD_JOB_TABS =
  "mx-3.75 mt-3 mb-5 flex gap-5 border-b border-border px-0.5 max-md:mx-1.25 max-md:mt-2 max-md:mb-4 max-md:flex-nowrap max-md:gap-4 max-md:overflow-x-auto max-md:scrollbar-none";

// `label` is the status token used for the URL param and matching (kept as-is
// so the value sent to the API is unchanged); `key` resolves the display label
// from the catalog at render time.
const JOB_TABS = [
  { label: "All", key: "all", dot: null },
  { label: "Open", key: "open", dot: "open" },
  { label: "Closed", key: "closed", dot: "closed" },
  { label: "Paused", key: "paused", dot: "paused" },
];

export function ViewJobs() {
  const { t } = useTranslation("employerJobs");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get("status") || "all";

  // Shared with this route's clientLoader so the prefetched cache entry and the
  // one read here can't drift apart.
  const queryParams = useMemo(
    () => buildJobsQueryParams(searchParams),
    [searchParams],
  );
  const currentPage = queryParams.page;

  const jobsQuery = useJobs(queryParams);
  const { data: jobsData, isLoading, isError, error, refetch, isFetching, isPlaceholderData } =
    jobsQuery;
  const { failed, retry, retrying } = useQueryFailure(jobsQuery);

  const currentJobs = jobsData?.results || [];
  const totalPages = jobsData?.total_pages || 1;
  const totalCount = jobsData?.count;
  const pageSize = jobsData?.page_size;

  const handleTabChange = (tab) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (tab === "all") {
        newParams.delete("status");
      } else {
        newParams.set("status", tab);
      }
      newParams.set("page", "1");
      return newParams;
    });
  };

  const handlePageChange = (page) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", page.toString());
      return newParams;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between max-md:px-1.25">
        <div>
          <h1 className="m-0 text-2xl font-bold tracking-tight text-brand-700 max-md:text-xl">
            {t("viewJobs.title")}
          </h1>
          <p className="mt-2 text-sm leading-normal font-normal text-neutral-500">
            {t("viewJobs.subtitle")}
          </p>
        </div>
      </div>
      <div className={CD_JOB_TABS} role="tablist" aria-label={t("viewJobs.tablistAria")}>
        {JOB_TABS.map(({ label, key, dot }) => {
          const active = urlStatus.toLowerCase() === label.toLowerCase();
          return (
            <Button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn(CD_TAB, active && CD_TAB_ACTIVE)}
              onClick={() => handleTabChange(label)}
            >
              {dot ? (
                <span
                  className={cn(CD_TAB_DOT, CD_TAB_DOT_TONE[dot])}
                  aria-hidden="true"
                ></span>
              ) : (
                <LayoutGrid size={18} className="text-sm leading-none" aria-hidden="true" />
              )}
              {t(`viewJobs.tabs.${key}`)}
            </Button>
          );
        })}
      </div>
      {isLoading && !failed ? (
        <LoadingRegion>
          <LoadingSkeleton />
        </LoadingRegion>
      ) : failed ? (
        <ErrorState error={error} onRetry={retry} retrying={retrying} />
      ) : (
        <>
          {isError && (
            <ErrorState
              layout="inline"
              stale
              error={error}
              onRetry={refetch}
              retrying={isFetching}
              className="mb-4"
            />
          )}
          <div
            aria-busy={isPlaceholderData}
            className={cn("transition-opacity duration-200", isPlaceholderData && "opacity-60")}
          >
            <JobList
              jobs={currentJobs}
              onView={(jobId) => navigate(`/employer/view-jobs/${jobId}`)}
            />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            count={totalCount}
            pageSize={pageSize}
          />
        </>
      )}
    </>
  );
}
