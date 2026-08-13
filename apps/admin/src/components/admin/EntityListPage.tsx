import { Link } from "react-router";
import PlaceholderPage from "../common/PlaceholderPage";

interface Entity {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Pending" | "Inactive";
}

const PLACEHOLDER_ROWS: Entity[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    status: "Active",
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "maria@example.com",
    status: "Pending",
  },
  {
    id: "3",
    name: "James Wilson",
    email: "james@example.com",
    status: "Active",
  },
  {
    id: "4",
    name: "Priya Sharma",
    email: "priya@example.com",
    status: "Inactive",
  },
];

const STATUS_CLASSES: Record<Entity["status"], string> = {
  Active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

interface EntityListPageProps {
  title: string;
  basePath: string;
}

export default function EntityListPage({
  title,
  basePath,
}: EntityListPageProps) {
  return (
    <PlaceholderPage
      title={title}
      description={`Browse and manage all ${title.toLowerCase()}.`}
    >
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {["Name", "Email", "Status", "Actions"].map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {PLACEHOLDER_ROWS.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                  {row.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {row.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Link
                    to={`${basePath}/view-profile/${row.id}`}
                    className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    View Profile →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PlaceholderPage>
  );
}
