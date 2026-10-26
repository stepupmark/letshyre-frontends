import { useState } from "react"
import { Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { CreditCard, LoaderCircle, Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Skeleton } from "@workspace/ui/components/skeleton"

import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/page-header"

import {
  useDeleteGateway,
  useUpdateGateway,
} from "../mutations/use-gateway-mutations"
import { paymentGatewaysQueries } from "../queries/payment-gateways.queries"
import type { Gateway } from "../schemas/payment-gateways.schema"
import { toGatewayFormValues } from "../utils/gateway-values"
import { GatewayCard } from "./gateway-card"
import { GatewayForm } from "./gateway-form"

const addButton = (
  <Button
    nativeButton={false}
    render={<Link to="/dashboard/payment-gateways/new" />}
  >
    <Plus /> Add gateway
  </Button>
)

export function PaymentGatewaysPage() {
  const gateways = useQuery(paymentGatewaysQueries.list())
  const update = useUpdateGateway()
  const remove = useDeleteGateway()

  const [selected, setSelected] = useState<Gateway | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  let content
  if (gateways.isError)
    content = (
      <ErrorState
        error={gateways.error}
        onRetry={() => void gateways.refetch()}
      />
    )
  else if (!gateways.data)
    content = Array.from({ length: 2 }, (_, index) => (
      <Skeleton key={index} className="h-40 w-full rounded-xl" />
    ))
  else if (!gateways.data.length)
    content = (
      <EmptyState
        icon={CreditCard}
        title="No payment gateways"
        description="Add one so employers can buy credits."
        action={addButton}
      />
    )
  else
    content = gateways.data.map((gateway) => (
      <GatewayCard
        key={gateway.id}
        gateway={gateway}
        onEdit={() => {
          setSelected(gateway)
          setEditOpen(true)
        }}
        onDelete={() => {
          setSelected(gateway)
          setDeleteOpen(true)
        }}
      />
    ))

  return (
    <>
      <PageHeader
        title="Payment gateways"
        description="Providers employers pay through when buying credits."
        actions={addButton}
      />
      <div className="grid max-w-4xl gap-4">{content}</div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit gateway</DialogTitle>
            <DialogDescription>
              New credentials take effect on the next payment.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <GatewayForm
              key={selected.id}
              id="edit-gateway"
              defaultValues={toGatewayFormValues(selected)}
              onSubmit={(values) => {
                update.mutate(
                  { id: selected.id, values },
                  {
                    onSuccess: () => {
                      setEditOpen(false)
                    },
                  }
                )
              }}
              footer={
                <DialogFooter className="mt-6">
                  <DialogClose
                    render={<Button type="button" variant="outline" />}
                  >
                    Cancel
                  </DialogClose>
                  <Button type="submit" disabled={update.isPending}>
                    {update.isPending && (
                      <LoaderCircle className="animate-spin" />
                    )}
                    Save changes
                  </Button>
                </DialogFooter>
              }
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${selected?.displayName ?? "gateway"}?`}
        description="Employers can't pay through this gateway once it's deleted. This can't be undone."
        confirmLabel="Delete"
        destructive
        pending={remove.isPending}
        onConfirm={() => {
          if (selected) remove.mutate(selected.id)
          setDeleteOpen(false)
        }}
      />
    </>
  )
}
