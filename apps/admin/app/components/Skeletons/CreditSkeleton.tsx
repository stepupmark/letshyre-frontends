export default function CreditSkeleton() {
  return (
    <div className="bg-muted/50">
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="flex items-end justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-3">
            <div className="w-56 h-8 bg-muted rounded-md" />
            <div className="h-4 bg-muted rounded-md w-96" />
          </div>

          <div className="bg-muted h-11 w-36 rounded-2xl" />
        </div>

        <div className="grid grid-cols-12 gap-10 py-10">
          <div className="col-span-12 lg:col-span-4">
            <div className="w-40 h-6 bg-muted rounded-sm" />
            <div className="w-full h-4 mt-3 bg-muted rounded-sm" />
            <div className="w-5/6 h-4 mt-2 bg-muted rounded-sm" />

            <div className="p-5 mt-6 bg-card border border-border rounded-2xl">
              <div className="w-24 h-3 bg-muted rounded-sm" />
              <div className="w-40 h-6 mt-3 bg-muted rounded-sm" />
              <div className="w-full h-4 mt-3 bg-muted rounded-sm" />
            </div>
          </div>

          <div className="col-span-12 space-y-8 lg:col-span-8">
            <div className="px-6 py-5 bg-card border border-border rounded-2xl">
              <div className="w-40 h-3 bg-muted rounded-sm" />
              <div className="h-10 mt-4 bg-muted rounded-sm w-36" />
              <div className="h-4 mt-3 bg-muted rounded-sm w-72" />
            </div>

            <div>
              <div className="w-32 h-4 bg-muted rounded-sm" />

              <div className="w-full h-12 mt-3 bg-card border border-border rounded-2xl" />

              <div className="h-4 mt-3 bg-muted rounded-sm w-72" />
            </div>

            <div className="p-5 bg-card border border-border rounded-2xl">
              <div className="w-32 h-3 bg-muted rounded-sm" />

              <div className="grid gap-3 mt-4 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="px-4 py-3 rounded-xl bg-muted/50"
                  >
                    <div className="w-20 h-4 bg-muted rounded-sm" />
                    <div className="w-24 h-5 mt-3 bg-muted rounded-sm" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-border">
              <div className="h-4 bg-muted rounded-sm w-52" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
