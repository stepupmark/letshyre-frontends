export default function EmployerProfileSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-muted/50">
      <div className="h-full px-6 py-6 space-y-6">
        <div className="h-44 rounded-3xl bg-muted" />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="h-52 rounded-2xl bg-muted" />
            <div className="h-64 rounded-2xl bg-muted" />
            <div className="h-72 rounded-2xl bg-muted" />
          </div>

          <div className="space-y-6">
            <div className="h-72 rounded-2xl bg-muted" />
            <div className="h-44 rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
