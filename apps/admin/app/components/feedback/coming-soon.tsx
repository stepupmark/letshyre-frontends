import { Link } from "react-router";
import { Hourglass } from "lucide-react";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { EmptyState } from "./empty-state";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={Hourglass}
        title="Not available yet"
        description="This section is being built and isn't connected to the API."
        className="rounded-xl border"
        action={
          <Button variant="outline" asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    </>
  );
}
