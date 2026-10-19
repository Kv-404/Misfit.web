"use client"

import { useNotch } from "@/components/notch/state"

export function MobileScrim() {
  const { open, reduced, close } = useNotch()
  if (!open || reduced) return null

  return (
    <button
      type="button"
      aria-label="Close DevNotch"
      className="absolute inset-0 z-0 md:hidden"
      onClick={close}
    />
  )
}
