import { Link } from "react-router";
import PageMeta from "../components/common/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta
        title="LetsHyre Admin – Page Not Found"
        description="The page you are looking for does not exist."
      />

      <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50 dark:bg-slate-900">
        <div className="w-full max-w-md p-8 text-center bg-white border border-gray-200 shadow-sm rounded-3xl dark:border-white/10 dark:bg-gray-dark">
          <p className="text-sm font-semibold tracking-wide uppercase text-brand-500">
            Error 404
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            Page not found
          </h1>

          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-5 py-3 mt-6 text-sm font-semibold text-white transition rounded-2xl bg-brand-500 hover:opacity-90"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
