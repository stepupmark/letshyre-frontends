import { type ContactMessage, sendContactMessage } from "@workspace/api/public"
import { useMutation } from "@tanstack/react-query"

import { apiClient } from "../lib/api-client"

export function useSendContactMessage() {
  return useMutation({
    mutationFn: (input: ContactMessage) => sendContactMessage(apiClient, input),
  })
}
