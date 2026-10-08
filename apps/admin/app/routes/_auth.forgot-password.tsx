import type { Route } from "./+types/_auth.forgot-password";
import { ForgotPasswordFlow } from "~/features/auth";

export const meta: Route.MetaFunction = () => [
  { title: "Reset password · LetsHyre Admin" },
];

export default ForgotPasswordFlow;
