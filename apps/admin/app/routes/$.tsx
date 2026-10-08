import { Link, useNavigate } from "react-router"
import type { Route } from "./+types/$"
import { Button } from "@workspace/ui/components/button"
import { AuthLayout } from "@/features/auth"

export const meta: Route.MetaFunction = () => [
  { title: "Page not found · LetsHyre Admin" },
]

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <p className="text-sm font-medium text-primary tabular-nums">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Check
        the address, or head back.
      </p>
      <div className="mt-8 flex gap-2">
        <Button nativeButton={false} render={<Link to="/dashboard" />}>
          Go to dashboard
        </Button>
        <Button variant="outline" onClick={() => void navigate(-1)}>
          Go back
        </Button>
      </div>
    </AuthLayout>
  )
}
