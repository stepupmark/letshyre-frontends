import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { CloudAlert, LoaderCircle, Lock, RotateCw, SearchX, Unplug, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { errorKind } from "@/features/employer/lib/errorKind";
import { cn } from "@/lib/utils";

const ICONS = {
  offline: WifiOff,
  unreachable: Unplug,
  generic: CloudAlert,
  forbidden: Lock,
  notFound: SearchX,
};

function SecondaryAction({ action }) {
  const content = (
    <>
      {action.icon && <action.icon size={16} className="rtl:-scale-x-100" aria-hidden="true" />}
      {action.label}
    </>
  );

  return (
    <Button
      asChild={Boolean(action.to)}
      type={action.to ? undefined : "button"}
      variant="outline"
      onClick={action.onClick}
      className="h-11 gap-2 rounded-md px-5 font-semibold no-underline sm:h-10 max-sm:w-full 3xl:h-11"
    >
      {action.to ? <Link to={action.to}>{content}</Link> : content}
    </Button>
  );
}

export function ErrorState({
  error,
  onRetry,
  retrying = false,
  layout = "page",
  stale = false,
  headingLevel = 2,
  notFound,
  action,
  className,
}) {
  const { t } = useTranslation("employer");

  // TanStack clears `error` while a retry is in flight; keep describing the last one.
  const [lastError, setLastError] = useState(error);
  if (error && error !== lastError) setLastError(error);
  const shown = error ?? lastError;

  const kind = errorKind(shown);
  const status = shown?.response?.status;
  const Icon = ICONS[kind];
  const canRetry = onRetry && kind !== "notFound" && kind !== "forbidden";

  // Re-mount the alert after each failed retry so screen readers announce it again.
  const [attempt, setAttempt] = useState(0);
  const [wasRetrying, setWasRetrying] = useState(retrying);
  if (retrying !== wasRetrying) {
    setWasRetrying(retrying);
    if (!retrying) setAttempt((n) => n + 1);
  }

  const title = stale
    ? t("states.stale.title")
    : (kind === "notFound" && notFound?.title) || t(`states.error.${kind}.title`);
  const description = stale
    ? t("states.stale.body")
    : (kind === "notFound" && notFound?.description) || t(`states.error.${kind}.body`);
  const secondary =
    action ??
    ((kind === "notFound" || kind === "forbidden") && {
      label: t("states.backToDashboard"),
      to: "/employer/dashboard",
    });

  const retryButton = canRetry && (
    <Button
      type="button"
      onClick={() => !retrying && onRetry()}
      aria-disabled={retrying}
      className={cn(
        "gap-2 rounded-md bg-brand-600 font-semibold text-white hover:bg-brand-700 aria-disabled:cursor-wait aria-disabled:opacity-80",
        layout === "page" ? "h-11 px-5 sm:h-10 max-sm:w-full 3xl:h-11" : "h-9 px-4 max-sm:w-full",
      )}
    >
      {retrying ? (
        <LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
      ) : (
        <RotateCw size={16} aria-hidden="true" />
      )}
      {retrying ? t("states.retrying") : t("states.retry")}
    </Button>
  );

  if (layout === "inline") {
    return (
      <Alert
        role="none"
        className={cn(
          "flex flex-wrap items-start gap-x-4 gap-y-3 rounded-lg border-border-soft bg-card px-4 py-3.5 shadow-sm sm:flex-nowrap sm:items-center sm:px-5",
          className,
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            kind === "generic" ? "bg-warning-bg text-warning" : "bg-neutral-100 text-neutral-500",
          )}
          aria-hidden="true"
        >
          <Icon size={18} />
        </span>
        <div key={attempt} role="alert" className="min-w-0 flex-1">
          <AlertTitle className="line-clamp-none text-sm font-semibold text-text-main">{title}</AlertTitle>
          <AlertDescription className="text-sm leading-relaxed text-text-muted">{description}</AlertDescription>
        </div>
        {retryButton}
      </Alert>
    );
  }

  return (
    <Empty
      className={cn(
        "rounded-xl border border-solid border-border-soft bg-card px-5 py-12 shadow-sm md:px-8 md:py-16 3xl:py-24",
        className,
      )}
    >
      <EmptyHeader key={attempt} role="alert" className="max-w-md gap-2 3xl:max-w-lg">
        <EmptyMedia
          variant="icon"
          className={cn(
            "mb-3 size-12 rounded-xl 3xl:size-14",
            kind === "generic" ? "bg-warning-bg text-warning" : "bg-neutral-100 text-neutral-500",
          )}
        >
          <Icon className="size-6 3xl:size-7" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle
          role="heading"
          aria-level={headingLevel}
          className="text-lg font-semibold text-text-main md:text-xl 3xl:text-2xl"
        >
          {title}
        </EmptyTitle>
        <EmptyDescription className="text-sm leading-relaxed text-text-muted md:text-base">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      {(retryButton || secondary || status) && (
        <EmptyContent className="max-w-md gap-5">
          {(retryButton || secondary) && (
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
              {retryButton}
              {secondary && <SecondaryAction action={secondary} />}
            </div>
          )}
          {status && (
            <p className="m-0 text-xs text-neutral-500 tabular-nums">
              {t("states.errorCode", { code: status })}
            </p>
          )}
        </EmptyContent>
      )}
    </Empty>
  );
}
