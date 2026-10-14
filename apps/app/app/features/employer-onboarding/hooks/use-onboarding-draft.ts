import { useWatch, type UseFormReturn } from "react-hook-form"

import { clearDraft, loadDraft, saveDraft } from "@/lib/draft"
import { fileStore } from "@/lib/file-store"
import { useAutosave, useRestoredFiles } from "@/lib/use-draft"

import {
  STEPS,
  type Draft,
  type Values,
} from "../schemas/onboarding-form.schema"

const DRAFT = "employer-onboarding"
// the old form's draft, read once so nobody types it all again; drop after 2027-04
const LEGACY_DRAFT = "employer_onboarding_draft"
const TEXT_FIELDS = [...STEPS.company, ...STEPS.legal]

export const draftFiles = fileStore("employer-onboarding-files")

const EMPTY: Draft = {
  company_name: "",
  company_website: "",
  official_email: "",
  company_industry: "",
  linkedin_url: "",
  company_description: "",
  company_registration_number: "",
  pan_number: "",
  gst_number: "",
  address_line: "",
  address_city: "",
  address_state: "",
  address_pin: "",
}

// drafts from before the address was split keep it all on the first line
type Saved = Partial<Draft> & { company_address?: string }

export function startingDraft(email: string): Draft {
  let legacy: Saved | null = null
  try {
    const raw = localStorage.getItem(LEGACY_DRAFT)
    legacy = raw ? (JSON.parse(raw) as Saved) : null
  } catch {
    /* empty */
  }
  const { company_address, ...saved }: Saved =
    loadDraft<Saved>(DRAFT) ?? legacy ?? {}
  return {
    ...EMPTY,
    official_email: email,
    address_line: company_address ?? "",
    ...saved,
  }
}

export function discardDraft() {
  clearDraft(DRAFT)
  void draftFiles.clear()
  try {
    localStorage.removeItem(LEGACY_DRAFT)
  } catch {
    /* empty */
  }
}

/** Saves the text fields a moment after typing stops. Returns a save count. */
export function useDraftAutosave(form: UseFormReturn<Values>) {
  const text = useWatch({ control: form.control, name: TEXT_FIELDS })
  return useAutosave(text, () => {
    const values = form.getValues()
    saveDraft(
      DRAFT,
      Object.fromEntries(TEXT_FIELDS.map((key) => [key, values[key]]))
    )
  })
}

/** Puts back documents picked before a refresh. True once that's done. */
export const useStoredFiles = (form: UseFormReturn<Values>) =>
  useRestoredFiles(draftFiles, STEPS.documents, (files) => {
    for (const [name, file] of Object.entries(files))
      form.setValue(name as keyof Values, file)
  })
