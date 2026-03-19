"use client"

import { useState } from "react"
import { Home, CalendarDays, User, ShieldCheck } from "lucide-react"

type Screen = "home" | "schedule" | "profile" | "adm"

interface BottomNavProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
}

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const [desktopOpen, setDesktopOpen] = useState(false)
  const navItems: { id: Screen; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Início", icon: Home },
    { id: "schedule", label: "Agendar", icon: CalendarDays },
    { id: "profile", label: "Perfil", icon: User },
    { id: "adm", label: "ADM", icon: ShieldCheck },
  ]

  return (
    <>
      {/* Mobile: mantém navegação inferior atual */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold/30 bg-[#1e1914] lg:hidden"
        role="navigation"
        aria-label="Menu principal"
      >
        <div className="mx-auto flex max-w-md items-center justify-around py-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id
            const isAdm = item.id === "adm"
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 transition-colors ${
                  isActive
                    ? isAdm
                      ? "text-gold drop-shadow-[0_0_8px_rgba(212,160,23,0.6)]"
                      : "text-gold drop-shadow-[0_0_6px_rgba(201,169,110,0.35)]"
                    : isAdm
                      ? "text-gold/50 hover:text-gold/75"
                      : "text-gold/40 hover:text-gold/65"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className={`shrink-0 ${isActive ? "stroke-[2.5]" : ""}`} size={18} style={{ width: 18, height: 18 }} />
                <span className={`text-[10px] font-medium tracking-wide uppercase ${isActive ? "border-b border-gold/60 pb-0.5" : ""}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Desktop: botão "Dashboard" no canto superior esquerdo + menu expansível */}
      <div className="hidden lg:block">
        <button
          onClick={() => setDesktopOpen((v) => !v)}
          className="fixed left-6 top-6 z-50 rounded-xl border border-gold/40 bg-[#1e1914]/95 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-gold shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:bg-[#2a2420]"
        >
          Dashboard
        </button>

        {desktopOpen && (
          <nav
            className="fixed left-6 top-20 z-50 w-56 rounded-2xl border border-gold/30 bg-[#1e1914]/95 p-2 shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
            role="navigation"
            aria-label="Menu principal desktop"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = activeScreen === item.id
                const isAdm = item.id === "adm"
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? "bg-gold/15 text-gold"
                        : isAdm
                          ? "text-gold/70 hover:bg-secondary/50 hover:text-gold"
                          : "text-gold/55 hover:bg-secondary/50 hover:text-gold/80"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "stroke-[2.5]" : ""}`} />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </>
  )
}
