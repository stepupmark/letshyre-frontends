import { toast } from "sonner";
import {
  AlertTriangle,
  Clock,
  CloudUpload,
  Cpu,
  HardDrive,
  RefreshCw,
  Server,
  Shield,
  ShieldCheck,
  Zap,
} from "lucide-react";

import {
  useSystemConfig,
  useUpdateSystemConfig,
} from "../../hooks/useSystemConfig";
import ConfigSection from "../../components/system-config/ConfigSection";
import ToggleRow from "../../components/system-config/ToggleRow";
import ReadonlyRow from "../../components/system-config/ReadonlyRow";
import EditableRow from "../../components/system-config/EditableRow";
import SystemConfigSkeleton from "../../components/system-config/SystemConfigSkeleton";

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

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconBg: string;
  iconColor: string;
}

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="p-5 bg-card border border-border shadow-xs rounded-2xl">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="flex items-baseline gap-1">
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {value}
        </p>
        {unit && (
          <span className="text-xs font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function SystemConfigs() {
  const {
    data: config,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useSystemConfig();
  const { mutate: updateConfig, isPending } = useUpdateSystemConfig();

  function handleToggle(field: "maintenance_mode" | "mfa_required_for_admins") {
    if (!config) return;

    const nextValue = !config[field];
    const label =
      field === "maintenance_mode" ? "Maintenance Mode" : "MFA for Admins";

    updateConfig(
      { [field]: nextValue },
      {
        onSuccess: () => {
          toast.success(
            `${label} ${nextValue ? "enabled" : "disabled"} successfully.`,
          );
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Something went wrong. Please try again.";
          toast.error(message);
        },
      },
    );
  }

  function handleNumericUpdate(
    field:
      | "max_file_upload_size_mb"
      | "api_rate_limit_per_min"
      | "default_video_retention_days",
    label: string,
    value: number,
  ) {
    updateConfig(
      { [field]: value },
      {
        onSuccess: () => {
          toast.success(`${label} updated to ${value}.`);
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Something went wrong. Please try again.";
          toast.error(message);
        },
      },
    );
  }

  if (isLoading) return <SystemConfigSkeleton />;

  if (isError || !config) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-500/10">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Failed to load system configuration
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Check your connection and try again.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            System Configuration
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage platform-wide settings, limits, and security policies.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground shadow-xs">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>
            Last updated&nbsp;
            <span className="font-medium text-foreground">
              {formatUpdatedAt(config.updated_at)}
            </span>
          </span>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh configuration"
            className="ml-1 rounded-lg p-0.5 text-muted-foreground transition hover:text-foreground disabled:animate-spin"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Max file upload"
          value={config.max_file_upload_size_mb}
          unit="MB"
          icon={CloudUpload}
          iconBg="bg-blue-50 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="API rate limit"
          value={config.api_rate_limit_per_min}
          unit="/min"
          icon={Zap}
          iconBg="bg-amber-50 dark:bg-amber-500/10"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Video retention"
          value={config.default_video_retention_days}
          unit="days"
          icon={HardDrive}
          iconBg="bg-purple-50 dark:bg-purple-500/10"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          label="Task queue"
          value={config.celery_task_default_queue}
          icon={Cpu}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      <ConfigSection
        icon={Server}
        iconBg="bg-muted"
        iconColor="text-muted-foreground"
        title="Platform Controls"
        description="Global platform availability and operational mode settings."
      >
        <ToggleRow
          id="toggle-maintenance-mode"
          label="Maintenance Mode"
          description="When enabled, the platform is unavailable to all non-admin users."
          value={config.maintenance_mode}
          onLabel="Active"
          offLabel="Inactive"
          colorOn="amber"
          isPending={isPending}
          onChange={() => handleToggle("maintenance_mode")}
        />
      </ConfigSection>

      <ConfigSection
        icon={ShieldCheck}
        iconBg="bg-indigo-50 dark:bg-indigo-500/10"
        iconColor="text-indigo-600 dark:text-indigo-400"
        title="Security & Access"
        description="Authentication requirements and admin access security policies."
      >
        <ToggleRow
          id="toggle-mfa-admins"
          label="MFA Required for Admins"
          description="Enforce multi-factor authentication for all admin accounts."
          value={config.mfa_required_for_admins}
          onLabel="Required"
          offLabel="Optional"
          colorOn="blue"
          isPending={isPending}
          onChange={() => handleToggle("mfa_required_for_admins")}
        />
      </ConfigSection>

      <ConfigSection
        icon={Shield}
        iconBg="bg-rose-50 dark:bg-rose-500/10"
        iconColor="text-rose-600 dark:text-rose-400"
        title="Resource Limits & Infrastructure"
        description="Hover any row to edit the value inline. Celery queue is read-only."
      >
        <EditableRow
          icon={CloudUpload}
          iconBg="bg-blue-50 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          label="Max File Upload Size"
          description="Maximum size allowed for any single file upload."
          value={config.max_file_upload_size_mb}
          unit="MB"
          min={1}
          max={500}
          isPending={isPending}
          onSave={(v) =>
            handleNumericUpdate(
              "max_file_upload_size_mb",
              "Max File Upload Size",
              v,
            )
          }
        />
        <EditableRow
          icon={Zap}
          iconBg="bg-amber-50 dark:bg-amber-500/10"
          iconColor="text-amber-600 dark:text-amber-400"
          label="API Rate Limit"
          description="Maximum number of API requests allowed per minute per client."
          value={config.api_rate_limit_per_min}
          unit="req / min"
          min={1}
          max={10000}
          isPending={isPending}
          onSave={(v) =>
            handleNumericUpdate("api_rate_limit_per_min", "API Rate Limit", v)
          }
        />
        <EditableRow
          icon={HardDrive}
          iconBg="bg-purple-50 dark:bg-purple-500/10"
          iconColor="text-purple-600 dark:text-purple-400"
          label="Video Retention Period"
          description="How long recorded video files are retained before automatic deletion."
          value={config.default_video_retention_days}
          unit="days"
          min={1}
          max={3650}
          isPending={isPending}
          onSave={(v) =>
            handleNumericUpdate(
              "default_video_retention_days",
              "Video Retention Period",
              v,
            )
          }
        />
        <ReadonlyRow
          icon={Cpu}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
          label="Celery Default Queue"
          description="The default background task queue used by Celery workers."
          value={config.celery_task_default_queue}
        />
      </ConfigSection>

    </div>
  );
}
