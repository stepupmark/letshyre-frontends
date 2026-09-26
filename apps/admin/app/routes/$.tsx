import { Link } from "react-router";
import { FileQuestion } from "lucide-react";
import type { Route } from "./+types/$";
import { EmptyState } from "~/components/feedback/empty-state";
import { Button } from "~/components/ui/button";

export const meta: Route.MetaFunction = () => [
  { title: "Page not found · LetsHyre Admin" },
];

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="The page you're looking for doesn't exist or was moved."
        action={
          <Button asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    </main>
  );
}
