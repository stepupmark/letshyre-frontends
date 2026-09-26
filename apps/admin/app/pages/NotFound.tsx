import { Link } from "react-router";
import PageMeta from "../components/common/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta
        title="LetsHyre Admin – Page Not Found"
        description="The page you are looking for does not exist."
      />

      <div className="flex items-center justify-center min-h-screen px-4 bg-muted/50">
        <div className="w-full max-w-md p-8 text-center bg-card border border-border shadow-xs rounded-3xl">
          <p className="text-sm font-semibold tracking-wide uppercase text-primary">
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
            className="inline-flex items-center justify-center px-5 py-3 mt-6 text-sm font-semibold text-primary-foreground transition rounded-2xl bg-primary hover:opacity-90"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
