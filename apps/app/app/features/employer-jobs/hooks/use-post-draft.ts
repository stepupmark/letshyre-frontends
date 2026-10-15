import { useSession } from "@workspace/auth/react"
import { useState } from "react"

import { clearDraft, loadDraft, saveDraft } from "@/lib/draft"
import { fileStore } from "@/lib/file-store"
import { useRestoredFiles } from "@/lib/use-draft"

import type { JobValues } from "../lib/job-values"

export interface PostDraft {
  values: JobValues
  fromJd: Partial<JobValues>
}

const files = fileStore("post-job-files")

/**
 * The job being posted, kept per account so a shared device never shows one
 * employer's draft to another. The JD file goes to IndexedDB beside it.
 */
export function usePostDraft(onJd: (file: File) => void) {
  const session = useSession()
  const who =
    session.status === "signed-in"
      ? (session.user.id ?? session.user.email)
      : undefined
  const owner =
    typeof who === "string" || typeof who === "number" ? String(who) : "me"
  const key = `post-job:${owner}`
  const [keys] = useState(() => [key] as const)
  const [initial] = useState(() => loadDraft<PostDraft>(key))

  const jdChecked = useRestoredFiles(files, keys, (found) => {
    const file = found[key]
    if (file) onJd(file)
  })

  return {
    initial: initial?.values ? (initial as PostDraft) : null,
    jdChecked,
    save: (draft: PostDraft) => {
      saveDraft(key, draft)
    },
    saveJd: (file: File | null) => void files.save(key, file),
    discard: () => {
      clearDraft(key)
      void files.save(key, null)
    },
  }
}
