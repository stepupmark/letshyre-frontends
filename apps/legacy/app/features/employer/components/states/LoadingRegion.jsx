import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function LoadingRegion({ label, className, children }) {
  const { t } = useTranslation("employer");
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div role="status" aria-busy="true" className={cn("flex flex-col gap-4", className)}>
      <span className="sr-only">{label ?? t("states.loading")}</span>
      <div aria-hidden="true" className="contents">
        {children}
      </div>
      {slow && (
        <p className="m-0 text-center text-sm text-text-muted">{t("states.slow")}</p>
      )}
    </div>
  );
}
