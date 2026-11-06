import { useMutation, useQueryClient } from "@tanstack/react-query"

import { SHARED_LINKS_KEY, sharedLinksQuery } from "../queries/share.queries"
import type {
  ShareLink,
  ShareValues,
  SharedLink,
} from "../schemas/share.schema"
import {
  createShareLink,
  deleteSharedLink,
  updateSharedLink,
} from "../services/share.service"

export const useCreateShareLink = (
  unlockId: string,
  {
    onCreated,
    onFailed,
  }: { onCreated: (link: ShareLink) => void; onFailed: (error: Error) => void }
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ShareValues) => createShareLink(unlockId, values),
    onSuccess: async (link) => {
      onCreated(link)
      await queryClient.invalidateQueries({ queryKey: SHARED_LINKS_KEY })
    },
    onError: onFailed,
  })
}

export const useExtendSharedLink = (
  id: string,
  { onSaved, onFailed }: { onSaved: () => void; onFailed: () => void }
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (change: { days: number; views: number }) =>
      updateSharedLink(id, {
        extend_expiry_days: change.days,
        max_views: change.views,
      }),
    onSuccess: onSaved,
    onError: onFailed,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: SHARED_LINKS_KEY }),
  })
}

/** Shows the change on the page at once and puts it back if the server refuses. */
export const useSetLinkActive = (
  page: number,
  {
    onDone,
    onFailed,
  }: {
    onDone: (link: SharedLink, active: boolean) => void
    onFailed: () => void
  }
) => {
  const queryClient = useQueryClient()
  const key = sharedLinksQuery(page).queryKey
  return useMutation({
    mutationFn: ({ link, active }: { link: SharedLink; active: boolean }) =>
      updateSharedLink(link.id, { is_active: active }),
    onMutate: ({ link, active }) => {
      queryClient.setQueryData(key, (current) =>
        current
          ? {
              ...current,
              results: current.results.map((row) =>
                row.id === link.id ? { ...row, is_active: active } : row
              ),
            }
          : current
      )
    },
    onSuccess: (_, { link, active }) => {
      onDone(link, active)
    },
    onError: onFailed,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: SHARED_LINKS_KEY }),
  })
}

export const useDeleteSharedLink = ({
  onDeleted,
  onFailed,
}: {
  onDeleted: () => void
  onFailed: () => void
}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (link: SharedLink) => deleteSharedLink(link.id),
    onSuccess: onDeleted,
    onError: onFailed,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: SHARED_LINKS_KEY }),
  })
}
