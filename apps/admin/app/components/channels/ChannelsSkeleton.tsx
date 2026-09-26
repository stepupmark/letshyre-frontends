export default function ChannelsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded-xl bg-muted" />
          <div className="h-4 w-80 rounded-lg bg-muted" />
        </div>
        <div className="h-9 w-44 rounded-2xl bg-muted" />
      </div>

      <div className="h-20 w-full rounded-2xl bg-muted" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 rounded-2xl bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 rounded-lg bg-muted" />
              <div className="h-3 w-full rounded-sm bg-muted" />
              <div className="h-3 w-3/4 rounded-sm bg-muted" />
            </div>
            <div className="h-px bg-muted" />
            <div className="flex items-center justify-between">
              <div className="h-3 w-40 rounded-sm bg-muted" />
              <div className="h-7 w-12 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
