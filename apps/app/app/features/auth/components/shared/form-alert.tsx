import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { CircleAlert } from "lucide-react"

export function FormAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
