"use client"

import { useEffect, useRef, type MouseEvent } from "react"
import { AnimatePresence, motion } from "motion/react"

import { Camera } from "@/components/notch/mark"
import { useDemo, useNotch } from "@/components/notch/state"
import { PillBattery, PillStatus, TabBody, TabList } from "@/components/notch/tabs"

const ease = [0.16, 1, 0.3, 1] as const

export function NotchView({ mode }: { mode: "fixed" | "inline" }) {
  const { open, pinned, reduced, setOpen, pin, close, togglePinned } = useNotch()
  const { state } = useDemo()
  const rootRef = useRef<HTMLDivElement>(null)
  const openTimer = useRef<number | null>(null)
  const closeTimer = useRef<number | null>(null)
  const pinnedRef = useRef(pinned)
  const reducedRef = useRef(reduced)
  pinnedRef.current = pinned
  reducedRef.current = reduced

  const clearTimers = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current)
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
  }

  useEffect(() => clearTimers, [])

  const onEnter = () => {
    if (mode !== "fixed" || reducedRef.current || pinnedRef.current) return
    clearTimers()
    openTimer.current = window.setTimeout(() => setOpen(true), 140)
  }

  const onLeave = (event: MouseEvent) => {
    if (mode !== "fixed" || reducedRef.current || pinnedRef.current) return
    const next = event.relatedTarget
    if (next instanceof Node && rootRef.current?.contains(next)) return
    clearTimers()
    closeTimer.current = window.setTimeout(() => setOpen(false), 260)
  }

  const anchor =
    mode === "fixed"
      ? "fixed top-0 left-1/2 z-50 w-[min(34rem,calc(100vw-8.5rem))] -translate-x-1/2"
      : "absolute inset-x-0 top-0 z-10"

  return (
    <>
      {open && mode === "fixed" && pinned && !reduced ? (
        <button
          type="button"
          aria-label="Close DevNotch"
          className="fixed inset-0 z-40 cursor-default bg-black/20"
          onClick={close}
        />
      ) : null}
      <div ref={rootRef} className={anchor} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <AnimatePresence mode="sync" initial={false}>
          {open ? (
            <motion.section
              key="panel"
              role="region"
              aria-label="DevNotch"
              initial={reduced ? false : { opacity: 0, scaleX: 0.72, scaleY: 0.16 }}
              animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
              exit={reduced ? undefined : { opacity: 0, scaleX: 0.78, scaleY: 0.2 }}
              transition={{ duration: reduced ? 0 : 0.48, ease }}
              style={{
                transformOrigin: "top center",
                filter: `brightness(${state.brightness / 100})`,
              }}
              onPointerDown={() => {
                if (!reduced) pin()
              }}
              className="absolute inset-x-0 top-0 max-h-[min(78vh,560px)] overflow-y-auto rounded-b-[28px] bg-black px-4 pt-2 pb-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),0_30px_80px_rgb(0_0_0/0.55)]"
            >
              <motion.div
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduced ? 0 : 0.28, delay: reduced ? 0 : 0.1, ease }}
              >
              <div className="sticky top-0 z-10 -mx-4 bg-black px-4 pt-1 pb-3">
                {reduced ? (
                  <div className="flex justify-center py-1">
                    <Camera />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Collapse DevNotch"
                    className="mx-auto grid place-items-center py-1"
                  >
                    <Camera />
                  </button>
                )}
                <TabList />
              </div>
              <TabBody />
              {state.notice ? (
                <p role="status" className="mt-3 text-center font-mono text-[11px] text-[#60a5fa]">
                  {state.notice}
                </p>
              ) : null}
              </motion.div>
            </motion.section>
          ) : (
            <motion.button
              key="pill"
              type="button"
              aria-expanded={false}
              aria-label="Open DevNotch"
              onClick={togglePinned}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.16 }}
              className="absolute top-0 left-1/2 flex h-10 -translate-x-1/2 items-center gap-3 rounded-b-[18px] bg-black px-3.5 text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),0_16px_40px_rgb(0_0_0/0.45)]"
            >
              <PillStatus />
              <Camera />
              <PillBattery />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
