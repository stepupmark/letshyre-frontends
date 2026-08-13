/**
 * ChartSkeleton.tsx
 *
 * Loading skeleton for donut chart cards.
 * Uses a shimmer gradient animation for a premium feel.
 */

export default function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm overflow-hidden relative">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 dark:via-white/5 to-transparent" />

      {/* Badge + Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="h-4 w-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-full mb-3" />
          <div className="h-5 w-44 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
          <div className="h-3 w-60 bg-gray-100 dark:bg-gray-800 rounded-md" />
        </div>
        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0" />
      </div>

      {/* Donut ring placeholder */}
      <div className="flex items-center justify-center my-4" style={{ height: 200 }}>
        <div className="relative">
          <div className="w-40 h-40 rounded-full bg-gray-100 dark:bg-gray-800" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[72px] h-[72px] rounded-full bg-white dark:bg-gray-900" />
          </div>
          {/* Fake arc segments */}
          <div className="absolute inset-0 rounded-full border-[18px] border-gray-200 dark:border-gray-700 opacity-60" />
        </div>
      </div>

      {/* Legend rows */}
      <div className="space-y-3 mt-2">
        {[80, 65, 55, 45].map((w, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div
                className="h-3 rounded-md bg-gray-100 dark:bg-gray-800"
                style={{ width: `${w}px` }}
              />
            </div>
            <div className="h-3 w-10 rounded-md bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
