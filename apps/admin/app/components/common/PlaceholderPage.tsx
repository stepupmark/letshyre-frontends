import type { ReactNode } from "react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export default function PlaceholderPage({
  title,
  description,
  children,
}: PlaceholderPageProps) {
  return (
    <div className="p-6">
      <div className="mb-6 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {children ?? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-input bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Content for <span className="font-medium">{title}</span> goes here.
          </p>
        </div>
      )}
    </div>
  );
}
