import { FinalCta } from "./components/final-cta"
import { HomeFaq } from "./components/home-faq"
import { Contrast } from "./components/v2/contrast"
import { Facts } from "./components/v2/facts"
import { Features } from "./components/v2/features"
import { Hero } from "./components/v2/hero"

export function HomeV2Page() {
  return (
    <>
      <Hero />
      <Facts />
      <Contrast />
      <Features />
      <HomeFaq />
      <FinalCta />
    </>
  )
}
