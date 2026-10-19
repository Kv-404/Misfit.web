"use client"

import { tabs } from "@/lib/content"
import { useNotch } from "@/components/notch/state"

export function FeatureLinks() {
  const { setTab, pin, setOpen } = useNotch()

  return (
    <p className="mt-8 font-mono text-[11px] tracking-[0.18em] text-white/45 uppercase">
      {tabs.map((tab, index) => (
        <span key={tab.id}>
          {index > 0 ? <span className="px-2 text-white/20">/</span> : null}
          <a
            href={`#${tab.id}`}
            className="hover:text-white"
            onClick={() => {
              setTab(tab.id, true)
              if (window.matchMedia("(min-width: 768px)").matches) {
                pin()
                setOpen(true)
              }
            }}
          >
            {tab.name}
          </a>
        </span>
      ))}
    </p>
  )
}
