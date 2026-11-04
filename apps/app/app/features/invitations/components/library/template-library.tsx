import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { useQuery } from "@tanstack/react-query"
import { Copy, Ellipsis, Send, Trash2 } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useId, useState, type ReactNode } from "react"
import { href, useSearchParams } from "react-router"

import { AppLink } from "@/components/app-link"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { QueryState } from "@/components/query-state"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"
import { useGo } from "@/lib/navigation"

import { useDeleteTemplate } from "../../mutations/use-delete-template"
import { templatesQuery } from "../../queries/templates.queries"
import type { Template } from "../../schemas/template.schema"
import { EnvelopeArt } from "../art/envelope-art"
import { CopyDialog } from "./copy-dialog"
import { LibrarySkeleton } from "./library-skeleton"
import { TemplateCard } from "./template-card"

const TAB = "tab"
const YOURS = "yours"
const LETSHYRE = "letshyre"

export function TemplateLibrary() {
  const { t } = useTranslation("invitations")
  const templates = useQuery(templatesQuery())
  const go = useGo()
  const [copying, setCopying] = useState<Template | null>(null)
  const [deleting, setDeleting] = useState<Template | null>(null)
  const remove = useDeleteTemplate({
    onDeleted: () => {
      setDeleting(null)
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("title")}
        description={t("lead")}
        actions={
          <AppLink
            to={href("/employer/invitations/send")}
            className={buttonLink()}
          >
            <Send className="rtl:-scale-x-100" />
            {t("library.send")}
          </AppLink>
        }
      />

      <QueryState
        query={templates}
        skeleton={<LibrarySkeleton />}
        error={{ title: t("library.errorTitle"), body: t("library.errorBody") }}
      >
        {(list) => (
          <>
            <LibraryTabs
              owned={list.filter((template) => !template.is_system)}
              starters={list.filter((template) => template.is_system)}
              onCopy={setCopying}
              onDelete={setDeleting}
            />
            {copying && (
              <CopyDialog
                source={copying}
                taken={list.map((template) => template.name)}
                onClose={() => {
                  setCopying(null)
                }}
                onCopied={(copy) => {
                  go(
                    href("/employer/invitations/templates/:templateId", {
                      templateId: copy.id,
                    })
                  )
                }}
              />
            )}
          </>
        )}
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

function LibraryTabs({
  owned,
  starters,
  onCopy,
  onDelete,
}: {
  owned: Template[]
  starters: Template[]
  onCopy: (template: Template) => void
  onDelete: (template: Template) => void
}) {
  const { t } = useTranslation("invitations")
  const [params, setParams] = useSearchParams()
  const indicator = useId()
  const asked = params.get(TAB)
  const tab =
    asked === YOURS || asked === LETSHYRE
      ? asked
      : owned.length > 0
        ? YOURS
        : LETSHYRE
  const open = (next: string) => {
    setParams(
      (prev) => {
        const search = new URLSearchParams(prev)
        search.set(TAB, next)
        return search
      },
      { replace: true, preventScrollReset: true }
    )
  }
  const tabs = [
    {
      value: LETSHYRE,
      label: t("library.tabs.letshyre"),
      count: starters.length,
    },
    { value: YOURS, label: t("library.tabs.yours"), count: owned.length },
  ]

  return (
    <Tabs
      value={tab}
      onValueChange={(next) => {
        open(String(next))
      }}
      className="gap-6"
    >
      <TabsList
        variant="line"
        aria-label={t("library.tabs.label")}
        className="h-auto w-full justify-start gap-6 rounded-none border-b p-0"
      >
        {tabs.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="h-auto flex-none cursor-pointer gap-2 px-0 pt-1 pb-3 text-sm after:hidden data-active:text-brand-text"
          >
            {item.label}
            <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground tabular-nums">
              {item.count}
            </span>
            {item.value === tab && (
              <m.span
                layoutId={indicator}
                aria-hidden="true"
                transition={{ duration: duration.base, ease }}
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand"
              />
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={YOURS}>
        <Panel>
          {owned.length === 0 ? (
            <EmptyState
              art={<EnvelopeArt />}
              title={t("library.emptyTitle")}
              description={t("library.emptyBody")}
              action={
                <Button
                  onClick={() => {
                    open(LETSHYRE)
                  }}
                >
                  {t("library.emptyAction")}
                </Button>
              }
            />
          ) : (
            <CardGrid>
              {owned.map((template) => (
                <CardItem key={template.id}>
                  <TemplateCard
                    template={template}
                    menu={
                      <CardMenu name={template.name}>
                        <DropdownMenuItem
                          onClick={() => {
                            onCopy(template)
                          }}
                        >
                          <Copy />
                          {t("library.copy")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            onDelete(template)
                          }}
                        >
                          <Trash2 />
                          {t("library.delete")}
                        </DropdownMenuItem>
                      </CardMenu>
                    }
                  />
                </CardItem>
              ))}
            </CardGrid>
          )}
        </Panel>
      </TabsContent>

      <TabsContent value={LETSHYRE}>
        <Panel>
          <p className="mb-4 text-sm text-pretty text-muted-foreground">
            {t("library.startersLead")}
          </p>
          <CardGrid>
            {starters.map((template) => (
              <CardItem key={template.id}>
                <TemplateCard
                  template={template}
                  secondary={
                    <Button
                      variant="outline"
                      onClick={() => {
                        onCopy(template)
                      }}
                    >
                      <Copy />
                      {t("library.copy")}
                    </Button>
                  }
                />
              </CardItem>
            ))}
          </CardGrid>
        </Panel>
      </TabsContent>
    </Tabs>
  )
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease }}
    >
      {children}
    </m.div>
  )
}

function CardGrid({ children }: { children: ReactNode }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

function CardMenu({ name, children }: { name: string; children: ReactNode }) {
  const { t } = useTranslation("invitations")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="-me-2 -mt-1 text-muted-foreground max-md:size-10"
            aria-label={t("library.actions", { name })}
          />
        }
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}
