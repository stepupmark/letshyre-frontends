export default function UnlocksDashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-40 h-8 bg-muted rounded-md" />
        </div>

        <div className="h-4 bg-muted rounded-md w-80" />
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="p-5 bg-card border border-border shadow-xs rounded-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 bg-muted rounded-xl" />

                <div className="w-16 h-6 bg-muted rounded-full" />
              </div>

              <div className="space-y-3">
                <div className="w-24 h-8 bg-muted rounded-md" />

                <div className="h-4 bg-muted rounded-md w-36" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8 xl:grid-cols-4">
          <div className="xl:col-span-3">
            <div className="p-6 bg-card border border-border shadow-xs rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded-md w-52" />
                  <div className="h-4 bg-muted rounded-md w-72" />
                </div>

                <div className="h-10 bg-muted w-28 rounded-xl" />
              </div>

              <div className="flex h-[320px] items-end gap-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col justify-end flex-1 gap-2"
                  >
                    <div
                      className="bg-muted rounded-t-xl"
                      style={{
                        height: `${80 + (index % 5) * 30}px`,
                      }}
                    />
                    <div className="w-8 h-3 mx-auto bg-muted rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="p-6 bg-card border border-border shadow-xs rounded-2xl">
              <div className="mb-6 space-y-3">
                <div className="h-6 bg-muted rounded-md w-36" />
                <div className="h-4 bg-muted rounded-md w-28" />
              </div>

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 mb-4 bg-muted rounded-full" />

                <div className="w-32 h-5 mb-3 bg-muted rounded-md" />

                <div className="w-24 h-4 mb-6 bg-muted rounded-md" />

                <div className="w-full space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="p-4 bg-muted rounded-xl"
                    >
                      <div className="w-20 h-4 mb-2 bg-muted rounded-sm" />

                      <div className="w-16 h-6 bg-muted rounded-sm" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border shadow-xs rounded-2xl">
          <div className="flex flex-col gap-4 p-6 border-b border-border md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="h-6 bg-muted rounded-md w-44" />
              <div className="h-4 bg-muted rounded-md w-72" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-64 h-10 bg-muted rounded-xl" />
              <div className="w-24 h-10 bg-muted rounded-xl" />
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-border">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-4 bg-muted rounded-sm"
                />
              ))}
            </div>

            {Array.from({ length: 7 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-6 gap-4 px-6 py-5 border-b border-border"
              >
                {Array.from({ length: 6 }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className={`h-4 rounded bg-muted ${
                      colIndex === 0 ? "w-32" : colIndex === 1 ? "w-40" : "w-24"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-6">
            <div className="w-40 h-4 bg-muted rounded-sm" />

            <div className="flex items-center gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="w-10 h-10 bg-muted rounded-xl"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
