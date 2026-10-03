import { Award } from "lucide-react";

// Shared by both certifications and accomplishments — both arrive as either
// plain strings or `{ name/title, issuer }` objects.
export function CertificationsList({ items, emptyMessage, fallbackLabel }) {
  if (!items?.length) {
    return <p className="m-0 text-sm text-text-muted">{emptyMessage}</p>;
  }
  return (
    <div className="flex flex-col gap-5">
      {items.map((item, i) => {
        const title = typeof item === "string" ? item : item.name || item.title || fallbackLabel;
        const issuer = typeof item === "object" ? item.issuer : null;
        return (
          <div key={i} className="flex items-start gap-4">
            <span
              className="grid size-11 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-600"
              aria-hidden="true"
            >
              <Award size={20} strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-col">
              <h3 className="m-0 text-base font-bold text-text-main">{title}</h3>
              {issuer && <p className="mt-1 mb-0 text-sm font-medium text-brand-700">{issuer}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CertificationsList;
