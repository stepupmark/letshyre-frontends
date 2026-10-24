import { logout, PUBLIC_HOME } from "@workspace/auth"
import { clearAll as clearAssistantChats } from "@workspace/blocks/assistant-store"
import { useState } from "react"

import { api } from "@/lib/api"
import { clearAllDrafts } from "@/lib/draft"
import { clearStoredFiles } from "@/lib/file-store"

export function useSignOut() {
  const [leaving, setLeaving] = useState(false)

  const signOut = async () => {
    setLeaving(true)
    clearAssistantChats()
    clearAllDrafts()
    clearStoredFiles()
    try {
      await logout(api)
    } finally {
      window.location.assign(PUBLIC_HOME)
    }
  }

  return { leaving, signOut }
}
