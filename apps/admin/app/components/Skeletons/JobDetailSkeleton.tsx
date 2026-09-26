export default function JobDetailSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-muted/50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-5 w-52 rounded-sm bg-muted" />

        <div className="rounded-3xl border border-border bg-card p-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="h-10 w-[520px] rounded-lg bg-muted" />
              <div className="h-8 w-20 rounded-full bg-muted" />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="h-11 w-64 rounded-xl bg-muted" />
              <div className="h-11 w-48 rounded-xl bg-muted" />
              <div className="h-11 w-52 rounded-xl bg-muted" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-border bg-card p-8">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-muted" />
                <div className="h-8 w-52 rounded-sm bg-muted" />
              </div>

              <div className="mt-6 space-y-3">
                <div className="h-4 w-full rounded-sm bg-muted" />
                <div className="h-4 w-11/12 rounded-sm bg-muted" />
                <div className="h-4 w-8/12 rounded-sm bg-muted" />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-muted" />
                <div className="h-8 w-64 rounded-sm bg-muted" />
              </div>

              <div className="mt-6 space-y-5">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="h-7 w-7 rounded-full bg-muted" />
                    <div className="h-4 w-full rounded-sm bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-2xl bg-muted" />
              <div className="h-8 w-44 rounded-sm bg-muted" />
            </div>

            <div className="mt-8 space-y-7">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-muted" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 rounded-sm bg-muted" />
                    <div className="h-5 w-32 rounded-sm bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
