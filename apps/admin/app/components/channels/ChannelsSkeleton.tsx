export default function ChannelsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-56 bg-muted h-7 rounded-xl" />
          <div className="h-4 bg-muted rounded-lg w-80" />
        </div>
        <div className="bg-muted h-9 w-44 rounded-2xl" />
      </div>

      <div className="w-full h-20 bg-muted rounded-2xl" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-5 p-6 bg-card border border-border rounded-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-muted rounded-2xl" />
              <div className="w-16 h-6 bg-muted rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="w-32 h-4 bg-muted rounded-lg" />
              <div className="w-full h-3 bg-muted rounded-sm" />
              <div className="w-3/4 h-3 bg-muted rounded-sm" />
            </div>
            <div className="h-px bg-muted" />
            <div className="flex items-center justify-between">
              <div className="w-40 h-3 bg-muted rounded-sm" />
              <div className="w-12 bg-muted rounded-full h-7" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
