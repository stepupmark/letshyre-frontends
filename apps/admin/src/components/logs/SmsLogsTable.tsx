import { useState } from "react";

import { useSmsLogs } from "../../hooks/useLogs";
import LogsStatusBadge from "./LogsStatusBadge";
import LogsVerifiedBadge from "./LogsVerifiedBadge";
import LogsTableSkeleton from "./LogsTableSkeleton";
import PaginationControls from "./PaginationControls";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${month} ${day}, ${year} • ${hours}:${minutes} ${ampm}`;
};

export default function SmsLogsTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isPlaceholderData } = useSmsLogs(page);

  if (isLoading) return <LogsTableSkeleton columns={4} />;
  if (isError) {
    return (
      <div className="p-6 text-center text-red-600 border border-red-200 rounded-2xl bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
        Failed to load SMS logs. Please try again later.
      </div>
    );
  }

  const logs = data?.results || [];

  return (
    <div className="flex flex-col overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-slate-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-800/50 dark:text-slate-300">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">
                Phone Number
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                Status
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                Verified
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                Sent At
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No SMS logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {log.phone_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <LogsStatusBadge status={log.otp_status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <LogsVerifiedBadge verified={log.is_verified} />
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap dark:text-slate-400">
                    {formatDate(log.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={data?.current_page || 1}
        totalPages={data?.total_pages || 1}
        onPageChange={setPage}
        isPlaceholderData={isPlaceholderData}
      />
    </div>
  );
}
