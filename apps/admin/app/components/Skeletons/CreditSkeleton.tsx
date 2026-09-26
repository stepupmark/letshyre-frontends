export default function CreditSkeleton() {
  return (
    <div className="bg-muted/50">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="flex items-end justify-between gap-6 border-b border-border pb-6">
          <div className="space-y-3">
            <div className="h-8 w-56 rounded-md bg-muted" />
            <div className="h-4 w-96 rounded-md bg-muted" />
          </div>

          <div className="h-11 w-36 rounded-2xl bg-muted" />
        </div>

        <div className="grid grid-cols-12 gap-10 py-10">
          <div className="col-span-12 lg:col-span-4">
            <div className="h-6 w-40 rounded-sm bg-muted" />
            <div className="mt-3 h-4 w-full rounded-sm bg-muted" />
            <div className="mt-2 h-4 w-5/6 rounded-sm bg-muted" />

            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <div className="h-3 w-24 rounded-sm bg-muted" />
              <div className="mt-3 h-6 w-40 rounded-sm bg-muted" />
              <div className="mt-3 h-4 w-full rounded-sm bg-muted" />
            </div>
          </div>

          <div className="col-span-12 space-y-8 lg:col-span-8">
            <div className="rounded-2xl border border-border bg-card px-6 py-5">
              <div className="h-3 w-40 rounded-sm bg-muted" />
              <div className="mt-4 h-10 w-36 rounded-sm bg-muted" />
              <div className="mt-3 h-4 w-72 rounded-sm bg-muted" />
            </div>

            <div>
              <div className="h-4 w-32 rounded-sm bg-muted" />

              <div className="mt-3 h-12 w-full rounded-2xl border border-border bg-card" />

              <div className="mt-3 h-4 w-72 rounded-sm bg-muted" />
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="h-3 w-32 rounded-sm bg-muted" />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="rounded-xl bg-muted/50 px-4 py-3">
                    <div className="h-4 w-20 rounded-sm bg-muted" />
                    <div className="mt-3 h-5 w-24 rounded-sm bg-muted" />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-5">
              <div className="h-4 w-52 rounded-sm bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
