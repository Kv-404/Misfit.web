"use client"

import { useEffect, useState, type DragEvent, type ReactNode } from "react"

import { tabs, type TabId } from "@/lib/content"
import {
  battery,
  formatBytes,
  formatClock,
  formatRate,
  formatUptime,
  ipAddress,
  kindFromText,
  noteCounts,
  shelfCopyValue,
  track,
  transformBase64,
} from "@/lib/demo"
import { Bars, BatteryIcon } from "@/components/notch/mark"
import { useDemo, useNotch } from "@/components/notch/state"

export function PillStatus() {
  const { tab } = useNotch()
  const { state } = useDemo()
  const cpu = Math.round(state.cpu[state.cpu.length - 1] ?? 0)
  const alive = state.ports.filter((port) => port.alive).length

  let label = track.title
  if (tab === "shelf") label = `${state.shelf.length} stashed`
  if (tab === "notes") label = "Scratch"
  if (tab === "stats") label = `CPU ${cpu}%`
  if (tab === "ports") label = `${alive} listening`
  if (tab === "tools") label = "Tools"

  return (
    <span className="flex w-28 items-center gap-2">
      {tab === "home" ? (
        <Bars count={4} active={state.playing} />
      ) : (
        <span className="size-1.5 shrink-0 rounded-full bg-[#60a5fa]" />
      )}
      <span className="truncate font-mono text-[11px] text-white/80">{label}</span>
    </span>
  )
}

export function PillBattery() {
  return (
    <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/80 tabular-nums">
      <BatteryIcon charging={battery.charging} />
      {battery.percent}%
    </span>
  )
}

export function TabList() {
  const { tab, setTab } = useNotch()

  return (
    <div role="tablist" aria-label="DevNotch" className="flex flex-wrap justify-center gap-x-0.5 gap-y-1">
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          id={`devnotch-tab-${item.id}`}
          aria-selected={tab === item.id}
          aria-controls={`devnotch-panel-${item.id}`}
          onClick={() => setTab(item.id, true)}
          className={`rounded-full px-1.5 py-1 text-[11px] sm:px-2 sm:text-[12px] ${
            tab === item.id ? "bg-white/10 text-white" : "text-white/40 hover:text-white/75"
          }`}
        >
          {item.name}
          <span className="ml-1 hidden font-mono text-[10px] text-white/30 sm:inline">{item.key}</span>
        </button>
      ))}
    </div>
  )
}

export function TabBody() {
  const { tab } = useNotch()

  return (
    <div className="min-h-[280px]">
      <HomePanel active={tab === "home"} />
      <ShelfPanel active={tab === "shelf"} />
      <NotesPanel active={tab === "notes"} />
      <StatsPanel active={tab === "stats"} />
      <PortsPanel active={tab === "ports"} />
      <ToolsPanel active={tab === "tools"} />
    </div>
  )
}

function panelProps(id: TabId, active: boolean) {
  return {
    role: "tabpanel" as const,
    id: `devnotch-panel-${id}`,
    "aria-labelledby": `devnotch-tab-${id}`,
    hidden: !active,
  }
}

function HomePanel({ active }: { active: boolean }) {
  const { state, dispatch, copy } = useDemo()
  const elapsed = (state.progress / 100) * track.durationSec

  return (
    <div {...panelProps("home", active)} className="space-y-4">
      <div className="flex gap-3">
        <div
          className="size-16 shrink-0 rounded-xl bg-[radial-gradient(circle_at_30%_20%,#93c5fd,transparent_55%),linear-gradient(160deg,#1d4ed8,#09090b)]"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{track.title}</p>
              <p className="truncate text-xs text-white/45">{track.artist}</p>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: "toggle-play" })}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-black"
              aria-label={state.playing ? "Pause" : "Play"}
            >
              {state.playing ? <PauseIcon /> : <PlayIcon />}
            </button>
          </div>
          <div className="mt-3 h-px bg-white/10">
            <div className="h-px bg-[#60a5fa]" style={{ width: `${state.progress}%` }} />
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-white/40 tabular-nums">
            <span>{formatClock(elapsed)}</span>
            <span>{formatClock(track.durationSec)}</span>
          </div>
        </div>
      </div>
      <Bars count={16} active={state.playing} className="h-8 w-full justify-between" />
      <div className="space-y-3 border-t border-white/10 pt-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-white/45">Local IP</span>
          <span className="flex items-center gap-2 font-mono text-[13px]">
            {ipAddress}
            <SmallButton onClick={() => copy(ipAddress, "Copied IP")}>Copy</SmallButton>
          </span>
        </div>
        <Slider
          label="Volume"
          value={state.volume}
          onChange={(value) => dispatch({ type: "volume", value })}
        />
        <Slider
          label="Brightness"
          value={state.brightness}
          min={20}
          onChange={(value) => dispatch({ type: "brightness", value })}
        />
      </div>
    </div>
  )
}

