import { Link, useRouteError } from "react-router";
import { useTranslation } from "react-i18next";
import { CloudAlert, RefreshCw, RotateCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { localePath } from "@/i18n/config";
import { useLocale } from "@/i18n/hooks";
import { errorKind } from "@/features/pricing/lib/errorKind";

const ICONS = { offline: WifiOff, update: RefreshCw, generic: CloudAlert };

// Copy comes from "common": the pricing catalog may be the very thing that failed to load.
export function PricingError() {
  const error = useRouteError();
  const { t } = useTranslation("common");
  const lang = useLocale();
  const kind = errorKind(error);
  const Icon = ICONS[kind];

  return (
    <div className="mx-auto flex w-full max-w-content grow items-center justify-center px-4 pt-28 pb-20 sm:px-6 md:pt-36 md:pb-28 lg:px-8">
      <Empty className="w-full max-w-xl flex-none gap-8 rounded-lg border border-solid border-border bg-card px-6 py-12 md:px-12 md:py-16">
        <EmptyHeader role="alert" className="max-w-md gap-3">
          <EmptyMedia
            variant="icon"
            className={kind === "generic" ? "mb-2 size-12 rounded-md bg-warning-bg text-warning" : "mb-2 size-12 rounded-md bg-neutral-100 text-text-muted"}
          >
            <Icon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle role="heading" aria-level={1} className="text-xl font-bold text-text-main md:text-2xl">
            {t(`pageState.${kind}.title`)}
          </EmptyTitle>
          <EmptyDescription className="text-base leading-relaxed text-text-muted">
            {t(`pageState.${kind}.body`)}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="max-w-none flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
          <Button
            type="button"
            size="lg"
            onClick={() => window.location.reload()}
            className="h-11 w-full rounded-sm font-semibold hover:bg-brand-700 sm:w-auto"
          >
            <RotateCw aria-hidden="true" />
            {t("pageState.reload")}
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-sm border-border font-semibold text-text-main no-underline sm:w-auto"
          >
            {kind === "generic" ? (
              <Link reloadDocument to={localePath(lang, "/contact")}>{t("pageState.contact")}</Link>
            ) : (
              <Link reloadDocument to={localePath(lang)}>{t("pageState.home")}</Link>
            )}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
