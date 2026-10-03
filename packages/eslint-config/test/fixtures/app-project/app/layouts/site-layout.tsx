import { PricingPage } from "@/features/pricing"

export function SiteLayout({ title }: { title: string }) {
  return (
    <main className="bg-background text-foreground ps-4">
      <h1>{title}</h1>
      <PricingPage />
    </main>
  )
}
