import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

export function SkillsList({ skills }) {
  const { t } = useTranslation("sharedScorecard");
  if (!skills?.length) {
    return <p className="m-0 text-sm text-text-muted">{t("profile.empty.skills")}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, i) => (
        <Badge
          key={i}
          className="rounded-full border-transparent bg-brand-100 px-3 py-1.5 text-xs font-medium text-brand-700"
        >
          {skill}
        </Badge>
      ))}
    </div>
  );
}

export default SkillsList;
