import { useTranslation } from "@workspace/i18n/react"
import { Label } from "@workspace/ui/components/label"
import { useId } from "react"

import { SkillsInput } from "@/components/skills-input"

import { cleanSkills } from "../../../lib/filters"

export function SkillsFields({
  skills,
  onChange,
}: {
  skills: string[]
  onChange: (skills: string[]) => void
}) {
  const { t } = useTranslation("unlock")
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{t("filters.skillsLabel")}</Label>
      <SkillsInput
        id={id}
        value={skills}
        placeholder={t("filters.skillsPlaceholder")}
        describedBy={`${id}-hint`}
        onChange={(next) => {
          onChange(cleanSkills(next))
        }}
      />
      <p
        id={`${id}-hint`}
        className="text-xs text-pretty text-muted-foreground"
      >
        {t("filters.skillsHint")}
      </p>
    </div>
  )
}
