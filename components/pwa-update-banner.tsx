"use client"

import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"

export function PwaUpdateBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    let registration: ServiceWorkerRegistration | null = null

    function checkForUpdates() {
      registration?.update().catch(() => {})
    }

    function onControllerChange() {
      window.location.reload()
    }

    navigator.serviceWorker.ready.then((reg) => {
      registration = reg

      if (reg.waiting) {
        setWaitingWorker(reg.waiting)
        setShowBanner(true)
      }

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker)
            setShowBanner(true)
          }
        })
      })

      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)
    })

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") checkForUpdates()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)

    const interval = setInterval(checkForUpdates, 60 * 60 * 1000)

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      clearInterval(interval)
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
    }
  }, [])

  function handleUpdate() {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" })
      setShowBanner(false)
    }
  }

  if (!showBanner) return null

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[200] flex items-center justify-between gap-3 bg-gold px-4 py-3 shadow-lg"
      role="alert"
    >
      <span className="text-sm font-medium text-primary-foreground">
        Nova versão disponível
      </span>
      <button
        onClick={handleUpdate}
        className="flex items-center gap-2 rounded-lg bg-primary-foreground/20 px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:bg-primary-foreground/30 active:opacity-90"
      >
        <RefreshCw className="h-4 w-4" />
        Atualizar agora
      </button>
    </div>
  )
}
