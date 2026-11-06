import { readSession } from "@workspace/auth"
import { clearAll as clearAssistantChats } from "@workspace/blocks/assistant-store"

import { clearAllDrafts } from "./draft"
import { clearStoredFiles } from "./file-store"

const OWNER = "drafts:owner"

function currentOwner() {
  const session = readSession()
  if (session.status !== "signed-in") return null
  const { id, email } = session.user
  if (typeof id === "string" || typeof id === "number") return String(id)
  return typeof email === "string" ? email.toLowerCase() : null
}

/** Drafts, staged files and chats this browser holds for the signed-in account. */
export function clearAccountData() {
  clearAssistantChats()
  clearAllDrafts()
  clearStoredFiles()
  try {
    localStorage.removeItem(OWNER)
  } catch {
    /* empty */
  }
}

/** Drops what another account left behind, then marks the rest as this account's. */
export function claimAccountData() {
  const owner = currentOwner()
  if (!owner) return
  try {
    const previous = localStorage.getItem(OWNER)
    if (previous && previous !== owner) clearAccountData()
    localStorage.setItem(OWNER, owner)
  } catch {
    /* without storage there are no drafts to protect */
  }
}
