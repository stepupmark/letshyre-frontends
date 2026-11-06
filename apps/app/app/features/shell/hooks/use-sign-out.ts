import { logout, PUBLIC_HOME } from "@workspace/auth"
import { useState } from "react"

import { clearAccountData } from "@/lib/account-data"
import { api } from "@/lib/api"

export function useSignOut() {
  const [leaving, setLeaving] = useState(false)

  const signOut = async () => {
    setLeaving(true)
    clearAccountData()
    try {
      await logout(api)
    } finally {
      window.location.assign(PUBLIC_HOME)
    }
  }

  return { leaving, signOut }
}
