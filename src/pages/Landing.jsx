import { Hero } from "@/components/sections/Hero"
import { BannerSlider } from "@/components/sections/BannerSlider"
import { ValueProposition } from "@/components/sections/ValueProposition"
import { Services } from "@/components/sections/Services"
import { Statistics } from "@/components/sections/Statistics"
import { Testimonials } from "@/components/sections/Testimonials"
import { CallToAction } from "@/components/sections/CallToAction"

export function Landing() {
  return (
    <main className="relative">
      <Hero />
      <BannerSlider />
      <ValueProposition />
      <Services showFilters={false} maxItems={4} />
      <Statistics />
      <Testimonials />
      <CallToAction />
    </main>
  )
}
