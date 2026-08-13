import PageMeta from "../../components/common/PageMeta";
import ConfigSection from "../../components/system-config/ConfigSection";
import EmailLogsTable from "../../components/logs/EmailLogsTable";
import SmsLogsTable from "../../components/logs/SmsLogsTable";
import { Mail, MessageSquare } from "lucide-react";

export default function Logs() {
  return (
    <>
      <PageMeta
        title="Communication Logs | Admin Dashboard"
        description="View and manage system communication logs."
      />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Communication Logs
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          View and monitor all outgoing email and SMS communications across the
          platform.
        </p>
      </div>

      <div className="space-y-6">
        <ConfigSection
          icon={Mail}
          iconBg="bg-blue-50 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          title="Email Logs"
          description="Track status and verification of all outgoing email communications."
        >
          <EmailLogsTable />
        </ConfigSection>

        <ConfigSection
          icon={MessageSquare}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
          title="SMS Logs"
          description="Track status and verification of all outgoing SMS communications."
        >
          <SmsLogsTable />
        </ConfigSection>
      </div>
    </>
  );
}
