export default function CandidateProfileSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-muted/50">
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 rounded-md bg-muted" />
          <div className="h-8 w-28 rounded-full bg-muted" />
        </div>

        <div className="h-52 rounded-3xl bg-muted" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="h-72 rounded-2xl bg-muted" />
            <div className="h-80 rounded-2xl bg-muted" />
            <div className="h-96 rounded-2xl bg-muted" />
          </div>

          <div className="space-y-6">
            <div className="h-72 rounded-2xl bg-muted" />
            <div className="h-64 rounded-2xl bg-muted" />
            <div className="h-52 rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
