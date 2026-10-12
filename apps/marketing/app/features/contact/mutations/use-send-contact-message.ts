import { type ContactMessage, sendContactMessage } from "@workspace/api/public"
import { useMutation } from "@tanstack/react-query"

import { api } from "@/lib/api"

export function useSendContactMessage() {
  return useMutation({
    mutationFn: (input: ContactMessage) => sendContactMessage(api, input),
  })
}