function ShelfPanel({ active }: { active: boolean }) {
  const { state, dispatch, notify, copy, addSample } = useDemo()
  const [over, setOver] = useState(false)

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setOver(false)
    const files = [...event.dataTransfer.files]
    if (files.length) {
      files.slice(0, 4).forEach((file) => {
        dispatch({
          type: "add-shelf",
          item: {
            id: crypto.randomUUID(),
            name: file.name,
            kind: file.type.startsWith("image/") ? "image" : "file",
            meta: formatBytes(file.size),
          },
        })
      })
      notify(files.length === 1 ? `Stashed ${files[0].name}` : `Stashed ${files.length} files`)
      return
    }
    const text = event.dataTransfer.getData("text/plain").trim()
    if (!text) return
    const kind = kindFromText(text)
    dispatch({
      type: "add-shelf",
      item: {
        id: crypto.randomUUID(),
        name: text.slice(0, 80),
        kind,
        meta: kind === "url" ? "link" : "text",
      },
    })
    notify("Stashed")
  }

  return (
    <div {...panelProps("shelf", active)}>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border border-dashed px-3 py-3 ${
          over ? "border-[#60a5fa] bg-[#60a5fa]/10" : "border-white/15"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-white/45">Drop a file, snippet, or URL</p>
          <SmallButton onClick={addSample}>Add sample</SmallButton>
        </div>
        <ul className="mt-2">
          {state.shelf.map((item) => (
            <li key={item.id} className="flex items-center gap-3 border-t border-white/10 py-2">
              <span className="w-14 shrink-0 font-mono text-[10px] tracking-wider text-white/35 uppercase">
                {item.kind}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
              <SmallButton onClick={() => copy(shelfCopyValue(item), "Copied")}>Copy</SmallButton>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function NotesPanel({ active }: { active: boolean }) {
  const { state, dispatch } = useDemo()
  const counts = noteCounts(state.notes)

  return (
    <div {...panelProps("notes", active)}>
      <textarea
        value={state.notes}
        onChange={(event) => dispatch({ type: "notes", value: event.target.value })}
        spellCheck={false}
        aria-label="Scratchpad"
        className="h-40 w-full resize-none rounded-xl bg-white/5 px-3 py-2 font-mono text-[13px] leading-relaxed outline-none"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] text-white/40">
          {counts.lines} lines · {counts.words} words · {counts.chars} chars
        </p>
        <div className="flex gap-2">
          <SmallButton
            onClick={() =>
              dispatch({
                type: "stamp",
                time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
              })
            }
          >
            Time
          </SmallButton>
          <SmallButton onClick={() => dispatch({ type: "format-json" })}>JSON</SmallButton>
        </div>
      </div>
      {state.jsonError ? <p className="mt-2 text-xs text-[#60a5fa]">{state.jsonError}</p> : null}
    </div>
  )
}

function StatsPanel({ active }: { active: boolean }) {
  const { state } = useDemo()
  const cpu = Math.round(state.cpu[state.cpu.length - 1] ?? 0)

  return (
    <div {...panelProps("stats", active)} className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">CPU</p>
          <p className="mt-1 text-4xl font-medium tabular-nums">{cpu}%</p>
        </div>
        <Sparkline values={state.cpu} />
      </div>
      <div className="space-y-3">
        <Meter label="Memory" value={state.memory} />
        <Meter label="Swap" value={state.swap} />
        <Meter label="Disk" value={state.disk} />
      </div>
      <div className="flex justify-between border-t border-white/10 pt-3 font-mono text-[12px] text-white/70 tabular-nums">
        <span>↓ {formatRate(state.downKb)}</span>
        <span>↑ {formatRate(state.upKb)}</span>
        <span>up {formatUptime(state.uptime)}</span>
      </div>
    </div>
  )
}

function PortsPanel({ active }: { active: boolean }) {
  const { state, dispatch, notify } = useDemo()

  return (
    <ul {...panelProps("ports", active)}>
      {state.ports.map((port) => (
        <li
          key={port.id}
          className={`flex items-center gap-2 border-b border-white/10 py-2.5 text-sm ${
            port.alive ? "" : "opacity-40"
          }`}
        >
          <span className="w-14 shrink-0 font-mono tabular-nums">:{port.port}</span>
          <span className="min-w-0 flex-1 truncate">{port.alive ? port.process : "stopped"}</span>
          <span className="hidden font-mono text-[11px] text-white/35 sm:inline">{port.pid}</span>
          <SmallButton
            disabled={!port.alive}
            onClick={() => notify(`localhost:${port.port}`)}
          >
            Open
          </SmallButton>
          <SmallButton
            disabled={!port.alive}
            onClick={() => {
              dispatch({ type: "kill-port", id: port.id })
              notify(`Stopped ${port.process}`)
            }}
          >
            Kill
          </SmallButton>
        </li>
      ))}
    </ul>
  )
}

function ToolsPanel({ active }: { active: boolean }) {
  const { state, dispatch, copy } = useDemo()
  const { reduced } = useNotch()
  const [epoch, setEpoch] = useState<number | null>(null)
  const encoded = transformBase64(state.base64Input, state.base64Mode)

  useEffect(() => {
    const tick = () => setEpoch(Math.floor(Date.now() / 1000))
    tick()
    if (reduced) return
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [reduced])

  return (
    <div {...panelProps("tools", active)} className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-white/45">UUID</span>
        <span className="flex items-center gap-2">
          <span className="max-w-[11rem] truncate font-mono text-[11px] sm:max-w-none">{state.uuid}</span>
          <SmallButton
            onClick={() => {
              dispatch({ type: "new-uuid", uuid: crypto.randomUUID() })
            }}
          >
            New
          </SmallButton>
          <SmallButton onClick={() => copy(state.uuid, "Copied UUID")}>Copy</SmallButton>
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-white/45">Epoch</span>
        <span className="flex items-center gap-2 font-mono text-[13px] tabular-nums">
          {epoch ?? "—"}
          <SmallButton
            onClick={() => {
              if (epoch) copy(String(epoch), "Copied epoch")
            }}
          >
            Copy
          </SmallButton>
        </span>
      </div>
      <div className="border-t border-white/10 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/45">Base64</span>
          <div className="flex gap-1">
            {(["encode", "decode"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => dispatch({ type: "base64-mode", mode })}
                className={`rounded-full px-2 py-1 font-mono text-[10px] uppercase ${
                  state.base64Mode === mode ? "bg-white text-black" : "text-white/45"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <input
          value={state.base64Input}
          onChange={(event) => dispatch({ type: "base64-input", value: event.target.value })}
          aria-label="Base64 input"
          spellCheck={false}
          className="mt-2 w-full rounded-lg bg-white/5 px-3 py-2 font-mono text-[13px] outline-none"
        />
        <p className="mt-2 min-h-5 break-all font-mono text-[12px] text-white/70">
          {encoded.ok ? encoded.value : encoded.error}
        </p>
      </div>
    </div>
  )
}

function Slider({
  label,
  value,
  min = 0,
  onChange,
}: {
  label: string
  value: number
  min?: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block text-sm">
      <span className="flex justify-between text-white/45">
        {label}
        <span className="font-mono text-[12px] text-white/70 tabular-nums">{Math.round(value)}</span>
      </span>
      <input
        className="mt-2"
        type="range"
        min={min}
        max={100}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[11px] text-white/50">
        <span>{label}</span>
        <span className="tabular-nums text-white/80">{Math.round(value)}%</span>
      </div>
      <div className="mt-1.5 h-px bg-white/10">
        <div className="h-px bg-[#60a5fa]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

function Sparkline({ values }: { values: number[] }) {
  const width = 128
  const height = 36
  const max = Math.max(...values, 1)
  const step = width / Math.max(values.length - 1, 1)
  const d = values
    .map((value, index) => {
      const x = index * step
      const y = height - (value / max) * (height - 4) - 2
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-9 w-32" aria-hidden>
      <path d={d} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function SmallButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full px-2 py-1 font-mono text-[10px] tracking-wide text-white/70 uppercase ring-1 ring-white/15 hover:bg-white/10 hover:text-white disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function PlayIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden>
      <path d="M0 0l10 6L0 12V0z" fill="currentColor" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden>
      <path d="M0 0h3v12H0zM7 0h3v12H7z" fill="currentColor" />
    </svg>
  )
}
