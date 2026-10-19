import { SiteFrame } from "@/components/notch/site-frame"
import { Features } from "@/components/sections/features"
import { Hero } from "@/components/sections/hero"
import { Download, Footer, Shortcuts, Specs } from "@/components/sections/rest"

export default function Page() {
  return (
    <SiteFrame>
      <main
        id="main"
        className="mx-auto w-[var(--column)] px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[30vh] md:pt-32"
      >
        <Hero />
        <Features />
        <Shortcuts />
        <Specs />
        <Download />
        <Footer />
      </main>
    </SiteFrame>
  )
}
