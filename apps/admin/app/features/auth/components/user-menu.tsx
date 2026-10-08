import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Keyboard, KeyRound, LogOut } from "lucide-react"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { initials } from "@/lib/format"
import { useLogout } from "../mutations/use-logout"
import { authQueries } from "../queries/auth.queries"
import { ChangePasswordDialog } from "./change-password-dialog"

export function UserMenu() {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const profile = useQuery(authQueries.me())
  const logout = useLogout()
  const user = profile.data

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="h-9 gap-2 px-2"
              aria-label="Account menu"
            />
          }
        >
          <Avatar className="size-7">
            <AvatarFallback className="text-xs text-foreground">
              {initials(user?.name, "A")}
            </AvatarFallback>
          </Avatar>
          {profile.isPending ? (
            <Skeleton className="hidden h-4 w-20 sm:block" />
          ) : (
            <span className="hidden max-w-40 truncate text-sm font-medium capitalize sm:inline">
              {user?.name ?? "Admin"}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-medium capitalize">
                {user?.name ?? "Admin"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {profile.isError
                  ? "Couldn't load your profile"
                  : (user?.email ?? "")}
              </p>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setChangePasswordOpen(true)
            }}
          >
            <KeyRound /> Change password
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setShortcutsOpen(true)
            }}
          >
            <Keyboard /> Keyboard shortcuts
            <DropdownMenuShortcut>?</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={logout.isPending}
            onClick={() => {
              logout.mutate()
            }}
          >
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
      <KeyboardShortcuts open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  )
}
