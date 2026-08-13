export default function CandidateProfileSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-slate-50 dark:bg-slate-950">
      <div className="px-6 py-6 mx-auto space-y-6 max-w-7xl">
        {/* top breadcrumb / action bar */}
        <div className="flex items-center justify-between">
          <div className="w-40 h-5 rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 rounded-full w-28 bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* hero header */}
        <div className="rounded-3xl bg-slate-200 dark:bg-slate-800 h-52" />

        {/* stats row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>

        {/* main content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* left content */}
          <div className="space-y-6 xl:col-span-2">
            <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* right sidebar */}
          <div className="space-y-6">
            <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-52 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
