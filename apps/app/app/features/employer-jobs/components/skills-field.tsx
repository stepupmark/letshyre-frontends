import { useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import { X } from "lucide-react"
import { useState, type Ref } from "react"

/** Skills as chips: Enter, comma or paste adds; Backspace on empty removes the last. */
export function SkillsField({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
  ref,
}: {
  id: string
  value: string[]
  onChange: (skills: string[]) => void
  onBlur: () => void
  invalid: boolean
  describedBy?: string
  ref?: Ref<HTMLInputElement>
}) {
  const { t } = useTranslation("jobs")
  const [draft, setDraft] = useState("")

  const add = (text: string) => {
    const next = [...value]
    for (const skill of text.split(/[,\n]/).map((s) => s.trim())) {
      if (skill && !next.some((s) => s.toLowerCase() === skill.toLowerCase()))
        next.push(skill)
    }
    if (next.length !== value.length) onChange(next)
    setDraft("")
  }

  return (
    <div
      data-invalid={invalid || undefined}
      className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 data-invalid:border-destructive data-invalid:ring-destructive/20 dark:bg-input/30"
    >
      {value.map((skill) => (
        <Badge key={skill} variant="secondary" className="gap-1 pe-1">
          {skill}
          <button
            type="button"
            aria-label={t("form.removeSkill", { skill })}
            className="rounded-sm p-0.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              onChange(value.filter((s) => s !== skill))
            }}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        id={id}
        ref={ref}
        value={draft}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className="min-w-24 flex-1 bg-transparent px-1 outline-none placeholder:text-muted-foreground"
        onChange={(event) => {
          const text = event.target.value
          if (/[,\n]/.test(text)) add(text)
          else setDraft(text)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            add(draft)
          } else if (event.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={() => {
          add(draft)
          onBlur()
        }}
      />
    </div>
  )
}
