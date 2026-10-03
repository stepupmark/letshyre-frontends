import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2, Briefcase } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CopyLinkButton } from "@/features/employer/components/scorecard-sharing/CopyLinkButton";
import { SharedLinkStatusBadge } from "@/features/employer/components/scorecard-sharing/SharedLinkStatusBadge";
import { EditShareLinkDialog } from "@/features/employer/components/scorecard-sharing/EditShareLinkDialog";
import { DeleteShareLinkDialog } from "@/features/employer/components/scorecard-sharing/DeleteShareLinkDialog";
import { formatDate } from "@/features/employer/components/view-jobs/jobFormat";
import { cn } from "@/lib/utils";
import { useAppLocale } from "@/i18n/appLocale";
import { buildShareUrl } from "@/lib/shareUrl";

// Matches the Invoice table's header/cell padding so the two tables in the
// employer app read as one system rather than two different densities.
const TH = "h-auto border-b border-border-soft px-5 py-3 text-start text-xs font-bold tracking-wider whitespace-nowrap text-text-muted uppercase";
const TD = "px-5 py-4 align-middle text-sm whitespace-normal";

// A row's row-actions, shared verbatim between the desktop table cell and the
// mobile card footer so edit/delete stay wired identically either layout.
function RowActions({ link, t, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <CopyLinkButton url={buildShareUrl(link)} variant="ghost" iconOnly />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onEdit(link)}
        aria-label={t("list.edit")}
      >
        <Pencil size={14} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-danger hover:bg-danger-bg hover:text-danger"
        onClick={() => onDelete(link)}
        aria-label={t("list.delete")}
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}

export function SharedLinksTable({ links }) {
  const { t } = useTranslation("sharedLinks");
  const { locale } = useAppLocale();
  const [linkToEdit, setLinkToEdit] = useState(null);
  const [linkToDelete, setLinkToDelete] = useState(null);

  return (
    <>
      {/* Desktop table */}
      <div className="overflow-hidden rounded-lg border border-border-soft bg-card shadow-sm max-lg:hidden">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="border-0 bg-bg-subtle hover:bg-transparent">
              <TableHead className={TH}>{t("list.columns.candidate")}</TableHead>
              <TableHead className={TH}>{t("list.columns.job")}</TableHead>
              <TableHead className={TH}>{t("list.columns.status")}</TableHead>
              <TableHead className={TH}>{t("list.columns.views")}</TableHead>
              <TableHead className={TH}>{t("list.columns.expires")}</TableHead>
              <TableHead className={cn(TH, "text-end")}>{t("list.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow
                key={link.id}
                className="border-t border-b-0 border-border-soft hover:bg-bg-subtle"
              >
                <TableCell className={TD}>
                  <div className="font-medium text-text-body">{link.candidate_name}</div>
                  {link.candidate_role && (
                    <div className="mt-0.5 text-xs text-neutral-500">{link.candidate_role}</div>
                  )}
                </TableCell>
                <TableCell className={cn(TD, "max-w-56 truncate text-neutral-600")} title={link.matched_job_title || undefined}>
                  {link.matched_job_title || t("list.noJob")}
                </TableCell>
                <TableCell className={TD}>
                  <SharedLinkStatusBadge link={link} />
                </TableCell>
                <TableCell className={cn(TD, "tabular-nums text-neutral-600")}>
                  {t("list.viewsOf", { count: link.view_count, max: link.max_views })}
                </TableCell>
                <TableCell className={cn(TD, "text-neutral-600")}>{formatDate(link.expires_at, locale)}</TableCell>
                <TableCell className={cn(TD, "text-end")}>
                  <div className="flex justify-end">
                    <RowActions
                      link={link}
                      t={t}
                      onEdit={setLinkToEdit}
                      onDelete={setLinkToDelete}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile stacked cards */}
      <div className="hidden flex-col gap-4 max-lg:flex">
        {links.map((link) => (
          <div
            key={link.id}
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-text-body">{link.candidate_name}</div>
                {link.candidate_role && (
                  <div className="mt-0.5 truncate text-xs text-neutral-500">{link.candidate_role}</div>
                )}
              </div>
              <SharedLinkStatusBadge link={link} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Briefcase size={12} aria-hidden="true" className="shrink-0" />
                <span className="truncate">{link.matched_job_title || t("list.noJob")}</span>
              </span>
              <span className="tabular-nums">
                {t("list.viewsOf", { count: link.view_count, max: link.max_views })}
              </span>
              <span>{formatDate(link.expires_at, locale)}</span>
            </div>

            <div className="mt-4 flex justify-end border-t border-border pt-4">
              <RowActions
                link={link}
                t={t}
                onEdit={setLinkToEdit}
                onDelete={setLinkToDelete}
              />
            </div>
          </div>
        ))}
      </div>

      <EditShareLinkDialog
        link={linkToEdit}
        open={!!linkToEdit}
        onOpenChange={(open) => !open && setLinkToEdit(null)}
      />
      <DeleteShareLinkDialog
        link={linkToDelete}
        open={!!linkToDelete}
        onOpenChange={(open) => !open && setLinkToDelete(null)}
      />
    </>
  );
}
