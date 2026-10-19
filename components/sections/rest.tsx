import { footer, githubUrl, shortcuts, specs } from "@/lib/content"

export function Shortcuts() {
  return (
    <section className="py-24" aria-labelledby="keys-heading">
      <h2 id="keys-heading" className="font-mono text-[11px] tracking-[0.22em] text-white/40 uppercase">
        Keys
      </h2>
      <p className="mt-4 max-w-[40ch] text-lg leading-relaxed text-white/70">
        esc collapses the notch. In the app, ⌘1 through ⌘6 switch tabs. On this page the number keys do it.
      </p>
      <ul className="mt-8 border-y border-white/10">
        {shortcuts.map((shortcut) => (
          <li key={shortcut.keys} className="flex items-center justify-between border-b border-white/10 py-3 last:border-b-0">
            <span className="text-sm text-white/70">{shortcut.label}</span>
            <kbd className="font-mono text-sm text-white/80">{shortcut.keys}</kbd>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Specs() {
  return (
    <section className="pb-24" aria-labelledby="runs-heading">
      <h2 id="runs-heading" className="font-mono text-[11px] tracking-[0.22em] text-white/40 uppercase">
        Runs on
      </h2>
      <dl className="mt-8 border-y border-white/10">
        {specs.map((spec) => (
          <div key={spec.label} className="grid gap-1 border-b border-white/10 py-4 last:border-b-0 sm:grid-cols-[8rem_1fr] sm:gap-6">
            <dt className="text-sm text-white/40">{spec.label}</dt>
            <dd className="text-sm text-white/85">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function Download() {
  return (
    <section id="get" className="pb-28" aria-labelledby="get-heading">
      <h2 id="get-heading" className="text-4xl font-medium tracking-[-0.03em]">
        Get it
      </h2>
      <p className="mt-4 max-w-[36ch] text-lg leading-relaxed text-white/70">
        The signed build is not up yet. The repo is the place to watch.
      </p>
      <div className="mt-8 flex items-center gap-6">
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
    </section>
  )
}

export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-8 text-sm text-white/45">
      <p>
        {footer.company}
        <span className="px-2 text-white/20">·</span>
        {footer.place}
      </p>
    </footer>
  )
}
