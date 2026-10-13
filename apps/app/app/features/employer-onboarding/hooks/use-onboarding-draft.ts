import { useEffect, useRef, useState } from "react"
import { useWatch, type UseFormReturn } from "react-hook-form"

import { clearDraft, loadDraft, saveDraft } from "@/lib/draft"

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
  company_address: "",
}

export function startingDraft(email: string): Draft {
  let legacy: Partial<Draft> | null = null
  try {
    const raw = localStorage.getItem(LEGACY_DRAFT)
    legacy = raw ? (JSON.parse(raw) as Partial<Draft>) : null
  } catch {
    /* empty */
  }
  const saved = loadDraft<Draft>(DRAFT) ?? legacy ?? {}
  return { ...EMPTY, official_email: email, ...saved }
}

export function discardDraft() {
  clearDraft(DRAFT)
  try {
    localStorage.removeItem(LEGACY_DRAFT)
  } catch {
    /* empty */
  }
}

/** Saves the text fields a moment after typing stops; files can't be stored. Returns a save count. */
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
