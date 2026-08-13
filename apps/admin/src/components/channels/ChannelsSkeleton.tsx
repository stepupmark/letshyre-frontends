export default function ChannelsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-56 bg-gray-200 h-7 rounded-xl dark:bg-slate-700" />
          <div className="h-4 bg-gray-200 rounded-lg w-80 dark:bg-slate-700" />
        </div>
        <div className="bg-gray-200 h-9 w-44 rounded-2xl dark:bg-slate-700" />
      </div>

      {/* Summary banner skeleton */}
      <div className="w-full h-20 bg-gray-200 rounded-2xl dark:bg-slate-700" />

      {/* Channel cards grid skeleton */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-5 p-6 bg-white border border-gray-200 rounded-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Icon + pill */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl dark:bg-slate-700" />
              <div className="w-16 h-6 bg-gray-200 rounded-full dark:bg-slate-700" />
            </div>
            {/* Label + desc */}
            <div className="space-y-2">
              <div className="w-32 h-4 bg-gray-200 rounded-lg dark:bg-slate-700" />
              <div className="w-full h-3 bg-gray-200 rounded dark:bg-slate-700" />
              <div className="w-3/4 h-3 bg-gray-200 rounded dark:bg-slate-700" />
            </div>
            {/* Divider */}
            <div className="h-px bg-gray-100 dark:bg-slate-800" />
            {/* Toggle row */}
            <div className="flex items-center justify-between">
              <div className="w-40 h-3 bg-gray-200 rounded dark:bg-slate-700" />
              <div className="w-12 bg-gray-200 rounded-full h-7 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
