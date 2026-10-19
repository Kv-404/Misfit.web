export function Camera() {
  return (
    <span className="relative grid size-5 shrink-0 place-items-center" aria-hidden>
      <span className="absolute inset-0 rounded-full bg-neutral-950 ring-1 ring-white/15" />
      <span className="relative size-2 rounded-full bg-gradient-to-br from-zinc-600 to-black ring-1 ring-white/10" />
      <span className="absolute top-0.5 right-0.5 size-1 rounded-full bg-[#60a5fa] shadow-[0_0_8px_#60a5fa]" />
    </span>
  )
}

export function Bars({
  count,
  active,
  className = "",
}: {
  count: number
  active: boolean
  className?: string
}) {
  return (
    <span className={`flex h-3.5 items-end gap-[2px] ${className}`} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={`w-[3px] rounded-full bg-[#60a5fa] ${active ? "eq-bar" : ""}`}
          style={{
            height: "100%",
            animationDelay: `${index * 0.08}s`,
            animationDuration: `${0.75 + (index % 4) * 0.12}s`,
            transform: active ? undefined : "scaleY(0.3)",
          }}
        />
      ))}
    </span>
  )
}

export function BatteryIcon({ charging }: { charging: boolean }) {
  return (
    <svg width="18" height="11" viewBox="0 0 18 11" aria-hidden className="shrink-0">
      <rect x="0.5" y="0.5" width="15" height="10" rx="2" stroke="white" strokeOpacity="0.75" fill="none" />
      <rect x="16" y="3.5" width="1.5" height="4" rx="0.5" fill="white" fillOpacity="0.75" />
      <rect x="2" y="2" width="10" height="7" rx="1" fill={charging ? "#60a5fa" : "white"} />
    </svg>
  )
}
