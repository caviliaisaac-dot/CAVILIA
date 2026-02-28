"use client"

import { useState } from "react"

interface HomeScreenProps {
  onNavigate: (screen: "schedule" | "profile") => void
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [side, setSide] = useState<"horse" | "cowboy">("horse")
  const [flipClass, setFlipClass] = useState("")
  const [clickCount, setClickCount] = useState(0)

  function handleCoinClick() {
    if (flipClass && flipClass !== "showing-back") return

    if (side === "cowboy") {
      setFlipClass("flipping-back-to-front")
      setTimeout(() => {
        setSide("horse")
        setFlipClass("")
        setClickCount(0)
      }, 1400)
      return
    }

    const newCount = clickCount + 1

    if (newCount >= 3) {
      setFlipClass("flipping-to-back")
      setTimeout(() => {
        setSide("cowboy")
        setFlipClass("showing-back")
        setClickCount(0)
      }, 1400)
    } else {
      setClickCount(newCount)
      setFlipClass("flipping-to-front")
      setTimeout(() => {
        setFlipClass("")
      }, 1400)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-24">
      {/* CAVILIA: grande, dourado, brilho metálico */}
      <h1 className="cavilia-title mb-0 font-serif text-6xl font-bold tracking-[0.14em]">
        CAVILIA
      </h1>
      {/* — STUDIO CLUB 1998 — com linhas douradas */}
      <div className="mt-2 mb-8 flex items-center gap-2">
        <span className="text-gold/80">—</span>
        <span className="studio-subtitle font-sans text-[13px] font-medium tracking-[0.28em] uppercase">
          Studio Club 1998
        </span>
        <span className="text-gold/80">—</span>
      </div>

      {/* Emblema circular central — clique para girar a moeda */}
      <div className="coin-scene relative mb-12 flex flex-shrink-0 flex-col items-center gap-2">
        {side === "horse" && !flipClass && (
          <div className="absolute -bottom-6 flex gap-1.5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                style={{ background: i < clickCount ? "#d4a017" : "rgba(212,160,23,0.25)" }}
              />
            ))}
          </div>
        )}
        <div className="emblem-ring" onClick={handleCoinClick} style={{ cursor: flipClass ? "default" : "pointer" }}>
          <div className={`coin-card ${flipClass}`}>
            <div className="coin-face overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/emblem.png"
                alt="CAVILIA - Cavalo e Ferradura"
                className="rounded-full object-contain object-center"
                style={{ width: "138%", height: "138%", marginLeft: "0%", marginTop: "-12%" }}
                width={192}
                height={192}
              />
            </div>
            <div className="coin-face coin-face-back overflow-hidden" style={{ background: "#000" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/cowboy-coin.png"
                alt="CAVILIA - Cowboy"
                style={{
                  position: "absolute",
                  width: "150%",
                  height: "150%",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -46%)",
                  objectFit: "cover",
                  borderRadius: "9999px",
                }}
                width={216}
                height={216}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botões com borda dourada grossa e vibrante */}
      <div className="flex w-full max-w-xs flex-col gap-4">
        <button
          onClick={() => onNavigate("schedule")}
          className="rounded-lg px-6 py-3.5 font-sans text-sm font-semibold uppercase tracking-[0.18em] transition-all hover:brightness-110"
          style={{
            background: "#2a2420",
            border: "2.5px solid #d4a017",
            boxShadow: "0 0 12px 3px rgba(212,160,23,0.55), 0 0 4px 1px rgba(240,188,42,0.4), inset 0 1px 0 rgba(255,255,255,0.07), 0 3px 12px rgba(0,0,0,0.5)",
          }}
        >
          <span
            style={{
              background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 4px rgba(212,160,23,0.8))",
            }}
          >
            Agendar Horário
          </span>
        </button>
        <button
          onClick={() => onNavigate("profile")}
          className="rounded-lg px-6 py-3.5 font-sans text-sm font-semibold uppercase tracking-[0.18em] transition-all hover:brightness-110"
          style={{
            background: "#2a2420",
            border: "2.5px solid #d4a017",
            boxShadow: "0 0 12px 3px rgba(212,160,23,0.55), 0 0 4px 1px rgba(240,188,42,0.4), inset 0 1px 0 rgba(255,255,255,0.07), 0 3px 12px rgba(0,0,0,0.5)",
          }}
        >
          <span
            style={{
              background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 4px rgba(212,160,23,0.8))",
            }}
          >
            Meus Horários
          </span>
        </button>
      </div>
    </div>
  )
}
