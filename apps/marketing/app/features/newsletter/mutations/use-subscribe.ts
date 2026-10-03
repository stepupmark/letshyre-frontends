import { useMutation } from "@tanstack/react-query"
import { subscribe } from "@workspace/api/public"

import { api } from "@/lib/api"

export const useSubscribe = () =>
  useMutation({ mutationFn: (email: string) => subscribe(api, email) })
