import { useTranslation } from "react-i18next";
import { FolderGit2 } from "lucide-react";

export function ProjectsList({ items }) {
  const { t } = useTranslation("sharedScorecard");
  if (!items?.length) {
    return <p className="m-0 text-sm text-text-muted">{t("profile.empty.projects")}</p>;
  }
  return (
    <div className="flex flex-col gap-5">
      {items.map((proj, i) => (
        <div key={i} className="flex items-start gap-4">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-600"
            aria-hidden="true"
          >
            <FolderGit2 size={20} strokeWidth={2} />
          </span>
          <div className="flex min-w-0 flex-col">
            <h3 className="m-0 text-base font-bold text-text-main">
              {proj.title || proj.name || t("profile.untitledProject")}
            </h3>
            {proj.description && (
              <p className="mt-2 mb-0 max-w-prose text-sm leading-relaxed text-text-body">{proj.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProjectsList;
