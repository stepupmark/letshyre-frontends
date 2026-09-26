interface LogsTableSkeletonProps {
  columns: number;
}

export default function LogsTableSkeleton({ columns }: LogsTableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="bg-muted/50 text-xs text-foreground uppercase">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 w-24 animate-pulse rounded-sm bg-muted" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-accent">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div
                      className={`h-4 animate-pulse rounded bg-muted ${
                        colIndex === 0
                          ? "w-32"
                          : colIndex === columns - 1
                            ? "w-16"
                            : "w-24"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
