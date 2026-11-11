import { ContactChannels } from "./components/contact-channels"
import { ContactHero } from "./components/contact-hero"

export function ContactPage() {
  return (
    <div className="reading-font">
      <ContactHero />
      <ContactChannels />
    </div>
  )
}
