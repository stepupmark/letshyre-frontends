import { safeUrl } from "@workspace/api"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

import { StatusBadge, type StatusTone } from "@/components/status-badge"
import { initials } from "@/lib/format"

const tones: Record<string, StatusTone> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
}

export function KycStatusBadge({
  status,
}: {
  status: string | null | undefined
}) {
  const label = status || "Not submitted"
  return (
    <StatusBadge tone={tones[label.toLowerCase()] ?? "neutral"}>
      {label}
    </StatusBadge>
  )
}

export function CompanyAvatar({
  name,
  logo,
  className,
}: {
  name: string | null | undefined
  logo: string | null | undefined
  className?: string
}) {
  return (
    <Avatar className={className}>
      <AvatarImage src={safeUrl(logo) ?? undefined} alt="" />
      <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
    </Avatar>
  )
}
