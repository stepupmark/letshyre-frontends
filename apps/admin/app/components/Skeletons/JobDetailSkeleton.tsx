export default function JobDetailSkeleton() {
  return (
    <div className="min-h-screen p-6 bg-muted/50 animate-pulse">
      <div className="mx-auto space-y-6 max-w-7xl">
        <div className="h-5 bg-muted rounded-sm w-52" />

        <div className="p-8 bg-card border border-border rounded-3xl">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="h-10 w-[520px] rounded-lg bg-muted" />
              <div className="w-20 h-8 bg-muted rounded-full" />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="w-64 bg-muted h-11 rounded-xl" />
              <div className="w-48 bg-muted h-11 rounded-xl" />
              <div className="bg-muted h-11 w-52 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="p-8 bg-card border border-border rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="bg-muted h-11 w-11 rounded-2xl" />
                <div className="h-8 bg-muted rounded-sm w-52" />
              </div>

              <div className="mt-6 space-y-3">
                <div className="w-full h-4 bg-muted rounded-sm" />
                <div className="w-11/12 h-4 bg-muted rounded-sm" />
                <div className="w-8/12 h-4 bg-muted rounded-sm" />
              </div>
            </div>

            <div className="p-8 bg-card border border-border rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="bg-muted h-11 w-11 rounded-2xl" />
                <div className="w-64 h-8 bg-muted rounded-sm" />
              </div>

              <div className="mt-6 space-y-5">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="bg-muted rounded-full h-7 w-7" />
                    <div className="w-full h-4 bg-muted rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 bg-card border border-border rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="bg-muted h-11 w-11 rounded-2xl" />
              <div className="h-8 bg-muted rounded-sm w-44" />
            </div>

            <div className="mt-8 space-y-7">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex gap-4">
                  <div className="w-12 h-12 bg-muted rounded-2xl" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded-sm w-28" />
                    <div className="w-32 h-5 bg-muted rounded-sm" />
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
