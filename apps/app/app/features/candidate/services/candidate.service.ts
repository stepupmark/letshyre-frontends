import { api } from "@/lib/api"

/** Same endpoint with a body saves; only the fields sent change. */
export async function saveOwnProfile(fields: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.append(key, value)
  await api.post("user/v1/candidate_profile/", form)
}
