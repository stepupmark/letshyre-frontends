import { useMutation } from "@tanstack/react-query";
import { kycKeys } from "../queries/kyc.queries";
import { kycService } from "../services/kyc.service";

// employer rows embed their KYC, so their cache goes stale too
const invalidates = [kycKeys.all, ["employers"]];

export function useApproveKyc() {
  return useMutation({
    mutationFn: (id: string) => kycService.review(id, "Verified"),
    meta: { successMessage: "KYC approved", invalidates },
  });
}

export function useRejectKyc() {
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
      kycService.review(id, "Rejected", remarks),
    meta: { successMessage: "KYC rejected", invalidates },
  });
}
