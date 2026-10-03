import { useTranslation } from "react-i18next";
import { useEmployerDashboardStats } from "@/features/employer/hooks/useDashboard";
import DashboardTopCards from "@/features/employer/components/dashboard/DashboardTopCards";
import CreditUsageCard from "@/features/employer/components/dashboard/CreditUsageCard";
import { ChatWidget } from "@/features/common/chatbot/ChatWidget";
import { sendChatMessage } from "@/services/chatbot.service";
import { EMPLOYER_ACCENT } from "@/features/common/chatbot/accents";

export function EmployerDashboard() {
  const { t } = useTranslation("employer");
  const { data: stats, isLoading } = useEmployerDashboardStats();

  return (
    <div className="scrollbar-thin flex flex-col gap-6 pt-2.5 3xl:gap-8">
      <div className="mb-2">
        <h1 className="m-0 text-2xl font-bold tracking-[-0.3px] text-brand-700 3xl:text-3xl">
          {t("dashboard.welcome")}
        </h1>
        <p className="mt-2 text-base leading-normal font-normal text-neutral-500 3xl:text-lg">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-7.5 max-lg:grid-cols-2 max-[640px]:grid-cols-1 3xl:gap-8">
        <DashboardTopCards stats={stats} isLoading={isLoading} />
      </div>

      <CreditUsageCard credits={stats?.credits} isLoading={isLoading} />

      <ChatWidget
        chat="employer"
        namespace="employer"
        sender={sendChatMessage}
        accent={EMPLOYER_ACCENT}
      />
    </div>
  );
}
