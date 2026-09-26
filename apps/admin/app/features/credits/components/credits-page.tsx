import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ConfirmDialog } from "~/components/feedback/confirm-dialog";
import { ErrorState } from "~/components/feedback/error-state";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "~/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "~/components/ui/input-group";
import { Skeleton } from "~/components/ui/skeleton";
import { formatCurrency } from "~/lib/format";
import { useUpdateCreditPrice } from "../mutations/use-update-credit-price";
import { creditsQueries } from "../queries/credits.queries";
import {
  creditPriceSchema,
  type Credit,
  type CreditPriceInput,
} from "../schemas/credits.schema";

const PREVIEW_PACKS = [10, 50, 100];

function PriceForm({ credit }: { credit: Credit }) {
  const update = useUpdateCreditPrice();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [change, setChange] = useState({ from: credit.price, to: "" });
  const form = useForm<CreditPriceInput>({
    resolver: zodResolver(creditPriceSchema),
    values: { price: credit.price },
  });
  const draft = form.watch("price");
  const draftValid = !form.formState.errors.price && Number(draft) > 0;

  return (
    <Card>
      <form
        noValidate
        onSubmit={form.handleSubmit(({ price }) => {
          setChange({ from: credit.price, to: price });
          setConfirmOpen(true);
        })}
      >
        <CardHeader>
          <CardTitle>Price per credit</CardTitle>
          <CardDescription>
            One credit unlocks one candidate profile. Changes apply to future
            purchases only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-4">
          <Field
            data-invalid={Boolean(form.formState.errors.price)}
            className="max-w-xs"
          >
            <FieldLabel htmlFor="price">Price</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>₹</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="price"
                inputMode="decimal"
                aria-invalid={Boolean(form.formState.errors.price)}
                {...form.register("price")}
              />
            </InputGroup>
            {form.formState.errors.price ? (
              <FieldError errors={[form.formState.errors.price]} />
            ) : (
              <FieldDescription>
                Currently {formatCurrency(credit.price)} per credit.
              </FieldDescription>
            )}
          </Field>

          {draftValid && (
            <div className="grid gap-3 sm:grid-cols-3">
              {PREVIEW_PACKS.map((pack) => (
                <div key={pack} className="rounded-lg border px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    {pack} credits
                  </p>
                  <p className="font-medium tabular-nums">
                    {formatCurrency(Number(draft) * pack)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={!form.formState.isDirty}
            onClick={() => form.reset()}
          >
            Discard
          </Button>
          <Button type="submit" disabled={!form.formState.isDirty}>
            Save price
          </Button>
        </CardFooter>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Change the credit price?"
        description={`Employers will pay ${formatCurrency(change.to)} per credit instead of ${formatCurrency(change.from)}.`}
        confirmLabel="Change price"
        pending={update.isPending}
        onConfirm={() =>
          update.mutate(
            { id: credit.id, price: change.to },
            { onSuccess: () => setConfirmOpen(false) },
          )
        }
      />
    </Card>
  );
}

export function CreditsPage() {
  const credit = useQuery(creditsQueries.detail());

  return (
    <>
      <PageHeader
        title="Credits"
        description="Set what employers pay for the credits they use to unlock candidates."
      />
      <div className="max-w-3xl">
        {credit.isError ? (
          <ErrorState
            error={credit.error}
            onRetry={() => void credit.refetch()}
          />
        ) : credit.data ? (
          <PriceForm credit={credit.data} />
        ) : (
          <Skeleton className="h-72 w-full rounded-xl" />
        )}
      </div>
    </>
  );
}
