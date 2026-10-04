import { readSession, type User } from "@workspace/auth"
import { useSession } from "@workspace/auth/react"
import { useTranslation } from "@workspace/i18n/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { useQueryClient } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

import { SignInForm } from "./sign-in-form"

/**
 * When the session ends under an open page (it expired, or they signed out in
 * another tab), sign in over the page instead of leaving it, so nothing typed
 * is lost. A different account reloads into its own home.
 */
export function SessionGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation("auth")
  const session = useSession()
  const queryClient = useQueryClient()
  const [last, setLast] = useState<User | null>(null)
  if (session.status === "signed-in" && session.user !== last)
    setLast(session.user)

  const open = last !== null && session.status === "guest"

  return (
    <>
      {children}
      <Dialog open={open} disablePointerDismissal>
        <DialogContent showCloseButton={false} className="gap-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("sessionEnded.title")}</DialogTitle>
            <DialogDescription>{t("sessionEnded.body")}</DialogDescription>
          </DialogHeader>
          {open && (
            <SignInForm
              email={typeof last.email === "string" ? last.email : ""}
              onSignedIn={(to) => {
                const now = readSession()
                if (now.status === "signed-in" && sameUser(now.user, last))
                  void queryClient.invalidateQueries()
                else window.location.assign(to)
              }}
            />
          )}
          <a
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("sessionEnded.leave")}
          </a>
        </DialogContent>
      </Dialog>
    </>
  )
}

const emailOf = (user: User) =>
  typeof user.email === "string" ? user.email.toLowerCase() : null

const sameUser = (a: User, b: User) =>
  emailOf(a) !== null && emailOf(a) === emailOf(b)
