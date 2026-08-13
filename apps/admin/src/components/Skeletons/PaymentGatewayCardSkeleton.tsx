export default function PaymentGatewayCardSkeleton() {
  return (
    <div className="p-5 bg-white border border-gray-200 shadow-sm animate-pulse rounded-3xl dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center min-w-0 gap-3">
          {/* Avatar */}
          <div className="bg-gray-200 size-11 shrink-0 rounded-2xl dark:bg-slate-800" />

          {/* Title */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded-md w-36 dark:bg-slate-800" />
            <div className="w-20 h-3 bg-gray-100 rounded-md dark:bg-slate-700" />
          </div>
        </div>

        {/* Status */}
        <div className="w-24 bg-gray-200 rounded-full h-7 dark:bg-slate-800" />
      </div>

      {/* Divider */}
      <div className="h-px my-4 bg-gray-100 dark:bg-slate-800" />

      {/* Credentials */}
      {[1, 2].map(() => (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80">
              <div className="space-y-2">
                <div className="w-16 h-3 bg-gray-200 rounded dark:bg-slate-700" />
                <div className="w-40 h-4 bg-gray-200 rounded dark:bg-slate-700" />
              </div>

              <div className="bg-gray-200 h-9 w-9 rounded-xl dark:bg-slate-700" />
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80">
              <div className="space-y-2">
                <div className="w-24 h-3 bg-gray-200 rounded dark:bg-slate-700" />
                <div className="w-32 h-4 bg-gray-200 rounded dark:bg-slate-700" />
              </div>

              <div className="flex gap-2">
                <div className="bg-gray-200 h-9 w-9 rounded-xl dark:bg-slate-700" />
                <div className="bg-gray-200 h-9 w-9 rounded-xl dark:bg-slate-700" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="h-3 bg-gray-200 rounded w-36 dark:bg-slate-700" />

            <div className="flex gap-3">
              <div className="w-24 bg-gray-200 h-9 rounded-2xl dark:bg-slate-700" />
              <div className="w-20 bg-gray-200 h-9 rounded-2xl dark:bg-slate-700" />
            </div>
          </div>
        </>
      ))}
    </div>
  );
}
