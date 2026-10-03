import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import {
  AlertTriangle,
  FileQuestion,
  ShieldAlert,
  RotateCw,
  LayoutDashboard,
  LogIn,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Route error boundary for employee routes. Renders even when a route module
// fails to load, so it can't depend on route-scoped styles.
export function EmployeeErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let config = {
    category: "System Error",
    title: "Session Interrupted",
    description:
      "We encountered an unexpected issue while loading your workspace. Our team has been notified.",
    code: "500",
    isFatal: false,
    actionLabel: "Re-sync Session",
    Icon: AlertTriangle,
    ActionIcon: RotateCw,
  };

  if (isRouteErrorResponse(error)) {
    config.code = error.status;
    if (error.status === 404) {
      config.category = "404 Not Found";
      config.title = "Page Not Found";
      config.description =
        "The page you are looking for doesn't exist or has been moved.";
      config.actionLabel = "Back to Workspace";
      config.Icon = FileQuestion;
      config.ActionIcon = LayoutDashboard;
    } else if (error.status === 401) {
      config.category = "401 Unauthorized";
      config.title = "Session Expired";
      config.description =
        "For your security, your session requires re-authentication. Please log in again.";
      config.actionLabel = "Re-authenticate";
      config.Icon = ShieldAlert;
      config.ActionIcon = LogIn;
    }
  } else if (error instanceof Error) {
    config.isFatal = true;
    config.title = "Rendering error";
    config.description =
      "A technical exception occurred. Our engineers have been alerted.";
    config.debug = error.message;
  }

  return (
    <div className="fixed inset-0 z-9999 flex min-h-screen items-center justify-center overflow-hidden bg-bg-subtle text-text-main">
      <main>
        <div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full animate-mesh-flow bg-[radial-gradient(circle_at_15%_50%,rgba(37,99,235,0.08)_0%,transparent_50%),radial-gradient(circle_at_85%_30%,rgba(14,165,233,0.08)_0%,transparent_50%),radial-gradient(circle_at_50%_80%,rgba(56,189,248,0.06)_0%,transparent_50%)] blur-[60px] motion-reduce:animate-none"></div>

        <div className="relative z-10 w-[90%] max-w-175 translate-y-7.5 animate-card-float-up rounded-xl border border-white/40 bg-white/65 p-16 text-center opacity-0 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.08),inset_0_0_0_1px_rgba(255,255,255,0.6)] backdrop-blur-[24px] motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100 max-md:px-6 max-md:py-10">
          <div className="relative mx-auto mb-8 flex size-20 animate-icon-pulse items-center justify-center rounded-xl bg-gradient-to-br from-card to-brand-100 shadow-[0_12px_24px_-8px_rgba(37,99,235,0.25),inset_0_0_0_1px_rgba(255,255,255,0.8)] after:absolute after:inset-[-2px] after:-z-1 after:rounded-[26px] after:bg-gradient-to-br after:from-brand-600 after:to-brand-500 after:opacity-30 after:blur-[10px] after:content-[''] motion-reduce:animate-none">
            <config.Icon className="size-9 text-brand-600" aria-hidden="true" />
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-300/50 bg-brand-100/80 px-4 py-1.5 text-sm font-bold tracking-[0.08em] text-brand-600 uppercase">
            <span className="size-2 animate-dot-blink rounded-full bg-brand-600 shadow-[0_0_0_2px_rgba(59,130,246,0.2)] motion-reduce:animate-none"></span>
            {config.category}
          </div>

          <h1 className="mb-4 text-[clamp(2.25rem,4vw,3rem)] leading-[1.1] font-extrabold tracking-[-0.03em]">
            <span className="bg-gradient-to-br from-text-main to-neutral-700 bg-clip-text text-transparent">
              {config.title}
            </span>
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-neutral-500">
            {config.description}
          </p>

          <div className="flex flex-wrap justify-center gap-4 max-md:flex-col">
            <Button
              onClick={() => navigate(0)}
              className="h-auto rounded-md bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl max-md:w-full motion-reduce:hover:translate-y-0"
            >
              <config.ActionIcon className="size-4.5" aria-hidden="true" />
              {config.actionLabel}
            </Button>
            <Button
              onClick={() => navigate(-1)}
              className="h-auto rounded-md border border-border/80 bg-card/80 px-8 py-3.5 text-base font-semibold text-text-main shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-card hover:shadow-md max-md:w-full motion-reduce:hover:translate-y-0"
            >
              <ArrowLeft className="size-4.5" aria-hidden="true" />
              Go Back
            </Button>
          </div>

          {config.isFatal && config.debug && (
            <div className="mt-8 overflow-x-auto rounded-md border border-border/50 bg-bg-subtle/70 p-5 text-start font-mono text-sm text-danger">
              Error: {config.debug}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
