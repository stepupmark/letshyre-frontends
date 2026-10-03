import { useSearchParams, Link } from "react-router";
import { Unlock, Users, Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUnlockedCandidates } from "@/features/employer/hooks/useUnlockedCandidates";
import { UnlockedCandidateCard } from "@/features/employer/components/unlocked/UnlockedCandidateCard";
import { UnlockedCandidateSkeleton } from "@/features/employer/components/unlocked/UnlockedCandidateSkeleton";
import { Pagination } from "@/components/common/Pagination";
import { ErrorState } from "@/features/employer/components/states/ErrorState";
import { LoadingRegion } from "@/features/employer/components/states/LoadingRegion";
import { useQueryFailure } from "@/features/employer/hooks/useQueryFailure";

import { cn } from "@/lib/utils";

export function UnlockedCandidatesList() {
  const { t } = useTranslation("employerCandidates");
  const { t: tShared } = useTranslation("employer");
  const [searchParams, setSearchParams] = useSearchParams();
  const parsedPage = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);

  const unlockedQuery = useUnlockedCandidates(page);
  const { data, isLoading, isError, error, refetch, isFetching, isPlaceholderData } = unlockedQuery;
  const { failed, retry, retrying } = useQueryFailure(unlockedQuery);

  const candidates = data?.results ?? [];
  const totalPages = data?.totalPages ?? 1;
  const count = data?.count ?? candidates.length;
  const pageSize = data?.pageSize;
  const hasCandidates = candidates.length > 0;

  const handlePageChange = (nextPage) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", String(nextPage));
      return params;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const subtitle = failed
    ? null
    : isLoading
    ? t("unlocked.subtitleLoading")
    : count > 0
      ? t("unlocked.subtitle", { count })
      : t("unlocked.subtitleEmpty");

  return (
    <div className="flex flex-col gap-5 max-md:p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10.5 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-600">
            <Unlock size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="m-0 text-2xl font-bold tracking-tight text-brand-700">{t("unlocked.title")}</h1>
            {subtitle && <p className="mt-1 mb-0 text-sm leading-normal text-neutral-500">{subtitle}</p>}
          </div>
        </div>

        <Link
          to="/employer/shared-links"
          prefetch="intent"
          className="inline-flex items-center gap-1.75 rounded-md border border-border bg-card px-3.5 py-2 text-sm font-semibold text-neutral-600 no-underline transition-colors duration-200 hover:border-brand-300 hover:bg-bg-subtle hover:text-brand-700"
        >
          <Link2 size={16} aria-hidden="true" />
          {tShared("sharing.manageLink")}
        </Link>
      </header>

      {isError && data && (
        <ErrorState layout="inline" stale error={error} onRetry={refetch} retrying={isFetching} />
      )}

      {isLoading && !failed ? (
        <LoadingRegion className="block overflow-hidden rounded-lg border border-border bg-card shadow-sm max-lg:flex max-lg:flex-col max-lg:gap-4 max-lg:overflow-visible max-lg:rounded-none max-lg:border-0 max-lg:bg-transparent max-lg:shadow-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <UnlockedCandidateSkeleton key={i} />
          ))}
        </LoadingRegion>
      ) : failed ? (
        <ErrorState error={error} onRetry={retry} retrying={retrying} />
      ) : hasCandidates ? (
        <>
          <div aria-busy={isPlaceholderData} className={cn(isPlaceholderData && "opacity-60 transition-opacity duration-200", "overflow-hidden rounded-lg border border-border bg-card shadow-sm max-lg:flex max-lg:flex-col max-lg:gap-4 max-lg:overflow-visible max-lg:rounded-none max-lg:border-0 max-lg:bg-transparent max-lg:shadow-none", "stagger-in [--stagger-6:225ms] [--stagger-7:270ms] [--stagger-max:300ms]")}>
            {candidates.map((candidate) => (
              <UnlockedCandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            count={count}
            pageSize={pageSize}
          />
        </>
      ) : (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-brand-200 bg-card px-6 pt-14 pb-16 text-center">
          <div className="mb-5 flex size-19 items-center justify-center rounded-full bg-brand-100 text-brand-500">
            <Users size={40} aria-hidden="true" />
          </div>
          <h2 className="mt-0 mb-2 text-xl font-semibold text-text-body">{t("unlocked.emptyTitle")}</h2>
          <p className="m-0 max-w-[42ch] text-sm leading-relaxed text-neutral-500">
            {t("unlocked.emptyBody")}
          </p>
        </div>
      )}
    </div>
  );
}
