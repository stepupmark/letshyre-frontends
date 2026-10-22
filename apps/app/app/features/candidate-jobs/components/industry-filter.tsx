import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { useState } from "react"

import { industriesQuery } from "@/lib/industries"

import type { JobSearch } from "../types"
import { Group, Option } from "./filter-group"

const INDUSTRIES_SHOWN = 6

export function IndustryFilter({
  search,
  onChange,
}: {
  search: JobSearch
  onChange: (change: Partial<JobSearch>) => void
}) {
  const { t } = useTranslation(["candidateJobs", "common"])
  const industries = useQuery(industriesQuery())
  const [expanded, setExpanded] = useState(false)
  const [find, setFind] = useState("")

  const all = industries.data ?? []
  const picked = all.filter((item) => search.industries.includes(item.value))
  const rest = all.filter((item) => !search.industries.includes(item.value))
  const needle = find.trim().toLowerCase()
  const shown = expanded
    ? [...picked, ...rest].filter((item) =>
        item.label.toLowerCase().includes(needle)
      )
    : [...picked, ...rest].slice(0, Math.max(INDUSTRIES_SHOWN, picked.length))

  return (
    <Group title={t("filters.industry")}>
      {industries.isPending ? (
        <div className="flex flex-col gap-2.5 py-1">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-3/4" />
          ))}
        </div>
      ) : industries.isError ? (
        <p className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          {t("common:state.error")}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void industries.refetch()}
          >
            {t("common:state.retry")}
          </Button>
        </p>
      ) : (
        <>
          {expanded && all.length > INDUSTRIES_SHOWN && (
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                aria-label={t("filters.findIndustry")}
                placeholder={t("filters.findIndustry")}
                value={find}
                onChange={(event) => {
                  setFind(event.target.value)
                }}
              />
            </InputGroup>
          )}
          <ul className="max-h-72 overflow-y-auto">
            {shown.map((item) => (
              <li key={item.value}>
                <Option>
                  <Checkbox
                    checked={search.industries.includes(item.value)}
                    onCheckedChange={(checked) => {
                      onChange({
                        industries: checked
                          ? [...search.industries, item.value]
                          : search.industries.filter(
                              (other) => other !== item.value
                            ),
                      })
                    }}
                  />
                  <span className="min-w-0 truncate">{item.label}</span>
                </Option>
              </li>
            ))}
          </ul>
          {expanded && shown.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("filters.noIndustry")}
            </p>
          )}
          {all.length > INDUSTRIES_SHOWN && (
            <Button
              variant="link"
              size="sm"
              className="self-start px-0"
              aria-expanded={expanded}
              onClick={() => {
                setExpanded(!expanded)
                setFind("")
              }}
            >
              {expanded
                ? t("filters.fewerIndustries")
                : t("filters.allIndustries", { total: all.length })}
            </Button>
          )}
        </>
      )}
    </Group>
  )
}
