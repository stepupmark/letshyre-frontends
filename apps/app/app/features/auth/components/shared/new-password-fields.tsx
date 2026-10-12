import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { useWatch, type Path, type UseFormReturn } from "react-hook-form"

import { PasswordField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"

import type { PasswordValues } from "../../schemas/password.schema"
import { passwordStrength } from "../../lib/strength"

const LEVELS = ["weak", "weak", "fair", "good", "strong"] as const

/** Password and confirm, with a strength meter that reads as you type. */
export function NewPasswordFields<T extends PasswordValues>({
  form,
  label,
}: {
  form: UseFormReturn<T>
  label: string
}) {
  const { t } = useTranslation("auth")
  const passwordName = "password" as Path<T>
  const confirmName = "confirm" as Path<T>
  const password = useWatch({
    control: form.control,
    name: passwordName,
  }) as string
  const strength = passwordStrength(password)
  const level = LEVELS[strength]
  const { errors } = form.formState

  return (
    <>
      <div className="flex flex-col gap-2">
        <PasswordField
          label={label}
          autoComplete="new-password"
          autoFocus
          error={errors.password?.message as string | undefined}
          {...checkOnBlur(form, passwordName)}
        />
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            data-level={level}
            className="group grid flex-1 grid-cols-4 gap-1"
          >
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={cn(
                  "h-1 rounded-full bg-muted transition-colors motion-reduce:transition-none",
                  strength >= step &&
                    "group-data-[level=fair]:bg-warning group-data-[level=good]:bg-brand group-data-[level=strong]:bg-success group-data-[level=weak]:bg-danger"
                )}
              />
            ))}
          </span>
          <span
            aria-live="polite"
            className="min-w-14 text-end text-xs text-muted-foreground"
          >
            {strength > 0 && (
              <>
                <span className="sr-only">{t("strength.label")} </span>
                {t(`strength.${level}`)}
              </>
            )}
          </span>
        </div>
        {(level === "weak" || level === "fair") && strength > 0 && (
          <p className="text-xs text-muted-foreground">
            {t(`strength.tip.${level}`)}
          </p>
        )}
      </div>
      <PasswordField
        label={t("fields.confirmPassword")}
        autoComplete="new-password"
        error={errors.confirm?.message as string | undefined}
        {...checkOnBlur(form, confirmName)}
      />
    </>
  )
}
