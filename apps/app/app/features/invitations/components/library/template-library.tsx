import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useQuery } from "@tanstack/react-query"
import { Copy, Ellipsis, Trash2 } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useId, useState, type ReactNode } from "react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { QueryState } from "@/components/query-state"
import { duration, ease } from "@/lib/motion"

import { useDeleteTemplate } from "../../mutations/use-delete-template"
import { templatesQuery } from "../../queries/templates.queries"
import type { Template } from "../../schemas/template.schema"
import { EnvelopeArt } from "../art/envelope-art"
import { CopyDialog } from "./copy-dialog"
import { LibrarySkeleton } from "./library-skeleton"
import { TemplateCard } from "./template-card"

export function TemplateLibrary() {
  const { t } = useTranslation("invitations")
  const templates = useQuery(templatesQuery())
  const [copying, setCopying] = useState<Template | null>(null)
  const [deleting, setDeleting] = useState<Template | null>(null)
  const remove = useDeleteTemplate({
    onDeleted: () => {
      setDeleting(null)
    },
  })

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("title")} description={t("lead")} />

      <QueryState
        query={templates}
        skeleton={<LibrarySkeleton />}
        error={{ title: t("library.errorTitle"), body: t("library.errorBody") }}
      >
        {(list) => {
          const owned = list.filter((template) => !template.is_system)
          const starters = list.filter((template) => template.is_system)
          const copyAction = (template: Template) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCopying(template)
              }}
            >
              <Copy />
              {t("library.copy")}
            </Button>
          )
          return (
            <>
              <Section title={t("library.ownedTitle")} count={owned.length}>
                {owned.length === 0 ? (
                  <EmptyState
                    art={<EnvelopeArt />}
                    title={t("library.emptyTitle")}
                    description={t("library.emptyBody")}
                    action={
                      starters[0] && (
                        <Button
                          onClick={() => {
                            if (starters[0]) setCopying(starters[0])
                          }}
                        >
                          <Copy />
                          {t("library.emptyAction")}
                        </Button>
                      )
                    }
                  />
                ) : (
                  <CardGrid>
                    {owned.map((template) => (
                      <CardItem key={template.id}>
                        <TemplateCard
                          template={template}
                          menu={
                            <OwnedMenu
                              name={template.name}
                              onDelete={() => {
                                setDeleting(template)
                              }}
                            />
                          }
                        >
                          {copyAction(template)}
                        </TemplateCard>
                      </CardItem>
                    ))}
                  </CardGrid>
                )}
              </Section>

              {starters.length > 0 && (
                <Section
                  title={t("library.startersTitle")}
                  lead={t("library.startersLead")}
                  count={starters.length}
                >
                  <CardGrid>
                    {starters.map((template) => (
                      <CardItem key={template.id}>
                        <TemplateCard template={template}>
                          {copyAction(template)}
                        </TemplateCard>
                      </CardItem>
                    ))}
                  </CardGrid>
                </Section>
              )}

              {copying && (
                <CopyDialog
                  source={copying}
                  taken={list.map((template) => template.name)}
                  onClose={() => {
                    setCopying(null)
                  }}
                />
              )}
            </>
          )
        }}
      </QueryState>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title={t("delete.title", { name: deleting?.name ?? "" })}
        description={t("delete.body")}
        confirmLabel={t("delete.confirm")}
        destructive
        pending={remove.isPending}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting)
        }}
      />
    </div>
  )
}

function Section({
  title,
  lead,
  count,
  children,
}: {
  title: string
  lead?: string
  count: number
  children: ReactNode
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div>
        <h2
          id={id}
          className="flex items-baseline gap-2 text-base font-semibold"
        >
          {title}
          {count > 0 && (
            <span className="text-sm font-normal text-muted-foreground tabular-nums">
              {count}
            </span>
          )}
        </h2>
        {lead && (
          <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
            {lead}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

function CardGrid({ children }: { children: ReactNode }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </ul>
  )
}

function CardItem({ children }: { children: ReactNode }) {
  return (
    <m.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: duration.base, ease }}
    >
      {children}
    </m.li>
  )
}

function OwnedMenu({ name, onDelete }: { name: string; onDelete: () => void }) {
  const { t } = useTranslation("invitations")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="-me-2 -mt-1 max-md:size-11"
            aria-label={t("library.actions", { name })}
          />
        }
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 />
          {t("library.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
