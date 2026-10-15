import { useSession } from "@workspace/auth/react"
import { useAssistant, type AssistantLabels } from "@workspace/blocks/assistant"
import { useTranslation } from "@workspace/i18n/react"

import { undoToast } from "@/lib/undo-toast"

import type { Side } from "../lib/prompts"
import { sendMessage } from "../services/assistant.service"

/** One conversation per person and side, shared by the page and the sheet. */
export function useAppAssistant(side: Side) {
  const { t } = useTranslation(["assistant", "common"])
  const session = useSession()
  const who =
    session.status === "signed-in"
      ? (session.user.id ?? session.user.email)
      : undefined
  const user =
    typeof who === "string" || typeof who === "number" ? String(who) : "me"
  const chat = useAssistant(`${side}:${user}`, sendMessage)

  const labels: AssistantLabels = {
    log: t("log"),
    you: t("you"),
    assistant: t("assistant"),
    input: t("input"),
    send: t("send"),
    stop: t("stop"),
    thinking: t("thinking"),
    slow: t("slow"),
    stopped: t("stopped"),
    failed: t("failed"),
    retry: t("retry"),
    clear: t("clear"),
    copy: t("copy"),
    copied: t("copied"),
    latest: t("latest"),
  }

  const offerUndo = (undo: () => void) => {
    undoToast(t("cleared"), t("common:undo"), undo)
  }

  return { chat, labels, offerUndo }
}
