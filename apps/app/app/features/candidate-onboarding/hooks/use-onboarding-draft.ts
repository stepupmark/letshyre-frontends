import { useEffect, useRef, useState } from "react"
import { useWatch, type UseFormReturn } from "react-hook-form"

import { clearDraft, loadDraft, saveDraft } from "@/lib/draft"
import { fileStore } from "@/lib/file-store"

import { EMPTY_RESUME, type ResumeState } from "../lib/resume-state"
import {
  FILE_FIELDS,
  type TextField,
  type Values,
} from "../schemas/onboarding-form.schema"

const DRAFT = "candidate-onboarding"
// the legacy wizard's zustand draft, picked up once; drop after 2027-04
const LEGACY_DRAFT = "employee-profile-draft"

export const draftFiles = fileStore("candidate-onboarding-files")

const EMPTY: Pick<Values, TextField> = {
  gender: "",
  dob: "",
  aadhar_number: "",
  address_line: "",
  address_city: "",
  address_state: "",
  address_pin: "",
  present_or_last_working_company: "",
  last_day_of_working: "",
  current_ctc: "",
  expected_ctc: "",
  preferred_industry: "",
  preferred_locations: [],
  notice_period_proof_type: "",
}
const TEXT_FIELDS = Object.keys(EMPTY) as TextField[]

// drafts from before the address was split
type Saved = Partial<Values> & { location?: string; address?: string }

interface Draft {
  values: Saved
  resume: Partial<ResumeState>
}

function legacyDraft(): Saved {
  try {
    const raw = localStorage.getItem(LEGACY_DRAFT)
    return raw
      ? ((JSON.parse(raw) as { state?: { formData?: Saved } }).state
          ?.formData ?? {})
      : {}
  } catch {
    return {}
  }
}

export function startingDraft() {
  const draft = loadDraft<Draft>(DRAFT)
  const { location, address, ...saved } = draft?.values ?? legacyDraft()
  const values = {
    ...EMPTY,
    address_line: address ?? "",
    address_city: location ?? "",
    ...Object.fromEntries(
      TEXT_FIELDS.filter((key) => key in saved).map((key) => [key, saved[key]])
    ),
  }
  return {
    values: values as Partial<Values>,
    resume: { ...EMPTY_RESUME, ...draft?.resume, file: null },
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

/** Saves the answers a moment after typing stops. Returns a save count. */
export function useDraftAutosave(
  form: UseFormReturn<Values>,
  resume: ResumeState
) {
  const [saves, setSaves] = useState(0)
  const text = useWatch({ control: form.control, name: TEXT_FIELDS })
  const json = JSON.stringify([text, { ...resume, file: null }])
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const timer = setTimeout(() => {
      const values = form.getValues()
      saveDraft(DRAFT, {
        values: Object.fromEntries(
          TEXT_FIELDS.map((key) => [key, values[key]])
        ),
        resume: { ...resume, file: null },
      })
      setSaves((n) => n + 1)
    }, 600)
    return () => {
      clearTimeout(timer)
    }
  }, [json, form, resume])

  return saves
}

/** Puts back files picked before a refresh. True once that's done. */
export function useStoredFiles(
  form: UseFormReturn<Values>,
  onResume: (file: File) => void
) {
  const [restored, setRestored] = useState(false)
  const restore = useRef(onResume)

  useEffect(() => {
    let live = true
    void draftFiles.load([...FILE_FIELDS, "resume"]).then((files) => {
      if (!live) return
      const { resume, ...rest } = files
      for (const [name, file] of Object.entries(rest))
        form.setValue(name as (typeof FILE_FIELDS)[number], file)
      if (resume) restore.current(resume)
      setRestored(true)
    })
    return () => {
      live = false
    }
  }, [form])

  return restored
}
