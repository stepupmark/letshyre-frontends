import { useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"

import {
  contactDraftSchema,
  type ContactValues,
} from "../schemas/contact.schema"

const DRAFT_KEY = "contact-draft"

const readDraft = (): Partial<ContactValues> | null => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    const draft = raw ? contactDraftSchema.safeParse(JSON.parse(raw)) : null
    return draft?.success ? draft.data : null
  } catch {
    return null
  }
}

export const clearDraft = () => {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // storage blocked: nothing was kept
  }
}

/** Keeps what was typed for the tab's lifetime, so a reload doesn't lose it. */
export function useContactDraft(
  form: UseFormReturn<ContactValues>,
  empty: ContactValues
) {
  useEffect(() => {
    const draft = readDraft()
    if (draft) form.reset({ ...empty, ...draft })
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        try {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values))
        } catch {
          // storage blocked: the draft just isn't kept
        }
      },
    })
  }, [form, empty])
}
