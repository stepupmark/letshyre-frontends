import { ForgotPasswordFlow } from "@/features/auth"

import type { Route } from "./+types/_auth.forgot-password"

export const meta: Route.MetaFunction = () => [
  { title: "Reset password · LetsHyre Admin" },
]

export default ForgotPasswordFlow
