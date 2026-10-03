import { createErrorResolver } from "@/lib/apiErrorMessages";

const KNOWN_BACKEND_MESSAGES = {
  "candidate profile with this aadhar number already exists": "errors.aadhaarExists",
  "validation failed": "errors.validationFailed",
};

const HEURISTICS = [
  { test: (m) => m.includes("aadhar") && m.includes("already exists"), key: "errors.aadhaarExists" },
];

const resolve = createErrorResolver({ messages: KNOWN_BACKEND_MESSAGES, heuristics: HEURISTICS });

export function resolveProfileErrorKey(error, { fallback = "errors.submitFailed" } = {}) {
  return resolve(error, { fallback });
}

// Which onboarding step owns each field the backend can reject, so a
// validation error can jump the wizard back to where it's fixable.
export const FIELD_TO_STEP = {
  gender: 1,
  dob: 1,
  aadhar_number: 1,
  location: 1,
  address: 1,
  profile_photo: 2,
  present_or_last_working_company: 3,
  last_day_of_working: 3,
  current_ctc: 3,
  expected_ctc: 3,
  preferred_industry: 3,
  preferred_locations: 3,
  resignation_letter: 3,
  experience_letter: 3,
  present_offer: 3,
  notice_period_prof_type: 3,
  notice_period_prof: 3,
  resume: 4,
  selected_role: 4,
  role_other_reason: 4,
};

// Per-field error key, falling back to the generic table above for anything
// not explicitly mapped (e.g. an unrecognised field name from the backend).
export const FIELD_ERROR_KEYS = {
  aadhar_number: "errors.aadhaarExists",
};
