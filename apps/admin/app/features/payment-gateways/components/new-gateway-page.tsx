import { Link, useNavigate } from "react-router"
import { LoaderCircle } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { useCreateGateway } from "../mutations/use-gateway-mutations"
import { GatewayForm } from "./gateway-form"

export function NewGatewayPage() {
  const navigate = useNavigate()
  const create = useCreateGateway()

  return (
    <>
      <PageHeader
        title="Add payment gateway"
        description="Connect a provider using the API keys from its dashboard."
      />
      <Card className="max-w-2xl">
        <CardContent>
          <GatewayForm
            id="new-gateway"
            onSubmit={(values) => {
              create.mutate(values, {
                onSuccess: () => {
                  void navigate("/dashboard/payment-gateways")
                },
              })
            }}
            footer={
              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link to="/dashboard/payment-gateways" />}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending && (
                    <LoaderCircle className="animate-spin" />
                  )}
                  Add gateway
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    </>
  )
}
