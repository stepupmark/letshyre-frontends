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
  onChange: (edit: (current: string[]) => string[]) => void
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
          const lower = (list: string[]) => list.map((s) => s.toLowerCase())
          const added = next.filter(
            (s) => !lower(skills).includes(s.toLowerCase())
          )
          const removed = lower(skills).filter((s) => !lower(next).includes(s))
          onChange((current) =>
            cleanSkills([
              ...current.filter((s) => !removed.includes(s.toLowerCase())),
              ...added,
            ])
          )
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
