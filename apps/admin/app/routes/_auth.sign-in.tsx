import { SignInForm } from "@/features/auth"

import type { Route } from "./+types/_auth.sign-in"

export const meta: Route.MetaFunction = () => [
  { title: "Sign in · LetsHyre Admin" },
]

export default SignInForm
