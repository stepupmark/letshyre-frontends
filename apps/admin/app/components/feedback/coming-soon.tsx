import { Link } from "react-router"
import { Hourglass } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

import { PageHeader } from "@/components/page-header"

import { EmptyState } from "./empty-state"

export function ComingSoon({
  title,
  description,
}: {
  title: string
  description: string
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
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/dashboard" />}
          >
            Back to dashboard
          </Button>
        }
      />
    </>
  )
}
