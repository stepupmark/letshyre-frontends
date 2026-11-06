import type { FileRules } from "@/lib/file-rules"

export const NAME_LIMIT = 120
export const SUBJECT_LIMIT = 200
export const BODY_LIMIT = 20_000

export const RECIPIENT_FILE: FileRules = {
  accept: [".csv", ".txt"],
  maxBytes: 1024 * 1024,
}
