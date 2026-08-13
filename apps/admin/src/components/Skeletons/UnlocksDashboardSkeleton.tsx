export default function UnlocksDashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-40 h-8 bg-gray-200 rounded-md dark:bg-gray-800" />
        </div>

        <div className="h-4 bg-gray-200 rounded-md w-80 dark:bg-gray-800" />
      </div>

      <div className="mt-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="p-5 bg-white border border-gray-200 shadow-sm rounded-2xl dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-800" />

                <div className="w-16 h-6 bg-gray-200 rounded-full dark:bg-gray-800" />
              </div>

              <div className="space-y-3">
                <div className="w-24 h-8 bg-gray-200 rounded-md dark:bg-gray-800" />

                <div className="h-4 bg-gray-200 rounded-md w-36 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>

        {/* Analytics + Top Performer */}
        <div className="grid grid-cols-1 gap-6 mb-8 xl:grid-cols-4">
          {/* Engagement Insights */}
          <div className="xl:col-span-3">
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded-md w-52 dark:bg-gray-800" />
                  <div className="h-4 bg-gray-200 rounded-md w-72 dark:bg-gray-800" />
                </div>

                <div className="h-10 bg-gray-200 w-28 rounded-xl dark:bg-gray-800" />
              </div>

              <div className="flex h-[320px] items-end gap-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col justify-end flex-1 gap-2"
                  >
                    <div
                      className="bg-gray-200 rounded-t-xl dark:bg-gray-800"
                      style={{
                        height: `${80 + (index % 5) * 30}px`,
                      }}
                    />
                    <div className="w-8 h-3 mx-auto bg-gray-200 rounded dark:bg-gray-800" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performer */}
          <div className="xl:col-span-1">
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded-md w-36 dark:bg-gray-800" />
                <div className="h-4 bg-gray-200 rounded-md w-28 dark:bg-gray-800" />
              </div>

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 mb-4 bg-gray-200 rounded-full dark:bg-gray-800" />

                <div className="w-32 h-5 mb-3 bg-gray-200 rounded-md dark:bg-gray-800" />

                <div className="w-24 h-4 mb-6 bg-gray-200 rounded-md dark:bg-gray-800" />

                <div className="w-full space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-100 rounded-xl dark:bg-gray-800/50"
                    >
                      <div className="w-20 h-4 mb-2 bg-gray-200 rounded dark:bg-gray-700" />

                      <div className="w-16 h-6 bg-gray-200 rounded dark:bg-gray-700" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl dark:border-gray-800 dark:bg-gray-900">
          {/* Table Header */}
          <div className="flex flex-col gap-4 p-6 border-b border-gray-100 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded-md w-44 dark:bg-gray-800" />
              <div className="h-4 bg-gray-200 rounded-md w-72 dark:bg-gray-800" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-64 h-10 bg-gray-200 rounded-xl dark:bg-gray-800" />
              <div className="w-24 h-10 bg-gray-200 rounded-xl dark:bg-gray-800" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden">
            {/* Table Head */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-4 bg-gray-200 rounded dark:bg-gray-800"
                />
              ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: 7 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-6 gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-800"
              >
                {Array.from({ length: 6 }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className={`h-4 rounded bg-gray-200 dark:bg-gray-800 ${
                      colIndex === 0 ? "w-32" : colIndex === 1 ? "w-40" : "w-24"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-6">
            <div className="w-40 h-4 bg-gray-200 rounded dark:bg-gray-800" />

            <div className="flex items-center gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="w-10 h-10 bg-gray-200 rounded-xl dark:bg-gray-800"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
