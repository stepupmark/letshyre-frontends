export default function JobDetailSkeleton() {
  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-slate-950 animate-pulse">
      <div className="mx-auto space-y-6 max-w-7xl">
        {/* Top Breadcrumb */}
        <div className="h-5 bg-gray-200 rounded w-52 dark:bg-slate-800" />

        {/* Hero Card */}
        <div className="p-8 bg-white border border-gray-200 rounded-3xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5">
            {/* Title + Status */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-[520px] rounded-lg bg-gray-200 dark:bg-slate-800" />
              <div className="w-20 h-8 bg-gray-200 rounded-full dark:bg-slate-800" />
            </div>

            {/* Meta Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="w-64 bg-gray-100 h-11 rounded-xl dark:bg-slate-800" />
              <div className="w-48 bg-gray-100 h-11 rounded-xl dark:bg-slate-800" />
              <div className="bg-gray-100 h-11 w-52 rounded-xl dark:bg-slate-800" />
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* About Role */}
            <div className="p-8 bg-white border border-gray-200 rounded-3xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 h-11 w-11 rounded-2xl dark:bg-slate-800" />
                <div className="h-8 bg-gray-200 rounded w-52 dark:bg-slate-800" />
              </div>

              <div className="mt-6 space-y-3">
                <div className="w-full h-4 bg-gray-100 rounded dark:bg-slate-800" />
                <div className="w-11/12 h-4 bg-gray-100 rounded dark:bg-slate-800" />
                <div className="w-8/12 h-4 bg-gray-100 rounded dark:bg-slate-800" />
              </div>
            </div>

            {/* Responsibilities */}
            <div className="p-8 bg-white border border-gray-200 rounded-3xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 h-11 w-11 rounded-2xl dark:bg-slate-800" />
                <div className="w-64 h-8 bg-gray-200 rounded dark:bg-slate-800" />
              </div>

              <div className="mt-6 space-y-5">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="bg-gray-100 rounded-full h-7 w-7 dark:bg-slate-800" />
                    <div className="w-full h-4 bg-gray-100 rounded dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="p-8 bg-white border border-gray-200 rounded-3xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 h-11 w-11 rounded-2xl dark:bg-slate-800" />
              <div className="h-8 bg-gray-200 rounded w-44 dark:bg-slate-800" />
            </div>

            <div className="mt-8 space-y-7">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl dark:bg-slate-800" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-28 dark:bg-slate-800" />
                    <div className="w-32 h-5 bg-gray-200 rounded dark:bg-slate-700" />
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
