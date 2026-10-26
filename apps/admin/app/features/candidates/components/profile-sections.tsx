import type { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

export function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

export function Timeline({
  items,
}: {
  items: { key: string; title: ReactNode; meta: ReactNode; body?: ReactNode }[]
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.key}>
          {index > 0 && <Separator className="mb-4" />}
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.meta}</p>
          {item.body && (
            <div className="mt-2 text-sm whitespace-pre-line text-muted-foreground">
              {item.body}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
