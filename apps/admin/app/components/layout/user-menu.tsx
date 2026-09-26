import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, LogOut } from "lucide-react";
import { authQueries, ChangePasswordDialog, useLogout } from "~/features/auth";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";

function initials(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return parts.length
    ? parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "A";
}

export function UserMenu() {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const profile = useQuery(authQueries.me());
  const logout = useLogout();
  const user = profile.data;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 gap-2 px-2"
            aria-label="Account menu"
          >
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">
                {initials(user?.name)}
              </AvatarFallback>
            </Avatar>
            {profile.isPending ? (
              <Skeleton className="hidden h-4 w-20 sm:block" />
            ) : (
              <span className="hidden max-w-40 truncate text-sm font-medium capitalize sm:inline">
                {user?.name ?? "Admin"}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setChangePasswordOpen(true)}>
            <KeyRound /> Change password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={logout.isPending}
            onSelect={() => logout.mutate()}
          >
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </>
  );
}
