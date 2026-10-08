import type { Route } from "./+types/dashboard.notifications";
import { ComingSoon } from "~/components/feedback/coming-soon";

export const meta: Route.MetaFunction = () => [
  { title: "Notification scheduler · LetsHyre Admin" },
];

export const handle = { breadcrumb: "Notifications" };

export default function Page() {
  return (
    <ComingSoon
      title="Notification scheduler"
      description="Schedule notifications for candidates and recruiters."
    />
  );
}
