export const siteUrl = "https://misfit.engineering"

export const githubUrl = "https://github.com/Kv-404"

export const description =
  "A macOS notch for developers. Shelf, scratchpad, live stats, listening ports, and the small tools, in the black pill at the top of the screen."

export const hero = {
  lead: "The dock keeps the song.",
  rest: "DevNotch keeps the dev server.",
}

export const tabs = [
  {
    id: "home",
    index: "01",
    name: "Home",
    key: "1",
    body: "The collapsed pill keeps the track on the left and the battery on the right. Open it for the song, the local IP, and the sliders you actually reach for.",
  },
  {
    id: "shelf",
    index: "02",
    name: "Shelf",
    key: "2",
    body: "Drop a file, a snippet, or a URL on the notch and it stays there. Copy the path when you need it. This page only pretends. Nothing is written to your disk.",
  },
  {
    id: "notes",
    index: "03",
    name: "Notes",
    key: "3",
    body: "A scratchpad in the notch. It counts lines, stamps the time, and formats JSON. The app saves to ~/.devnotch/notes.md.",
  },
  {
    id: "stats",
    index: "04",
    name: "Stats",
    key: "4",
    body: "CPU, memory, swap, disk, and the live up and down. The sparkline moves while the machine does.",
  },
  {
    id: "ports",
    index: "05",
    name: "Ports",
    key: "5",
    body: "Listening ports, with the process and the pid. Open localhost, or kill the server that did not exit.",
  },
  {
    id: "tools",
    index: "06",
    name: "Tools",
    key: "6",
    body: "A new UUID, the unix time, and base64. Small, and always in the same place.",
  },
] as const

export type TabId = (typeof tabs)[number]["id"]

const tabIdSet = new Set<string>(tabs.map((tab) => tab.id))

export function isTabId(value: string | null | undefined): value is TabId {
  return !!value && tabIdSet.has(value)
}

export const shortcuts = [
  { keys: "esc", label: "Collapse the notch" },
  { keys: "1", label: "Home" },
  { keys: "2", label: "Shelf" },
  { keys: "3", label: "Notes" },
  { keys: "4", label: "Stats" },
  { keys: "5", label: "Ports" },
  { keys: "6", label: "Tools" },
] as const

export const specs = [
  { label: "System", value: "macOS" },
  { label: "Machines", value: "Apple silicon and Intel" },
  { label: "Display", value: "A notch, or a slim handle where the display has none" },
  { label: "Built with", value: "Rust and Tauri" },
] as const

export const footer = {
  company: "Misfit Engineering",
  place: "Mumbai",
} as const
