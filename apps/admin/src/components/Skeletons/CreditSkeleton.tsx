export default function CreditSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="flex items-end justify-between gap-6 pb-6 border-b border-gray-200 dark:border-slate-800">
          <div className="space-y-3">
            <div className="w-56 h-8 bg-gray-200 rounded-md dark:bg-slate-800" />
            <div className="h-4 bg-gray-100 rounded-md w-96 dark:bg-slate-900" />
          </div>

          <div className="bg-gray-200 h-11 w-36 rounded-2xl dark:bg-slate-800" />
        </div>

        {/* Body */}
        <div className="grid grid-cols-12 gap-10 py-10">
          {/* Left Panel */}
          <div className="col-span-12 lg:col-span-4">
            <div className="w-40 h-6 bg-gray-200 rounded dark:bg-slate-800" />
            <div className="w-full h-4 mt-3 bg-gray-100 rounded dark:bg-slate-900" />
            <div className="w-5/6 h-4 mt-2 bg-gray-100 rounded dark:bg-slate-900" />

            {/* Rule Card */}
            <div className="p-5 mt-6 bg-white border border-gray-200 rounded-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="w-24 h-3 bg-gray-200 rounded dark:bg-slate-800" />
              <div className="w-40 h-6 mt-3 bg-gray-200 rounded dark:bg-slate-800" />
              <div className="w-full h-4 mt-3 bg-gray-100 rounded dark:bg-slate-800" />
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-12 space-y-8 lg:col-span-8">
            {/* Current Pricing */}
            <div className="px-6 py-5 bg-white border border-gray-200 rounded-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="w-40 h-3 bg-gray-200 rounded dark:bg-slate-800" />
              <div className="h-10 mt-4 bg-gray-200 rounded w-36 dark:bg-slate-800" />
              <div className="h-4 mt-3 bg-gray-100 rounded w-72 dark:bg-slate-800" />
            </div>

            {/* Input Section */}
            <div>
              <div className="w-32 h-4 bg-gray-200 rounded dark:bg-slate-800" />

              <div className="w-full h-12 mt-3 bg-white border border-gray-200 rounded-2xl dark:border-slate-800 dark:bg-slate-900" />

              <div className="h-4 mt-3 bg-gray-100 rounded w-72 dark:bg-slate-800" />
            </div>

            {/* Preview Cards */}
            <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="w-32 h-3 bg-gray-200 rounded dark:bg-slate-800" />

              <div className="grid gap-3 mt-4 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800"
                  >
                    <div className="w-20 h-4 bg-gray-200 rounded dark:bg-slate-700" />
                    <div className="w-24 h-5 mt-3 bg-gray-200 rounded dark:bg-slate-700" />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Status */}
            <div className="pt-5 border-t border-gray-200 dark:border-slate-800">
              <div className="h-4 bg-gray-100 rounded w-52 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
