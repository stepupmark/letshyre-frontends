/**
 * PlaceholderPage.tsx
 *
 * Reusable placeholder used by every admin page that hasn't been
 * implemented yet. Keeps individual page files minimal.
 */

import type { ReactNode } from "react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
  /** Optional extra content (tables, links, etc.) */
  children?: ReactNode;
}

export default function PlaceholderPage({
  title,
  description,
  children,
}: PlaceholderPageProps) {
  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-700">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      {/* Page body */}
      {children ?? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Content for <span className="font-medium">{title}</span> goes here.
          </p>
        </div>
      )}
    </div>
  );
}
