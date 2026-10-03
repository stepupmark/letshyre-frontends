import { ContactForm } from "@/features/contact"
import { PlanCard } from "./components/plan-card"

export function PricingPage() {
  return (
    <section className="bg-background">
      <PlanCard />
      <ContactForm />
    </section>
  )
}
