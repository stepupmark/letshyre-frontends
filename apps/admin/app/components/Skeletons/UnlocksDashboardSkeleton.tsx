export default function UnlocksDashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-8 w-40 rounded-md bg-muted" />
        </div>

        <div className="h-4 w-80 rounded-md bg-muted" />
      </div>

      <div className="mt-6">
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-muted" />

                <div className="h-6 w-16 rounded-full bg-muted" />
              </div>

              <div className="space-y-3">
                <div className="h-8 w-24 rounded-md bg-muted" />

                <div className="h-4 w-36 rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-4">
          <div className="xl:col-span-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="mb-6 flex items-center justify-between">
                <div className="space-y-3">
                  <div className="h-6 w-52 rounded-md bg-muted" />
                  <div className="h-4 w-72 rounded-md bg-muted" />
                </div>

                <div className="h-10 w-28 rounded-xl bg-muted" />
              </div>

              <div className="flex h-[320px] items-end gap-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-1 flex-col justify-end gap-2"
                  >
                    <div
                      className="rounded-t-xl bg-muted"
                      style={{
                        height: `${80 + (index % 5) * 30}px`,
                      }}
                    />
                    <div className="mx-auto h-3 w-8 rounded-sm bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="mb-6 space-y-3">
                <div className="h-6 w-36 rounded-md bg-muted" />
                <div className="h-4 w-28 rounded-md bg-muted" />
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-4 h-20 w-20 rounded-full bg-muted" />

                <div className="mb-3 h-5 w-32 rounded-md bg-muted" />

                <div className="mb-6 h-4 w-24 rounded-md bg-muted" />

                <div className="w-full space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-xl bg-muted p-4">
                      <div className="mb-2 h-4 w-20 rounded-sm bg-muted" />

                      <div className="h-6 w-16 rounded-sm bg-muted" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex flex-col gap-4 border-b border-border p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="h-6 w-44 rounded-md bg-muted" />
              <div className="h-4 w-72 rounded-md bg-muted" />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-64 rounded-xl bg-muted" />
              <div className="h-10 w-24 rounded-xl bg-muted" />
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="grid grid-cols-6 gap-4 border-b border-border px-6 py-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-4 rounded-sm bg-muted" />
              ))}
            </div>

            {Array.from({ length: 7 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-6 gap-4 border-b border-border px-6 py-5"
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
            <div className="h-4 w-40 rounded-sm bg-muted" />

            <div className="flex items-center gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 w-10 rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
