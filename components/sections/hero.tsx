import { githubUrl, hero } from "@/lib/content"
import { FeatureLinks } from "@/components/sections/feature-links"
import { MobileScrim } from "@/components/sections/mobile-scrim"

export function Hero() {
  return (
    <header className="md:flex md:min-h-[calc(100svh-8rem)] md:flex-col md:justify-end md:pb-16">
      <div className="md:hidden">
        <div className="overflow-hidden rounded-[22px] border border-white/10 bg-black shadow-[0_40px_120px_rgb(0_0_0/0.45)]">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
            <Traffic />
            <Traffic />
            <Traffic />
            <span className="ml-2 font-mono text-[10px] tracking-[0.22em] text-white/40">MISFIT</span>
          </div>
          <div className="relative min-h-[540px] bg-[#050505]">
            <MobileScrim />
            <div id="notch-slot" />
            <p className="pointer-events-none absolute top-16 right-0 left-0 text-center font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">
              Tap the notch
            </p>
          </div>
        </div>
      </div>

      <div className="pt-16 md:pt-0">
        <h1 className="max-w-[16ch] text-[2.6rem] leading-[1.02] font-medium tracking-[-0.035em] text-balance sm:max-w-none sm:text-6xl">
          {hero.lead} <span className="text-white/45">{hero.rest}</span>
        </h1>
        <FeatureLinks />
        <div className="mt-10 flex items-center gap-6">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-medium text-black"
          >
            GitHub
          </a>
          <span className="text-sm text-white/45">Build soon</span>
        </div>
      </div>
    </header>
  )
}

function Traffic() {
  return <span className="size-2 rounded-full bg-white/15" aria-hidden />
}
