import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"

import { Avatar } from "@/components/art/avatar"
import { Band } from "@/components/band"
import { BandHeading } from "@/components/band-heading"

// one row per criterion, one column per sample candidate
const SCORES = [
  [84, 78, 81],
  [92, 85, 88],
  [82, 74, 86],
  [79, 83, 77],
  [88, 90, 72],
]

export function CompareDemo() {
  const { t } = useTranslation("employers")
  const rows = t("compare.rows", { returnObjects: true })
  const people = t("compare.people", { returnObjects: true })

  return (
    <Band
      id="compare"
      muted
      className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-center lg:gap-16"
    >
      <BandHeading
        id="compare-title"
        className="slide-in"
        eyebrow={t("compare.eyebrow")}
        title={t("compare.title")}
        accent={t("compare.accent")}
        description={t("compare.description")}
      />

      <figure className="reveal min-w-0">
        <div className="overflow-x-auto rounded-3xl border bg-card">
          <table className="w-full min-w-md text-sm">
            <thead>
              <tr className="border-b">
                <th
                  scope="col"
                  className="p-4 text-start text-xs font-medium text-muted-foreground"
                >
                  {t("compare.criteria")}
                </th>
                {people.map((name) => (
                  <th
                    key={name}
                    scope="col"
                    className="p-4 text-start font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <Avatar name={name} className="size-7 text-xs" />
                      <span className="truncate">{name}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => {
                const values = SCORES[r] ?? []
                const top = Math.max(...values)
                return (
                  <tr key={row} className="border-b last:border-b-0">
                    <th
                      scope="row"
                      className="p-4 text-start font-normal text-muted-foreground"
                    >
                      {row}
                    </th>
                    {values.map((value, c) => {
                      const lead = value === top
                      return (
                        <td key={people[c]} className="p-2">
                          <span
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-2 py-1.5 tabular-nums",
                              lead &&
                                "pop-in bg-brand-muted font-semibold text-brand-text"
                            )}
                          >
                            {value}
                            {lead && (
                              <span className="sr-only">
                                , {t("compare.highest")}
                              </span>
                            )}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <figcaption className="mt-4 text-center text-xs text-muted-foreground">
          {t("compare.caption")}
        </figcaption>
      </figure>
    </Band>
  )
}
