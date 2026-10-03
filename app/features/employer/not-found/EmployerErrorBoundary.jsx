import { useRouteError, isRouteErrorResponse, useNavigate, Link } from "react-router";
import { RotateCw, LayoutDashboard, LogIn, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo2.webp";
import { Button } from "@/components/ui/button";

// Route error boundary for employer routes. Renders even when a route module
// fails to load, so it can't depend on route-scoped styles.
export function EmployerErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let config = {
    category: "System Error",
    title: "Something went wrong",
    description:
      "We encountered an unexpected issue while loading this page. Our team has been notified.",
    code: "500",
    isFatal: false,
    actionLabel: "Try Again",
    ActionIcon: RotateCw,
  };

  if (isRouteErrorResponse(error)) {
    config.code = error.status;
    if (error.status === 404) {
      config.category = "404 Not Found";
      config.title = "Page Not Found";
      config.description =
        "The page you are looking for doesn't exist or has been moved.";
      config.actionLabel = "Back to Dashboard";
      config.ActionIcon = LayoutDashboard;
    } else if (error.status === 401) {
      config.category = "401 Unauthorized";
      config.title = "Session Expired";
      config.description =
        "Your session has expired. Please log in again to continue.";
      config.actionLabel = "Log In";
      config.ActionIcon = LogIn;
    }
  } else if (error instanceof Error) {
    config.isFatal = true;
    config.title = "Application Error";
    config.description =
      "A technical exception occurred. Please try refreshing the page or contact support if the issue persists.";
    config.debug = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-subtle text-text-main">
      <header className="flex items-center border-b border-border bg-card px-[5%] py-6">
        <Link to="/">
          {/* eslint-disable-next-line no-restricted-syntax -- The brand name is the logo's accessible name. */}
          <img src={logo} alt="LetsHyre" className="h-8" loading="lazy" decoding="async" />
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-[5%] py-12">
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[100vw] max-h-200 w-screen max-w-200 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(37,99,235,0.05)_0%,rgba(255,255,255,0)_70%)]"></div>

        <div className="relative z-1 w-full max-w-175 rounded-lg border border-border/80 bg-card px-12 py-14 text-center shadow-[0_10px_40px_-10px_rgba(37,99,235,0.1),0_8px_10px_-6px_rgba(0,0,0,0.01)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.15),0_8px_10px_-6px_rgba(0,0,0,0.01)] motion-reduce:hover:translate-y-0 max-md:px-6 max-md:py-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-300 bg-brand-100 px-3.5 py-1.5 text-sm font-semibold tracking-[0.05em] text-brand-600 uppercase">
            <span className="size-2 rounded-full bg-brand-600 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"></span>
            {config.category}
          </div>

          <h1 className="mb-4 text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-text-main">
            <span className="bg-gradient-to-br from-text-body to-text-main bg-clip-text text-transparent">
              {config.title}
            </span>
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-neutral-500">
            {config.description}
          </p>

          <div className="flex flex-wrap justify-center gap-4 max-md:flex-col">
            <Button
              onClick={() => navigate(0)}
              className="h-auto rounded-sm bg-brand-600 px-7 py-3.5 text-base font-semibold text-white transition-all hover:bg-brand-700 max-md:w-full"
            >
              <config.ActionIcon className="size-4.5" aria-hidden="true" />
              {config.actionLabel}
            </Button>
            <Button
              onClick={() => navigate(-1)}
              className="h-auto rounded-sm border border-border bg-card px-7 py-3.5 text-base font-semibold text-text-main transition-all hover:border-neutral-300 hover:bg-bg-subtle max-md:w-full"
            >
              <ArrowLeft className="size-4.5" aria-hidden="true" />
              Go Back
            </Button>
          </div>

          {config.isFatal && config.debug && (
            <div className="mt-8 overflow-x-auto rounded-sm border border-border bg-bg-subtle p-4 text-start font-mono text-sm text-danger">
              Error: {config.debug}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
