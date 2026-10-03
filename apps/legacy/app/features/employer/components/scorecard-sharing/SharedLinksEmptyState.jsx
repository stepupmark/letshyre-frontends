import { Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SharedLinksEmptyState() {
  const { t } = useTranslation("sharedLinks");

  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-brand-200 bg-card px-6 pt-14 pb-16 text-center">
      <div className="mb-5 flex size-19 items-center justify-center rounded-full bg-brand-100 text-brand-500">
        <Link2 size={40} aria-hidden="true" />
      </div>
      <h2 className="mt-0 mb-2 text-xl font-semibold text-text-body">
        {t("list.emptyTitle")}
      </h2>
      <p className="m-0 max-w-[42ch] text-sm leading-relaxed text-neutral-500">
        {t("list.emptyBody")}
      </p>
    </div>
  );
}
