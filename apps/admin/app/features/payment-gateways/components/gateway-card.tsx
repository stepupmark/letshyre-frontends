import { useState } from "react"
import { Copy, Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { maskId } from "@/lib/format"
import type { Gateway } from "../schemas/payment-gateways.schema"
import { providerLabel } from "../utils/gateway-values"

async function copy(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} copied`)
  } catch {
    toast.error("Couldn't copy to the clipboard")
  }
}

function CredentialRow({
  label,
  value,
  secret = false,
}: {
  label: string
  value: string
  secret?: boolean
}) {
  const [visible, setVisible] = useState(!secret)

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-sm">
          {visible ? value || "—" : maskId(value)}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        {secret && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={visible ? `Hide ${label}` : `Show ${label}`}
            onClick={() => {
              setVisible((current) => !current)
            }}
          >
            {visible ? <EyeOff /> : <Eye />}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Copy ${label}`}
          disabled={!value}
          onClick={() => void copy(value, label)}
        >
          <Copy />
        </Button>
      </div>
    </div>
  )
}

interface GatewayCardProps {
  gateway: Gateway
  onEdit: () => void
  onDelete: () => void
}

export function GatewayCard({ gateway, onEdit, onDelete }: GatewayCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {gateway.displayName}
          <StatusBadge tone={gateway.sandbox ? "warning" : "success"}>
            {gateway.sandbox ? "Sandbox" : "Live"}
          </StatusBadge>
        </CardTitle>
        <CardDescription>{providerLabel(gateway.provider)}</CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${gateway.displayName}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        <CredentialRow label="Client ID" value={gateway.clientId} />
        <CredentialRow
          label="Client secret"
          value={gateway.clientSecret}
          secret
        />
      </CardContent>
    </Card>
  )
}
