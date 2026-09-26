export default function SystemConfigSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded-xl bg-muted" />
          <div className="h-4 w-80 rounded-lg bg-muted" />
        </div>
        <div className="h-9 w-32 rounded-2xl bg-muted" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 h-9 w-9 rounded-xl bg-muted" />
            <div className="mb-1 h-6 w-16 rounded-lg bg-muted" />
            <div className="h-3 w-24 rounded-sm bg-muted" />
          </div>
        ))}
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted" />
            <div className="space-y-1">
              <div className="h-4 w-40 rounded-lg bg-muted" />
              <div className="h-3 w-64 rounded-sm bg-muted" />
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, j) => (
              <div
                key={j}
                className="flex items-center justify-between rounded-xl bg-muted/50 p-4"
              >
                <div className="space-y-1">
                  <div className="h-3 w-36 rounded-sm bg-muted" />
                  <div className="h-3 w-52 rounded-sm bg-muted" />
                </div>
                <div className="h-7 w-12 rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
