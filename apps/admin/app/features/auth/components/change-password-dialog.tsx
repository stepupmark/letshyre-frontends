import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { LoaderCircle } from "lucide-react"
import { PasswordInput } from "@/components/password-input"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { useChangePassword } from "../mutations/use-change-password"
import { changePasswordSchema } from "../schemas/auth.schema"
import type { ChangePasswordInput } from "../types"
import { getErrorMessage } from "@/lib/errors"

const EMPTY: ChangePasswordInput = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}

const FIELDS = [
  {
    name: "currentPassword",
    label: "Current password",
    autoComplete: "current-password",
  },
  { name: "newPassword", label: "New password", autoComplete: "new-password" },
  {
    name: "confirmPassword",
    label: "Confirm new password",
    autoComplete: "new-password",
  },
] as const

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const changePassword = useChangePassword()
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY,
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset(EMPTY)
      changePassword.reset()
    }
    onOpenChange(next)
  }

  const submit = form.handleSubmit(({ currentPassword, newPassword }) => {
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          handleOpenChange(false)
        },
      }
    )
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          noValidate
          onSubmit={(event) => {
            void submit(event)
          }}
        >
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Use at least 8 characters, with an uppercase letter and a number.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            {changePassword.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {getErrorMessage(changePassword.error)}
                </AlertDescription>
              </Alert>
            )}
            {FIELDS.map(({ name, label, autoComplete }) => (
              <Controller
                key={name}
                control={form.control}
                name={name}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    <PasswordInput
                      {...field}
                      id={name}
                      autoComplete={autoComplete}
                      aria-invalid={fieldState.invalid}
                    />
                    {name === "newPassword" && !fieldState.error && (
                      <FieldDescription>
                        Must differ from your current password.
                      </FieldDescription>
                    )}
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending && (
                <LoaderCircle className="animate-spin" />
              )}
              Update password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
