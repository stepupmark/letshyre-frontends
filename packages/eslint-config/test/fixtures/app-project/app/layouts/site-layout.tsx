import { PricingPage } from "@/features/pricing"

export function SiteLayout({ title }: { title: string }) {
  return (
    <main className="mx-auto min-h-svh max-w-xl bg-background ps-4 pt-4 text-foreground">
      <h1>{title}</h1>
      <PricingPage />
    </main>
  )
}
