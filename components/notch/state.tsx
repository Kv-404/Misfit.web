"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react"

import { isTabId, tabs, type TabId } from "@/lib/content"
import {
  demoReducer,
  initialDemo,
  nextSample,
  type DemoAction,
  type DemoState,
  type ShelfItem,
} from "@/lib/demo"

type NotchContextValue = {
  open: boolean
  pinned: boolean
  tab: TabId
  reduced: boolean
  setTab: (tab: TabId, manual?: boolean) => void
  setOpen: (open: boolean) => void
  pin: () => void
  close: () => void
  togglePinned: () => void
}

const NotchContext = createContext<NotchContextValue | null>(null)

export function NotchProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [tab, setTabState] = useState<TabId>("home")
  const [reduced, setReduced] = useState(false)
  const manualLock = useRef(false)
  const lockTimer = useRef<number | null>(null)
  const reducedRef = useRef(false)
  const openRef = useRef(false)
  const pinnedRef = useRef(false)
  const openedAt = useRef(0)

  reducedRef.current = reduced
  openRef.current = open
  pinnedRef.current = pinned

  const setOpen = useCallback((next: boolean) => {
    if (next) openedAt.current = performance.now()
    setOpenState(next)
  }, [])

  const pin = useCallback(() => {
    setPinned(true)
  }, [])

  const close = useCallback(() => {
    if (reducedRef.current) return
    setPinned(false)
    setOpenState(false)
  }, [])

  const togglePinned = useCallback(() => {
    if (reducedRef.current) return
    if (openRef.current && pinnedRef.current) {
      setPinned(false)
      setOpenState(false)
      return
    }
    openedAt.current = performance.now()
    setPinned(true)
    setOpenState(true)
  }, [])

  const setTab = useCallback((next: TabId, manual = false) => {
    if (manual) {
      manualLock.current = true
      if (lockTimer.current) window.clearTimeout(lockTimer.current)
      lockTimer.current = window.setTimeout(() => {
        manualLock.current = false
      }, 900)
    }
    setTabState(next)
  }, [])

  useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => {
      const on = media.matches
      setReduced(on)
      document.documentElement.classList.toggle("reduce-motion", on)
      if (on) setOpenState(true)
    }
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [])

  useEffect(() => {
    document.body.dataset.tab = tab
  }, [tab])

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-feature]")
    if (!nodes.length) return

    // A thin band across the middle of the screen. Whichever feature
    // crosses it becomes the tab, without taking over the scroll.
    const observer = new IntersectionObserver(
      (entries) => {
        if (manualLock.current) return
        const best = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const id = best?.target.getAttribute("data-feature")
        if (isTabId(id)) setTab(id)
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [setTab])

  useEffect(() => {
    const applyHash = () => {
      const id = window.location.hash.replace("#", "")
      if (isTabId(id)) setTab(id, true)
    }
    applyHash()
    window.addEventListener("hashchange", applyHash)
    return () => window.removeEventListener("hashchange", applyHash)
  }, [setTab])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === "Escape") {
        event.preventDefault()
        close()
        return
      }

      const match = tabs.find((item) => item.key === event.key)
      if (!match) return
      event.preventDefault()
      setTab(match.id, true)
      if (!reduced) {
        setPinned(true)
        setOpen(true)
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [close, reduced, setOpen, setTab])

  useEffect(() => {
    if (!open || pinned || reduced) return
    const onScroll = () => {
      if (performance.now() - openedAt.current < 450) return
      setOpenState(false)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [open, pinned, reduced])

  useEffect(() => {
    return () => {
      if (lockTimer.current) window.clearTimeout(lockTimer.current)
    }
  }, [])

  const value = useMemo(
    () => ({
      open,
      pinned,
      tab,
      reduced,
      setTab,
      setOpen,
      pin,
      close,
      togglePinned,
    }),
    [open, pinned, tab, reduced, setTab, setOpen, pin, close, togglePinned],
  )

  return <NotchContext.Provider value={value}>{children}</NotchContext.Provider>
}

export function useNotch() {
  const context = useContext(NotchContext)
  if (!context) throw new Error("useNotch must be used inside NotchProvider")
  return context
}

type DemoContextValue = {
  state: DemoState
  dispatch: Dispatch<DemoAction>
  notify: (text: string) => void
  copy: (value: string, label?: string) => Promise<void>
  addSample: () => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialDemo)
  const { reduced } = useNotch()
  const noticeTimer = useRef<number | null>(null)

  const notify = useCallback((text: string) => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    dispatch({ type: "notice", text })
    noticeTimer.current = window.setTimeout(() => {
      dispatch({ type: "notice", text: null })
    }, 1600)
  }, [])

  const copy = useCallback(
    async (value: string, label = "Copied") => {
      try {
        await navigator.clipboard.writeText(value)
        notify(label)
      } catch {
        notify("Copy failed")
      }
    },
    [notify],
  )

  const addSample = useCallback(() => {
    const sample = nextSample(state.sampleIndex)
    const item: ShelfItem = { id: crypto.randomUUID(), ...sample }
    dispatch({ type: "add-sample", item })
    notify(`Added ${sample.name}`)
  }, [notify, state.sampleIndex])

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => {
      dispatch({
        type: "tick",
        drift: (Math.random() - 0.48) * 8,
        memDrift: (Math.random() - 0.5) * 0.35,
        downDrift: (Math.random() - 0.45) * 90,
        upDrift: (Math.random() - 0.5) * 24,
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [reduced])

  useEffect(() => {
    return () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    }
  }, [])

  const value = useMemo(
    () => ({ state, dispatch, notify, copy, addSample }),
    [state, notify, copy, addSample],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) throw new Error("useDemo must be used inside DemoProvider")
  return context
}
