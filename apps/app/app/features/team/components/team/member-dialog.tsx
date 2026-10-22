import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "@workspace/i18n/react"
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
import { Wand2 } from "lucide-react"
import * as m from "motion/react-m"
import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"

import { CopyButton } from "@/components/copy-button"
import { PasswordField, TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"
import { duration, ease } from "@/lib/motion"

import { generatePassword } from "../../lib/team"
import { useSaveMember } from "../../mutations/use-save-member"
import {
  makeMemberSchema,
  type MemberValues,
} from "../../schemas/member-form.schema"
import type { Member } from "../../schemas/team.schema"

export function MemberDialog({
  member,
  onClose,
  onSaved,
}: {
  member: Member | null
  onClose: () => void
  onSaved: (values: MemberValues) => void
}) {
  const { t } = useTranslation(["team", "common"])
  const isNew = member === null
  const [spins, setSpins] = useState(0)
  const schema = useMemo(
    () =>
      makeMemberSchema(
        {
          name: t("errors.name"),
          email: t("errors.email"),
          password: t("errors.password"),
        },
        { isNew }
      ),
    [t, isNew]
  )
  const form = useForm<MemberValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: member?.full_name ?? "",
      email: member?.email ?? "",
      password: "",
    },
    mode: "onSubmit",
  })
  const errors = form.formState.errors
  const [password, email] = useWatch({
    control: form.control,
    name: ["password", "email"],
  })
  const emailChanged = !isNew && email.trim() !== (member.email ?? "").trim()
  const save = useSaveMember({
    member,
    form,
    onSaved: (values) => {
      onSaved(values)
      onClose()
    },
  })

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            void form.handleSubmit((values) => {
              save.mutate(values)
            })(event)
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {isNew ? t("dialog.addTitle") : t("dialog.editTitle")}
            </DialogTitle>
            <DialogDescription>
              {isNew ? t("dialog.addLead") : t("dialog.editLead")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <TextField
              label={t("dialog.name")}
              autoComplete="off"
              error={errors.full_name?.message}
              {...checkOnBlur(form, "full_name")}
            />
            <TextField
              label={t("dialog.email")}
              type="email"
              inputMode="email"
              autoComplete="off"
              error={errors.email?.message}
              hint={emailChanged ? t("dialog.emailChange") : undefined}
              {...checkOnBlur(form, "email")}
            />
            {isNew && (
              <div className="flex flex-col gap-2">
                <PasswordField
                  label={t("dialog.password")}
                  autoComplete="new-password"
                  hint={t("dialog.passwordHint")}
                  error={errors.password?.message}
                  labelAside={
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto px-0"
                      onClick={() => {
                        setSpins((n) => n + 1)
                        form.setValue("password", generatePassword(), {
                          shouldValidate: true,
                        })
                      }}
                    >
                      <m.span
                        key={spins}
                        aria-hidden="true"
                        initial={spins > 0 ? { rotate: -30 } : false}
                        animate={{ rotate: 0 }}
                        transition={{ duration: duration.base, ease }}
                        className="flex"
                      >
                        <Wand2 />
                      </m.span>
                      {t("dialog.generate")}
                    </Button>
                  }
                  {...checkOnBlur(form, "password")}
                />
                {password.length >= 8 && (
                  <span className="self-start">
                    <CopyButton value={password} label={t("dialog.copy")} />
                  </span>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("common:confirm.cancel")}
            </DialogClose>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending
                ? isNew
                  ? t("dialog.adding")
                  : t("dialog.saving")
                : isNew
                  ? t("dialog.add")
                  : t("dialog.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
