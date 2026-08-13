interface LogsTableSkeletonProps {
  columns: number;
}

export default function LogsTableSkeleton({ columns }: LogsTableSkeletonProps) {
  return (
    <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-slate-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-800/50 dark:text-slate-300">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse dark:bg-slate-700" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 dark:hover:bg-slate-800/50"
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div
                      className={`h-4 animate-pulse rounded bg-gray-100 dark:bg-slate-800 ${
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
