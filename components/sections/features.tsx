import { tabs } from "@/lib/content"

export function Features() {
  return (
    <div>
      {tabs.map((tab) => (
        <section
          key={tab.id}
          id={tab.id}
          data-feature={tab.id}
          className="feature flex min-h-[70svh] flex-col justify-center"
        >
          <p className="kicker font-mono text-[11px] tracking-[0.22em]">{tab.index}</p>
          <h2 className="mt-4 text-4xl font-medium tracking-[-0.03em] sm:text-5xl">{tab.name}</h2>
          <p className="lede mt-5 max-w-[38ch] text-lg leading-relaxed">{tab.body}</p>
        </section>
      ))}
    </div>
  )
}
