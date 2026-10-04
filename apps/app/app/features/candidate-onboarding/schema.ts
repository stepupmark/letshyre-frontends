import { z } from "zod"

const D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]
const P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]

/** 12 digits, not starting with 0 or 1, with a valid Verhoeff check digit. */
export function isAadhaar(value: string) {
  const digits = value.replace(/\D/g, "")
  if (!/^[2-9]\d{11}$/.test(digits)) return false
  let c = 0
  for (let i = 0; i < digits.length; i++) {
    const d = Number(digits[digits.length - 1 - i])
    c = D[c]?.[P[i % 8]?.[d] ?? 0] ?? 0
  }
  return c === 0
}

/** 18 or older on `today`. Dates are yyyy-mm-dd, as from a date input. */
export function isAdult(dob: string, today = new Date()) {
  const [y, m, d] = dob.split("-").map(Number)
  if (!y || !m || !d) return false
  const age =
    today.getFullYear() -
    y -
    (today.getMonth() + 1 < m ||
    (today.getMonth() + 1 === m && today.getDate() < d)
      ? 1
      : 0)
  return age >= 18 && age < 100
}

const oneOf = (list: readonly string[], value: string) => list.includes(value)

export const GENDERS = ["Male", "Female", "Other"] as const
export const PROOF_TYPES = ["Relieving Letter", "Offer Letter"] as const

type Messages = Record<
  | "gender"
  | "dob"
  | "adult"
  | "aadhaar"
  | "location"
  | "address"
  | "company"
  | "lastDay"
  | "ctc"
  | "expectedLow"
  | "industry"
  | "locations"
  | "proofType",
  string
>

const ctc = (message: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{1,3}(\.\d{1,2})?$/, message)

export const makeSchema = (m: Messages) =>
  z
    .object({
      gender: z.string().refine((v) => oneOf(GENDERS, v), m.gender),
      dob: z
        .string()
        .min(1, m.dob)
        .refine((v) => isAdult(v), m.adult),
      aadhar_number: z.string().refine(isAadhaar, m.aadhaar),
      location: z.string().trim().min(2, m.location),
      address: z.string().trim().min(10, m.address),
      present_or_last_working_company: z.string().trim().min(2, m.company),
      last_day_of_working: z.string().min(1, m.lastDay),
      current_ctc: ctc(m.ctc),
      expected_ctc: ctc(m.ctc),
      preferred_industry: z.string().min(1, m.industry),
      preferred_locations: z.array(z.string()).min(1, m.locations),
      notice_period_proof_type: z
        .string()
        .refine((v) => oneOf(PROOF_TYPES, v), m.proofType),
    })
    .refine((v) => Number(v.expected_ctc) >= Number(v.current_ctc), {
      path: ["expected_ctc"],
      message: m.expectedLow,
    })

export type Values = z.infer<ReturnType<typeof makeSchema>>

export const STEP_FIELDS = {
  you: ["gender", "dob", "aadhar_number", "location", "address"],
  work: [
    "present_or_last_working_company",
    "last_day_of_working",
    "current_ctc",
    "expected_ctc",
    "preferred_industry",
    "preferred_locations",
    "notice_period_proof_type",
  ],
} as const satisfies Record<string, readonly (keyof Values)[]>
