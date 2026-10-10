import { z } from "zod"

export interface PasswordValues {
  password: string
  confirm: string
}

type Translate = (
  key: "validation.passwordMin" | "validation.passwordsDiffer"
) => string

export const newPasswordShape = (t: Translate) => ({
  password: z.string().min(8, t("validation.passwordMin")),
  confirm: z.string(),
})

export const passwordsMatch = (
  t: Translate
): [(v: PasswordValues) => boolean, { message: string; path: string[] }] => [
  (v) => v.password === v.confirm,
  { message: t("validation.passwordsDiffer"), path: ["confirm"] },
]
