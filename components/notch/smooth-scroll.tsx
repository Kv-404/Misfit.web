"use client"

import { useEffect, useRef } from "react"
import Lenis from "lenis"

const DESKTOP = "(hover: hover) and (pointer: fine)"
const REDUCED = "(prefers-reduced-motion: reduce)"

/**
 * Smooths wheel scrolling on a fine pointer. It stays off for touch and
 * for reduced motion so the fixed notch is never stuck to a transformed
 * wrapper. Lenis here scrolls the window, which keeps `position: fixed`.
 */
export function SmoothScroll() {
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP)
    const reduced = window.matchMedia(REDUCED)
    let lenis: Lenis | null = null
    let previous = ""

    const stop = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = null
      lenis?.destroy()
      lenis = null
      document.documentElement.style.scrollBehavior = previous
    }

    const start = () => {
      if (lenis) return
      previous = document.documentElement.style.scrollBehavior
      document.documentElement.style.scrollBehavior = "auto"
      lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.18 })
      const loop = (time: number) => {
        lenis?.raf(time)
        frame.current = requestAnimationFrame(loop)
      }
      frame.current = requestAnimationFrame(loop)
    }

    const sync = () => {
      if (desktop.matches && !reduced.matches) start()
      else stop()
    }

    sync()
    desktop.addEventListener("change", sync)
    reduced.addEventListener("change", sync)
    return () => {
      desktop.removeEventListener("change", sync)
      reduced.removeEventListener("change", sync)
      stop()
    }
  }, [])

  return null
}
