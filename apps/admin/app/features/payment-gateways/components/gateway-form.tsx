import type { ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { PasswordInput } from "@/components/password-input"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { UnsavedChangesGuard } from "@/components/unsaved-changes-guard"
import {
  GATEWAY_PROVIDERS,
  gatewayFormSchema,
  type GatewayFormValues,
} from "../schemas/payment-gateways.schema"
import { EMPTY_GATEWAY } from "../utils/gateway-values"

interface GatewayFormProps {
  id: string
  defaultValues?: GatewayFormValues
  onSubmit: (values: GatewayFormValues) => void
  footer: ReactNode
}

export function GatewayForm({
  id,
  defaultValues = EMPTY_GATEWAY,
  onSubmit,
  footer,
}: GatewayFormProps) {
  const form = useForm<GatewayFormValues>({
    resolver: zodResolver(gatewayFormSchema),
    defaultValues,
  })
  const { errors } = form.formState

  return (
    <form
      id={id}
      noValidate
      onSubmit={(event) => {
        void form.handleSubmit(onSubmit)(event)
      }}
    >
      <UnsavedChangesGuard
        when={form.formState.isDirty && !form.formState.isSubmitSuccessful}
      />
      <FieldGroup className="gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${id}-provider`}>Provider</FieldLabel>
            <Controller
              control={form.control}
              name="provider"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={GATEWAY_PROVIDERS}
                >
                  <SelectTrigger id={`${id}-provider`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GATEWAY_PROVIDERS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field data-invalid={Boolean(errors.displayName)}>
            <FieldLabel htmlFor={`${id}-name`}>Display name</FieldLabel>
            <Input
              id={`${id}-name`}
              placeholder="Razorpay India"
              aria-invalid={Boolean(errors.displayName)}
              {...form.register("displayName")}
            />
            <FieldError errors={[errors.displayName]} />
          </Field>
        </div>

        <FieldSet>
          <FieldLegend variant="label">Environment</FieldLegend>
          <Controller
            control={form.control}
            name="environment"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="sandbox" id={`${id}-sandbox`} />
                  <Label htmlFor={`${id}-sandbox`}>Sandbox</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="live" id={`${id}-live`} />
                  <Label htmlFor={`${id}-live`}>Live</Label>
                </div>
              </RadioGroup>
            )}
          />
          <FieldDescription>
            Live keys charge real money. Test with sandbox keys first.
          </FieldDescription>
        </FieldSet>

        <Field data-invalid={Boolean(errors.clientId)}>
          <FieldLabel htmlFor={`${id}-client-id`}>Client ID</FieldLabel>
          <Input
            id={`${id}-client-id`}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
            aria-invalid={Boolean(errors.clientId)}
            {...form.register("clientId")}
          />
          <FieldError errors={[errors.clientId]} />
        </Field>
        <Field data-invalid={Boolean(errors.clientSecret)}>
          <FieldLabel htmlFor={`${id}-client-secret`}>Client secret</FieldLabel>
          <PasswordInput
            id={`${id}-client-secret`}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
            aria-invalid={Boolean(errors.clientSecret)}
            {...form.register("clientSecret")}
          />
          <FieldError errors={[errors.clientSecret]} />
        </Field>
      </FieldGroup>
      {footer}
    </form>
  )
}
