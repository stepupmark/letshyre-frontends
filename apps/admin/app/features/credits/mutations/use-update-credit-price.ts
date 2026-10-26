import { useMutation } from "@tanstack/react-query"

import { creditsKeys } from "../queries/credits.queries"
import { creditsService } from "../services/credits.service"

export function useUpdateCreditPrice() {
  return useMutation({
    mutationFn: ({ id, price }: { id: string; price: string }) =>
      creditsService.updatePrice(id, price),
    meta: {
      successMessage: "Credit price updated",
      invalidates: [creditsKeys.all],
    },
  })
}
