export default function PaymentGatewayCardSkeleton() {
  return (
    <div className="p-5 bg-card border border-border shadow-xs animate-pulse rounded-3xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center min-w-0 gap-3">
          <div className="bg-muted size-11 shrink-0 rounded-2xl" />

          <div className="space-y-2">
            <div className="h-4 bg-muted rounded-md w-36" />
            <div className="w-20 h-3 bg-muted rounded-md" />
          </div>
        </div>

        <div className="w-24 bg-muted rounded-full h-7" />
      </div>

      <div className="h-px my-4 bg-muted" />

      {[1, 2].map(() => (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-muted/50">
              <div className="space-y-2">
                <div className="w-16 h-3 bg-muted rounded-sm" />
                <div className="w-40 h-4 bg-muted rounded-sm" />
              </div>

              <div className="bg-muted h-9 w-9 rounded-xl" />
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-muted/50">
              <div className="space-y-2">
                <div className="w-24 h-3 bg-muted rounded-sm" />
                <div className="w-32 h-4 bg-muted rounded-sm" />
              </div>

              <div className="flex gap-2">
                <div className="bg-muted h-9 w-9 rounded-xl" />
                <div className="bg-muted h-9 w-9 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="h-3 bg-muted rounded-sm w-36" />

            <div className="flex gap-3">
              <div className="w-24 bg-muted h-9 rounded-2xl" />
              <div className="w-20 bg-muted h-9 rounded-2xl" />
            </div>
          </div>
        </>
      ))}
    </div>
  );
}
