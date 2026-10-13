import { useEffect, useRef, useState } from "react"
import { useWatch, type UseFormReturn } from "react-hook-form"

import { clearDraft, loadDraft, saveDraft } from "@/lib/draft"

import { clearFiles, loadFiles } from "../lib/file-store"
import {
  STEPS,
  type Draft,
  type Values,
} from "../schemas/onboarding-form.schema"

const DRAFT = "employer-onboarding"
// the old form's draft, read once so nobody types it all again; drop after 2027-04
const LEGACY_DRAFT = "employer_onboarding_draft"
const TEXT_FIELDS = [...STEPS.company, ...STEPS.legal]

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
  void clearFiles()
  try {
    localStorage.removeItem(LEGACY_DRAFT)
  } catch {
    /* empty */
  }
}

/** Saves the text fields a moment after typing stops. Returns a save count. */
export function useDraftAutosave(form: UseFormReturn<Values>) {
  const [saves, setSaves] = useState(0)
  const text = useWatch({ control: form.control, name: TEXT_FIELDS })
  const json = JSON.stringify(text)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const timer = setTimeout(() => {
      const values = form.getValues()
      saveDraft(
        DRAFT,
        Object.fromEntries(TEXT_FIELDS.map((key) => [key, values[key]]))
      )
      setSaves((n) => n + 1)
    }, 600)
    return () => {
      clearTimeout(timer)
    }
  }, [json, form])

  return saves
}

/** Puts back documents picked before a refresh. True once that's done. */
export function useStoredFiles(form: UseFormReturn<Values>) {
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    let live = true
    void loadFiles(STEPS.documents).then((files) => {
      if (!live) return
      for (const [name, file] of Object.entries(files))
        form.setValue(name as keyof Values, file)
      setRestored(true)
    })
    return () => {
      live = false
    }
  }, [form])

  return restored
}
