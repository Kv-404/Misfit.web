export type ShelfKind = "file" | "snippet" | "url" | "image"

export type ShelfItem = {
  id: string
  name: string
  kind: ShelfKind
  meta: string
}

export type PortRow = {
  id: string
  port: number
  process: string
  pid: number
  alive: boolean
}

export type DemoState = {
  playing: boolean
  progress: number
  volume: number
  brightness: number
  notes: string
  jsonError: string | null
  shelf: ShelfItem[]
  sampleIndex: number
  ports: PortRow[]
  cpu: number[]
  memory: number
  swap: number
  disk: number
  downKb: number
  upKb: number
  uptime: number
  uuid: string
  base64Input: string
  base64Mode: "encode" | "decode"
  notice: string | null
}

export type DemoAction =
  | {
      type: "tick"
      drift: number
      memDrift: number
      downDrift: number
      upDrift: number
    }
  | { type: "toggle-play" }
  | { type: "volume"; value: number }
  | { type: "brightness"; value: number }
  | { type: "notes"; value: string }
  | { type: "stamp"; time: string }
  | { type: "format-json" }
  | { type: "add-shelf"; item: ShelfItem }
  | { type: "add-sample"; item: ShelfItem }
  | { type: "kill-port"; id: string }
  | { type: "notice"; text: string | null }
  | { type: "new-uuid"; uuid: string }
  | { type: "base64-mode"; mode: "encode" | "decode" }
  | { type: "base64-input"; value: string }

export const track = {
  title: "Idle Loop",
  artist: "Local",
  durationSec: 191,
}

export const ipAddress = "10.0.0.24"

export const battery = {
  percent: 86,
  charging: true,
}

const samples: Omit<ShelfItem, "id">[] = [
  { name: "handler.go", kind: "file", meta: "2 KB" },
  { name: "export TOKEN=dev", kind: "snippet", meta: "clipboard" },
  { name: "https://misfit.engineering", kind: "url", meta: "link" },
  { name: "shot.png", kind: "image", meta: "PNG" },
]

export const initialDemo: DemoState = {
  playing: true,
  progress: 36,
  volume: 62,
  brightness: 100,
  notes: "GET /health\n200\n\ntodo: sign the build",
  jsonError: null,
  sampleIndex: 0,
  shelf: [
    { id: "shelf-schema", name: "schema.sql", kind: "file", meta: "4 KB" },
    { id: "shelf-env", name: "DATABASE_URL=…", kind: "snippet", meta: "clipboard" },
    { id: "shelf-local", name: "http://localhost:3000", kind: "url", meta: "link" },
  ],
  ports: [
    { id: "p3000", port: 3000, process: "next-server", pid: 48211, alive: true },
    { id: "p5432", port: 5432, process: "postgres", pid: 1204, alive: true },
    { id: "p5173", port: 5173, process: "vite", pid: 8831, alive: true },
    { id: "p8080", port: 8080, process: "python", pid: 22910, alive: true },
  ],
  cpu: [
    18, 22, 21, 28, 26, 24, 31, 29, 27, 25, 34, 38, 36, 33, 30, 28, 26, 29, 35,
    41, 37, 32, 28, 24, 22, 21, 23, 27, 25, 22, 20, 24,
  ],
  memory: 62,
  swap: 4,
  disk: 71,
  downKb: 840,
  upKb: 120,
  uptime: 4 * 3600 + 12 * 60,
  uuid: "7c1a9e24-6b0f-4d33-9a18-2f0b6e5d44c1",
  base64Input: "misfit",
  base64Mode: "encode",
  notice: null,
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "tick": {
      const last = state.cpu[state.cpu.length - 1] ?? 20
      return {
        ...state,
        cpu: [...state.cpu.slice(-31), clamp(last + action.drift, 6, 78)],
        memory: clamp(state.memory + action.memDrift, 48, 74),
        downKb: clamp(state.downKb + action.downDrift, 12, 2400),
        upKb: clamp(state.upKb + action.upDrift, 4, 900),
        uptime: state.uptime + 1,
        progress: state.playing ? (state.progress + 0.85) % 100 : state.progress,
      }
    }
    case "toggle-play":
      return { ...state, playing: !state.playing }
    case "volume":
      return { ...state, volume: clamp(action.value, 0, 100) }
    case "brightness":
      return { ...state, brightness: clamp(action.value, 20, 100) }
    case "notes":
      return { ...state, notes: action.value, jsonError: null }
    case "stamp": {
      const next = state.notes.length ? `${state.notes}\n${action.time}` : action.time
      return { ...state, notes: next, jsonError: null }
    }
    case "format-json": {
      try {
        return {
          ...state,
          notes: JSON.stringify(JSON.parse(state.notes), null, 2),
          jsonError: null,
        }
      } catch {
        return { ...state, jsonError: "That is not JSON." }
      }
    }
    case "add-shelf":
    case "add-sample":
      return {
        ...state,
        sampleIndex:
          action.type === "add-sample" ? state.sampleIndex + 1 : state.sampleIndex,
        shelf: [action.item, ...state.shelf].slice(0, 8),
      }
    case "kill-port":
      return {
        ...state,
        ports: state.ports.map((port) =>
          port.id === action.id ? { ...port, alive: false } : port,
        ),
      }
    case "notice":
      return { ...state, notice: action.text }
    case "new-uuid":
      return { ...state, uuid: action.uuid }
    case "base64-mode":
      return { ...state, base64Mode: action.mode }
    case "base64-input":
      return { ...state, base64Input: action.value }
    default:
      return state
  }
}

export function nextSample(index: number): Omit<ShelfItem, "id"> {
  return samples[index % samples.length]
}

export function noteCounts(notes: string) {
  const lines = notes.length ? notes.split("\n").length : 0
  const words = notes.trim() ? notes.trim().split(/\s+/).length : 0
  return { lines, words, chars: notes.length }
}

export function formatRate(kb: number) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB/s`
  return `${Math.round(kb)} KB/s`
}

export function formatUptime(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function formatClock(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function transformBase64(input: string, mode: "encode" | "decode") {
  try {
    if (mode === "encode") {
      const bytes = new TextEncoder().encode(input)
      let binary = ""
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte)
      })
      return { ok: true as const, value: btoa(binary) }
    }
    const binary = atob(input.trim())
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return { ok: true as const, value: new TextDecoder().decode(bytes) }
  } catch {
    return {
      ok: false as const,
      error: mode === "encode" ? "Could not encode that." : "Not valid base64.",
    }
  }
}

export function shelfCopyValue(item: ShelfItem) {
  if (item.kind === "url" || item.kind === "snippet") return item.name
  return `~/Desktop/${item.name}`
}

export function kindFromText(text: string): ShelfKind {
  try {
    const url = new URL(text.trim())
    if (url.protocol === "http:" || url.protocol === "https:") return "url"
  } catch {
    return "snippet"
  }
  return "snippet"
}
