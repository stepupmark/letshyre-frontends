import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import { Check, Search } from "lucide-react"
import * as m from "motion/react-m"
import { useId, useState, type ReactNode } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { StatusBadge } from "@/components/status-badge"
import { duration, ease } from "@/lib/motion"

import { sendBlock } from "../../lib/sendable"
import type { Template } from "../../schemas/template.schema"
import { TokenText } from "../shared/field-token"

const SEARCH_FROM = 7

export function TemplateStep({
  templates,
  value,
  error,
  onChange,
}: {
  templates: Template[]
  value: string | null
  error?: string
  onChange: (id: string) => void
}) {
  const { t } = useTranslation("invitations")
  const errorId = useId()
  const selection = useId()
  const [query, setQuery] = useState("")
  const needle = query.trim().toLocaleLowerCase()
  const matches = (template: Template) =>
    !needle ||
    template.name.toLocaleLowerCase().includes(needle) ||
    template.subject_template.toLocaleLowerCase().includes(needle)
  const shown = templates.filter(matches)
  const groups = [
    {
      key: "yours",
      title: t("library.tabs.yours"),
      items: shown.filter((template) => !template.is_system),
    },
    {
      key: "letshyre",
      title: t("library.tabs.letshyre"),
      items: shown.filter((template) => template.is_system),
    },
  ].filter((group) => group.items.length > 0)

  return (
    <div className="flex flex-col gap-5">
      {templates.length >= SEARCH_FROM && (
        <InputGroup className="max-w-sm max-md:h-11">
          <InputGroupAddon>
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            aria-label={t("send.search")}
            placeholder={t("send.search")}
            onChange={(event) => {
              setQuery(event.target.value)
            }}
          />
        </InputGroup>
      )}

      <RadioGroup
        aria-label={t("send.templateLabel")}
        aria-describedby={error ? errorId : undefined}
        value={value ?? ""}
        onValueChange={(next) => {
          onChange(String(next))
        }}
        className="flex flex-col gap-6"
      >
        {groups.map((group) => (
          <TemplateGroup key={group.key} title={group.title}>
            {group.items.map((template) => (
              <TemplateOption
                key={template.id}
                template={template}
                selected={template.id === value}
                selection={selection}
              />
            ))}
          </TemplateGroup>
        ))}
      </RadioGroup>

      {groups.length === 0 && (
        <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
          {t("send.noMatch", { query: query.trim() })}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

function TemplateGroup({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const id = useId()
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-2">
      <h3 id={id} className="text-xs font-medium text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function TemplateOption({
  template,
  selected,
  selection,
}: {
  template: Template
  selected: boolean
  selection: string
}) {
  const { t } = useTranslation("invitations")
  const locale = useLocale()
  const reasonId = useId()
  const block = sendBlock(template)
  const edited = template.updated_at
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        new Date(template.updated_at)
      )
    : null

  return (
    <label
      data-blocked={Boolean(block)}
      className="group relative flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 data-[blocked=true]:cursor-default data-[blocked=true]:bg-muted/30"
    >
      {selected && (
        <m.span
          layoutId={selection}
          aria-hidden="true"
          transition={{ duration: duration.base, ease }}
          className="pointer-events-none absolute -inset-px rounded-lg border-2 border-brand"
        />
      )}
      <RadioGroupItem
        value={template.id}
        disabled={Boolean(block)}
        aria-describedby={block ? reasonId : undefined}
        className="sr-only absolute"
      />
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border bg-background transition-colors group-has-data-checked:border-brand group-has-data-checked:bg-brand group-has-data-checked:text-background group-data-[blocked=true]:opacity-40"
      >
        <Check
          className="size-3 scale-0 transition-transform duration-200 group-has-data-checked:scale-100 motion-reduce:transition-none"
          strokeWidth={3}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="min-w-0 truncate font-medium group-data-[blocked=true]:text-muted-foreground">
            {template.name}
          </span>
          {template.is_system && (
            <StatusBadge tone="neutral">{t("library.starter")}</StatusBadge>
          )}
          {template.is_active === false && (
            <StatusBadge tone="neutral">{t("library.inactive")}</StatusBadge>
          )}
        </span>
        <span className="line-clamp-2 text-sm text-pretty text-muted-foreground">
          <TokenText text={template.subject_template} />
        </span>
        {block ? (
          <span id={reasonId} className="text-xs text-pretty text-danger">
            {t(`send.blocked.${block}`)}{" "}
            <AppLink
              to={href("/employer/invitations/templates/:templateId", {
                templateId: template.id,
              })}
              className="font-medium text-foreground underline underline-offset-2"
            >
              {t("send.blocked.open")}
            </AppLink>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {template.is_system
              ? t("library.byLetshyre")
              : edited && t("library.editedOn", { date: edited })}
          </span>
        )}
      </span>
    </label>
  )
}
