export default function EmployerProfileSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-slate-50 dark:bg-slate-950">
      <div className="h-full px-6 py-6 space-y-6">
        {/* header block */}
        <div className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800" />

        {/* content grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* left */}
          <div className="space-y-6 xl:col-span-2">
            <div className="h-52 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* right */}
          <div className="space-y-6">
            <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
