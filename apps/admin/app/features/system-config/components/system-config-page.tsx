import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ConfirmDialog } from "~/components/feedback/confirm-dialog"
import { ErrorState } from "~/components/feedback/error-state"
import { PageHeader } from "~/components/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "~/components/ui/field"
import { Skeleton } from "~/components/ui/skeleton"
import { Switch } from "~/components/ui/switch"
import { formatDateTime } from "~/lib/format"
import { useUpdateSystemConfig } from "../mutations/use-update-system-config"
import { systemConfigQueries } from "../queries/system-config.queries"
import { LimitsForm } from "./limits-form"

export function SystemConfigPage() {
  const config = useQuery(systemConfigQueries.detail())
  const update = useUpdateSystemConfig()
  const [confirmMaintenance, setConfirmMaintenance] = useState(false)

  const header = (
    <PageHeader
      title="System configuration"
      description={
        config.data?.updated_at
          ? `Platform-wide settings. Last updated ${formatDateTime(config.data.updated_at)}.`
          : "Platform-wide settings."
      }
    />
  )

  if (config.isError)
    return (
      <>
        {header}
        <ErrorState
          error={config.error}
          onRetry={() => void config.refetch()}
        />
      </>
    )

  if (!config.data)
    return (
      <>
        {header}
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-60 w-full rounded-xl" />
        </div>
      </>
    )

  const settings = config.data

  return (
    <>
      {header}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Access</CardTitle>
            <CardDescription>
              Platform availability and admin security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="maintenance_mode">
                    Maintenance mode
                  </FieldLabel>
                  <FieldDescription>
                    The platform is unavailable to everyone except admins.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="maintenance_mode"
                  checked={settings.maintenance_mode}
                  disabled={update.isPending}
                  onCheckedChange={(checked) =>
                    checked
                      ? setConfirmMaintenance(true)
                      : update.mutate({ maintenance_mode: false })
                  }
                />
              </Field>
              <FieldSeparator />
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="mfa_required_for_admins">
                    Require MFA for admins
                  </FieldLabel>
                  <FieldDescription>
                    Every admin account must use multi-factor authentication.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="mfa_required_for_admins"
                  checked={settings.mfa_required_for_admins}
                  disabled={update.isPending}
                  onCheckedChange={(checked) =>
                    update.mutate({ mfa_required_for_admins: checked })
                  }
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <LimitsForm config={settings} />

        {settings.celery_task_default_queue && (
          <p className="text-sm text-muted-foreground">
            Background tasks run on the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {settings.celery_task_default_queue}
            </code>{" "}
            queue.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirmMaintenance}
        onOpenChange={setConfirmMaintenance}
        title="Turn on maintenance mode?"
        description="Candidates and employers are locked out until you turn it off again."
        confirmLabel="Turn on"
        destructive
        pending={update.isPending}
        onConfirm={() =>
          update.mutate(
            { maintenance_mode: true },
            { onSuccess: () => setConfirmMaintenance(false) }
          )
        }
      />
    </>
  )
}
