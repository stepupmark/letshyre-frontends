export default function ChartSkeleton() {
  return (
    <div className="relative animate-pulse overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="mb-3 h-4 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40" />
          <div className="mb-2 h-5 w-44 rounded-lg bg-muted" />
          <div className="h-3 w-60 rounded-md bg-muted" />
        </div>
        <div className="h-8 w-8 shrink-0 rounded-xl bg-muted" />
      </div>

      <div
        className="my-4 flex items-center justify-center"
        style={{ height: 200 }}
      >
        <div className="relative">
          <div className="h-40 w-40 rounded-full bg-muted" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[72px] w-[72px] rounded-full bg-card" />
          </div>
          <div className="absolute inset-0 rounded-full border-18 border-border opacity-60" />
        </div>
      </div>

      <div className="mt-2 space-y-3">
        {[80, 65, 55, 45].map((w, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-muted" />
              <div
                className="h-3 rounded-md bg-muted"
                style={{ width: `${w}px` }}
              />
            </div>
            <div className="h-3 w-10 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
