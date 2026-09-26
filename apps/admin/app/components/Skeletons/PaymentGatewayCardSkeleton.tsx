export default function PaymentGatewayCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-11 shrink-0 rounded-2xl bg-muted" />

          <div className="space-y-2">
            <div className="h-4 w-36 rounded-md bg-muted" />
            <div className="h-3 w-20 rounded-md bg-muted" />
          </div>
        </div>

        <div className="h-7 w-24 rounded-full bg-muted" />
      </div>

      <div className="my-4 h-px bg-muted" />

      {[1, 2].map(() => (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
              <div className="space-y-2">
                <div className="h-3 w-16 rounded-sm bg-muted" />
                <div className="h-4 w-40 rounded-sm bg-muted" />
              </div>

              <div className="h-9 w-9 rounded-xl bg-muted" />
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded-sm bg-muted" />
                <div className="h-4 w-32 rounded-sm bg-muted" />
              </div>

              <div className="flex gap-2">
                <div className="h-9 w-9 rounded-xl bg-muted" />
                <div className="h-9 w-9 rounded-xl bg-muted" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="h-3 w-36 rounded-sm bg-muted" />

            <div className="flex gap-3">
              <div className="h-9 w-24 rounded-2xl bg-muted" />
              <div className="h-9 w-20 rounded-2xl bg-muted" />
            </div>
          </div>
        </>
      ))}
    </div>
  );
}
