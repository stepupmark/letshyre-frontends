import { useTranslation } from "react-i18next";

/** Sticky section nav, shown only on wide screens where there's room for it. */
export function ReportToc({ sections }) {
  const { t } = useTranslation("sharedScorecard");
  return (
    <nav
      aria-label={t("toc.label")}
      className="sticky top-24 hidden max-h-[calc(100vh-7rem)] shrink-0 flex-col gap-1 overflow-y-auto xl:flex xl:w-52"
    >
      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className="rounded-md px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-brand-100 hover:text-brand-700"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

export default ReportToc;
