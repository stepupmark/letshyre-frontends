import { toast } from "sonner";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  RefreshCw,
  Smartphone,
} from "lucide-react";

import {
  useChannelSettings,
  useUpdateChannelSettings,
} from "../../hooks/useChannels";
import type { ChannelSettingsPatchPayload } from "../../api/channels.api";
import ChannelCard from "../../components/channels/ChannelCard";
import ChannelsSkeleton from "../../components/channels/ChannelsSkeleton";
import { getErrorMessage } from "~/lib/api/api-error";

function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

const CHANNEL_CONFIG = [
  {
    key: "email_enabled" as const,
    id: "channel-toggle-email",
    icon: Mail,
    label: "Email Notifications",
    description:
      "Send transactional and marketing emails to candidates and employers via the configured SMTP provider.",
    color: "blue" as const,
  },
  {
    key: "sms_enabled" as const,
    id: "channel-toggle-sms",
    icon: MessageSquare,
    label: "SMS Notifications",
    description:
      "Deliver time-sensitive OTPs, alerts, and interview reminders through the configured SMS gateway.",
    color: "emerald" as const,
  },
  {
    key: "push_enabled" as const,
    id: "channel-toggle-push",
    icon: Smartphone,
    label: "Push Notifications",
    description:
      "Broadcast real-time in-app and device push notifications to mobile and web clients.",
    color: "violet" as const,
  },
] as const;

export default function Channels() {
  const {
    data: settings,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useChannelSettings();

  const { mutate: updateSettings, isPending } = useUpdateChannelSettings();

  function handleToggle(field: keyof ChannelSettingsPatchPayload) {
    if (!settings) return;

    const nextValue = !settings[field];
    const channelLabel =
      CHANNEL_CONFIG.find((c) => c.key === field)?.label ?? field;

    updateSettings(
      { [field]: nextValue },
      {
        onSuccess: () => {
          toast.success(
            `${channelLabel} ${nextValue ? "enabled" : "disabled"} successfully.`,
          );
        },
        onError: (err: unknown) => {
          const message = getErrorMessage(
            err,
            "Something went wrong. Please try again.",
          );
          toast.error(message);
        },
      },
    );
  }

  if (isLoading) return <ChannelsSkeleton />;

  if (isError || !settings) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Failed to load channel settings
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Check your connection and try again.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const activeCount = CHANNEL_CONFIG.filter((c) => settings[c.key]).length;
  const totalCount = CHANNEL_CONFIG.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Communication Channels
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control which delivery channels are active for outbound
            notifications.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground shadow-xs">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>
            Last updated&nbsp;
            <span className="font-medium text-foreground">
              {formatUpdatedAt(settings.updated_at)}
            </span>
          </span>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh channel settings"
            className="ml-1 rounded-lg p-0.5 text-muted-foreground transition hover:text-foreground disabled:animate-spin"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
            <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Notification Channels Overview
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Toggling a channel takes effect immediately for all outbound
              notifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2
            className={`h-4 w-4 ${
              activeCount === totalCount
                ? "text-emerald-500"
                : activeCount === 0
                  ? "text-red-400"
                  : "text-amber-500"
            }`}
          />
          <span className="text-sm font-medium text-foreground">
            <span className="tabular-nums">{activeCount}</span>
            <span className="text-muted-foreground">/{totalCount}</span>
            &nbsp;channels active
          </span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CHANNEL_CONFIG.map((channel) => (
          <ChannelCard
            key={channel.key}
            id={channel.id}
            icon={channel.icon}
            label={channel.label}
            description={channel.description}
            value={settings[channel.key]}
            color={channel.color}
            isPending={isPending}
            onChange={() => handleToggle(channel.key)}
          />
        ))}
      </div>
    </div>
  );
}
