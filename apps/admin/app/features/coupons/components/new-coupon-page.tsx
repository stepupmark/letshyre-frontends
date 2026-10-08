import { Link, useNavigate } from "react-router"
import { LoaderCircle } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { useCreateCoupon } from "../mutations/use-coupon-mutations"
import { CouponForm } from "./coupon-form"

export function NewCouponPage() {
  const navigate = useNavigate()
  const create = useCreateCoupon()

  return (
    <>
      <PageHeader
        title="New coupon"
        description="Discount codes for campaigns, onboarding offers and promotions."
      />
      <Card className="max-w-3xl">
        <CardContent>
          <CouponForm
            id="new-coupon"
            onSubmit={(payload) => {
              create.mutate(payload, {
                onSuccess: () => {
                  void navigate("/dashboard/coupons")
                },
              })
            }}
            footer={
              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link to="/dashboard/coupons" />}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending && (
                    <LoaderCircle className="animate-spin" />
                  )}
                  Create coupon
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    </>
  )
}
