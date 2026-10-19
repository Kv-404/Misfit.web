"use client"

import { useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

import GradientASCII from "@/components/background/GradientASCII"
import { NotchView } from "@/components/notch/notch-view"
import { SmoothScroll } from "@/components/notch/smooth-scroll"
import { DemoProvider, NotchProvider, useNotch } from "@/components/notch/state"

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <NotchProvider>
      <GradientASCII
        className="is-page-bg"
        colors={["#05070c", "#0c1c38", "#1d4ed8", "#7dd3fc"]}
        shape="horizon"
        cellSize={15}
        density={0.8}
        glyphOpacity={0.82}
        glow={0.28}
        softness={0.6}
        flow={0.4}
        speed={0.55}
        gradientOpacity={0.7}
        grain={0.05}
        mouseInteraction
        clickEffect="wave"
        fontFamily="var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
      />
      <div className="relative z-10">
        <SmoothScroll />
        <Wordmarks />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-black"
        >
          Skip to content
        </a>
        <DemoProvider>
          <NotchHost />
        </DemoProvider>
        {children}
      </div>
    </NotchProvider>
  )
}

function Wordmarks() {
  const { open } = useNotch()

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 hidden items-center justify-between px-6 py-4 text-[11px] font-medium tracking-[0.22em] uppercase transition-opacity duration-300 md:flex ${
        open ? "opacity-100" : "opacity-40"
      } hover:opacity-100`}
    >
      <span>Misfit</span>
      <span>DevNotch</span>
    </div>
  )
}

function NotchHost() {
  const [inline, setInline] = useState(false)
  const [slot, setSlot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)")
    const apply = () => {
      const narrow = !media.matches
      setInline(narrow)
      setSlot(narrow ? document.getElementById("notch-slot") : null)
    }
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [])

  if (inline) {
    if (!slot) return null
    return createPortal(<NotchView mode="inline" />, slot)
  }

  return (
    <div className="max-md:hidden">
      <NotchView mode="fixed" />
    </div>
  )
}
