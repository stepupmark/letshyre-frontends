import type { Route } from "./+types/_auth.sign-in"
import { SignInForm } from "@/features/auth"

export const meta: Route.MetaFunction = () => [
  { title: "Sign in · LetsHyre Admin" },
]

export default SignInForm
