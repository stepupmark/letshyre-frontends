import { useSearchParams, Link } from "react-router";
import { Link2, AlertTriangle, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSharedLinks } from "@/features/employer/hooks/useSharedLinks";
import { SharedLinksTable } from "@/features/employer/components/scorecard-sharing/SharedLinksTable";
import { SharedLinksSkeleton } from "@/features/employer/components/scorecard-sharing/SharedLinksSkeleton";
import { SharedLinksEmptyState } from "@/features/employer/components/scorecard-sharing/SharedLinksEmptyState";
import { Pagination } from "@/components/common/Pagination";

export function SharedLinks() {
  const { t } = useTranslation("sharedLinks");
  const [searchParams, setSearchParams] = useSearchParams();
  const parsedPage = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);

  const { data, isLoading, error } = useSharedLinks(page);

  const links = data?.results ?? [];
  const totalPages = data?.totalPages ?? 1;
  const count = data?.count ?? links.length;
  const pageSize = data?.pageSize;
  const hasLinks = links.length > 0;

  const handlePageChange = (nextPage) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", String(nextPage));
      return params;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const subtitle = isLoading
    ? t("list.subtitleLoading")
    : count > 0
      ? t("list.subtitle", { count })
      : t("list.subtitleEmpty");

  return (
    <div className="flex flex-col gap-5 max-md:p-4">
      <Link
        to="/employer/unlocked-candidates"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-neutral-500 no-underline transition-colors hover:text-brand-600"
      >
        <ArrowLeft size={15} aria-hidden="true" className="rtl:-scale-x-100" />
        {t("list.back")}
      </Link>

      <header className="flex items-center gap-3">
        <div className="flex size-10.5 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-600">
          <Link2 size={22} aria-hidden="true" />
        </div>
        <div>
          <h1 className="m-0 text-2xl font-bold tracking-tight text-brand-700">
            {t("list.title")}
          </h1>
          <p className="mt-1 mb-0 text-sm leading-normal text-neutral-500">{subtitle}</p>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-3 rounded-md border border-danger-bg bg-danger-bg px-5 py-4 text-sm font-medium text-danger [&_svg]:shrink-0" role="alert">
          <AlertTriangle size={20} aria-hidden="true" />
          <span>{error.message || t("list.errorGeneric")}</span>
        </div>
      )}

      {isLoading ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm max-lg:flex max-lg:flex-col max-lg:gap-4 max-lg:overflow-visible max-lg:rounded-none max-lg:border-0 max-lg:bg-transparent max-lg:shadow-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <SharedLinksSkeleton key={i} />
          ))}
        </div>
      ) : hasLinks ? (
        <>
          <SharedLinksTable links={links} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            count={count}
            pageSize={pageSize}
          />
        </>
      ) : (
        !error && <SharedLinksEmptyState />
      )}
    </div>
  );
}
