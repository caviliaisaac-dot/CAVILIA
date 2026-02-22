"use client"

import { useState, useEffect } from "react"
import { Download, X, Share } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showAndroid, setShowAndroid] = useState(false)
  const [showIos, setShowIos] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Registra o service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }

    // Verifica se já está instalado
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    if (isStandalone) return

    // Verifica se já fechou o banner antes
    if (localStorage.getItem("cavilia-pwa-dismissed")) return

    // Detecta iOS
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (isIos) {
      setTimeout(() => setShowIos(true), 2000)
      return
    }

    // Android/Chrome: captura o evento de instalação
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowAndroid(true), 2000)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  function handleDismiss() {
    setShowAndroid(false)
    setShowIos(false)
    setDismissed(true)
    localStorage.setItem("cavilia-pwa-dismissed", "1")
  }

  async function handleInstallAndroid() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === "accepted") {
      setShowAndroid(false)
      setInstallPrompt(null)
    }
  }

  if (dismissed) return null

  const goldButton = {
    background: "#2a2420",
    border: "2px solid #d4a017",
    boxShadow: "0 0 10px 2px rgba(212,160,23,0.4)",
  }

  const goldText = {
    background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 50%, #f0bc2a 100%)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    backgroundClip: "text" as const,
  }

  // Banner Android
  if (showAndroid) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-[100] mx-auto max-w-md rounded-xl border border-gold/30 bg-[#1a1410] p-4 shadow-2xl"
        style={{ boxShadow: "0 0 30px rgba(0,0,0,0.8), 0 0 15px rgba(212,160,23,0.2)" }}>
        <button onClick={handleDismiss} className="absolute right-3 top-3 text-muted-foreground/60 hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/emblem.png" alt="CAVILIA" className="h-12 w-12 rounded-full object-contain bg-black" />
          <div className="flex-1">
            <p className="font-serif text-sm font-bold" style={goldText}>Instalar CAVILIA</p>
            <p className="text-xs text-muted-foreground">Adicione ao seu celular e acesse offline</p>
          </div>
        </div>
        <button
          onClick={handleInstallAndroid}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-serif text-sm font-bold"
          style={goldButton}
        >
          <Download className="h-4 w-4" style={{ color: "#d4a017" }} />
          <span style={goldText}>Instalar Aplicativo</span>
        </button>
      </div>
    )
  }

  // Banner iOS
  if (showIos) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-[100] mx-auto max-w-md rounded-xl border border-gold/30 bg-[#1a1410] p-4 shadow-2xl"
        style={{ boxShadow: "0 0 30px rgba(0,0,0,0.8), 0 0 15px rgba(212,160,23,0.2)" }}>
        <button onClick={handleDismiss} className="absolute right-3 top-3 text-muted-foreground/60 hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/emblem.png" alt="CAVILIA" className="h-12 w-12 rounded-full object-contain bg-black" />
          <div>
            <p className="font-serif text-sm font-bold" style={goldText}>Instalar CAVILIA no iPhone</p>
            <p className="text-xs text-muted-foreground">Adicione à tela inicial</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-500 text-white text-[10px] font-bold">1</span>
            Toque no botão <Share className="inline h-4 w-4 mx-1 text-blue-400" /> no Safari
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-500 text-white text-[10px] font-bold">2</span>
            Role e toque em <strong className="text-foreground mx-1">"Adicionar à Tela de Início"</strong>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-500 text-white text-[10px] font-bold">3</span>
            Toque em <strong className="text-foreground mx-1">"Adicionar"</strong> — pronto! ✅
          </div>
        </div>
      </div>
    )
  }

  return null
}
