export default function ChartSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs overflow-hidden relative animate-pulse">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="h-4 w-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-full mb-3" />
          <div className="h-5 w-44 bg-muted rounded-lg mb-2" />
          <div className="h-3 w-60 bg-muted rounded-md" />
        </div>
        <div className="w-8 h-8 rounded-xl bg-muted shrink-0" />
      </div>

      <div className="flex items-center justify-center my-4" style={{ height: 200 }}>
        <div className="relative">
          <div className="w-40 h-40 rounded-full bg-muted" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[72px] h-[72px] rounded-full bg-card" />
          </div>
          <div className="absolute inset-0 rounded-full border-18 border-border opacity-60" />
        </div>
      </div>

      <div className="space-y-3 mt-2">
        {[80, 65, 55, 45].map((w, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-muted shrink-0" />
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
