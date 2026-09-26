import type { Route } from "./+types/dashboard.ai-interview";
import { ComingSoon } from "~/components/feedback/coming-soon";

export const meta: Route.MetaFunction = () => [
  { title: "AI interviews · LetsHyre Admin" },
];

export const handle = { breadcrumb: "AI interview" };

export default function Page() {
  return (
    <ComingSoon
      title="AI interviews"
      description="Configure and monitor AI interview sessions."
    />
  );
}
