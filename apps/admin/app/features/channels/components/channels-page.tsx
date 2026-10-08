import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Mail, MessageSquare, Smartphone, type LucideIcon } from "lucide-react"
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
import { Skeleton } from "~/components/ui/skeleton"
import { Switch } from "~/components/ui/switch"
import { formatDateTime } from "~/lib/format"
import { useUpdateChannel } from "../mutations/use-update-channel"
import { channelsQueries } from "../queries/channels.queries"
import type { ChannelKey } from "../schemas/channels.schema"

type Channel = {
  key: ChannelKey
  icon: LucideIcon
  label: string
  description: string
}

const CHANNELS: Channel[] = [
  {
    key: "email_enabled",
    icon: Mail,
    label: "Email",
    description:
      "Transactional and marketing emails to candidates and employers.",
  },
  {
    key: "sms_enabled",
    icon: MessageSquare,
    label: "SMS",
    description: "OTPs, alerts and interview reminders over SMS.",
  },
  {
    key: "push_enabled",
    icon: Smartphone,
    label: "Push",
    description: "In-app and device push notifications.",
  },
]

export function ChannelsPage() {
  const settings = useQuery(channelsQueries.settings())
  const update = useUpdateChannel()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [disabling, setDisabling] = useState<Channel>(CHANNELS[0])

  const toggle = (channel: Channel, enabled: boolean) => {
    if (enabled) return update.mutate({ key: channel.key, enabled })
    setDisabling(channel)
    setConfirmOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Communication channels"
        description={
          settings.data?.updated_at
            ? `Changes apply to all outbound notifications immediately. Last updated ${formatDateTime(settings.data.updated_at)}.`
            : "Changes apply to all outbound notifications immediately."
        }
      />

      {settings.isError ? (
        <ErrorState
          error={settings.error}
          onRetry={() => void settings.refetch()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHANNELS.map((channel) => {
            const { key, icon: Icon, label, description } = channel
            return (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-4" />
                    </div>
                    {settings.data ? (
                      <Switch
                        aria-label={`${label} notifications`}
                        checked={settings.data[key]}
                        disabled={
                          update.isPending && update.variables.key === key
                        }
                        onCheckedChange={(checked) => toggle(channel, checked)}
                      />
                    ) : (
                      <Skeleton className="h-5 w-8 rounded-full" />
                    )}
                  </div>
                  <CardTitle className="pt-2">{label}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {settings.data
                    ? settings.data[key]
                      ? "Active"
                      : "Inactive"
                    : "Loading…"}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Turn off ${disabling.label} notifications?`}
        description="Users stop receiving messages on this channel right away, including OTPs if they depend on it."
        confirmLabel="Turn off"
        destructive
        pending={update.isPending}
        onConfirm={() => {
          update.mutate({ key: disabling.key, enabled: false })
          setConfirmOpen(false)
        }}
      />
    </>
  )
}
