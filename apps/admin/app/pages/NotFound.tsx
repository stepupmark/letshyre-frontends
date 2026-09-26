import { Link } from "react-router";
import PageMeta from "../components/common/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta
        title="LetsHyre Admin – Page Not Found"
        description="The page you are looking for does not exist."
      />

      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-xs">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Error 404
          </p>

          <h1 className="mt-2 text-3xl font-bold text-foreground">
            Page not found
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
