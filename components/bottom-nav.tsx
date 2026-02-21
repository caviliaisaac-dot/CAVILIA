"use client"

import { Home, CalendarDays, User } from "lucide-react"

type Screen = "home" | "schedule" | "profile"

interface BottomNavProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
}

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const navItems: { id: Screen; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Início", icon: Home },
    { id: "schedule", label: "Agendar", icon: CalendarDays },
    { id: "profile", label: "Perfil", icon: User },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold/30 bg-[#1e1914]"
      role="navigation"
      aria-label="Menu principal"
    >
      <div className="mx-auto flex max-w-md items-center justify-around py-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-5 py-1.5 transition-colors ${
                isActive
                  ? "text-gold drop-shadow-[0_0_6px_rgba(201,169,110,0.35)]"
                  : "text-gold/40 hover:text-gold/65"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={`h-[18px] w-[18px] ${isActive ? "stroke-[2.5]" : ""}`} />
              <span
                className={`text-[10px] font-medium tracking-wide uppercase ${
                  isActive ? "border-b border-gold/60 pb-0.5" : ""
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
