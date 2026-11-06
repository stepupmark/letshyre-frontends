import { useMutation, useQueryClient } from "@tanstack/react-query"

import { myProfileQuery } from "../queries/candidate-onboarding.queries"
import {
  submitProfile,
  uploadResume,
} from "../services/candidate-onboarding.service"

export const useUploadResume = ({
  onProgress,
  onUploaded,
}: {
  onProgress: (fraction: number) => void
  onUploaded: (jobId: string, file: File) => void
}) =>
  useMutation({
    mutationFn: (file: File) => uploadResume(file, onProgress),
    onSuccess: onUploaded,
  })

export const useSubmitProfile = ({
  onProgress,
  onSubmitted,
  onFailed,
}: {
  onProgress: (fraction: number) => void
  onSubmitted: () => void
  onFailed: (error: Error) => void
}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (build: () => FormData) => submitProfile(build(), onProgress),
    onSuccess: () => {
      queryClient.setQueryData(myProfileQuery().queryKey, (old) => ({
        ...old,
        is_profile_complete: true,
      }))
      onSubmitted()
    },
    onError: onFailed,
  })
}
