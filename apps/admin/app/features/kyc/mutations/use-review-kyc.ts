import { useMutation } from "@tanstack/react-query"
import { patchQueries } from "~/lib/query/optimistic"
import { kycKeys } from "../queries/kyc.queries"
import { kycService } from "../services/kyc.service"

// employer rows embed their KYC, so their cache goes stale too
const invalidates = [kycKeys.all, ["employers"]]

type KycDetail = Awaited<ReturnType<typeof kycService.detail>>

export function useApproveKyc() {
  return useMutation({
    mutationFn: (id: string) => kycService.review(id, "Verified"),
    onMutate: async (id) => ({
      rollback: await patchQueries<KycDetail>(kycKeys.detail(id), (kyc) => ({
        ...kyc,
        kyc_status: "Verified",
      })),
    }),
    onError: (_error, _variables, context) => context?.rollback(),
    meta: { successMessage: "KYC approved", invalidates },
  })
}

export function useRejectKyc() {
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
      kycService.review(id, "Rejected", remarks),
    onMutate: async ({ id, remarks }) => ({
      rollback: await patchQueries<KycDetail>(kycKeys.detail(id), (kyc) => ({
        ...kyc,
        kyc_status: "Rejected",
        verification_remarks: remarks,
      })),
    }),
    onError: (_error, _variables, context) => context?.rollback(),
    meta: { successMessage: "KYC rejected", invalidates },
  })
}
