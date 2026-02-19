"use client"

import { Home, CalendarDays, User } from "lucide-react"

type Screen = "home" | "schedule" | "profile"

interface BottomNavProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
}

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const navItems: { id: Screen; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "schedule", label: "Agendar", icon: CalendarDays },
    { id: "profile", label: "Perfil", icon: User },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md"
      role="navigation"
      aria-label="Menu principal"
    >
      <div className="mx-auto flex max-w-md items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-6 py-1.5 transition-colors ${
                isActive
                  ? "text-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-medium tracking-wide uppercase">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
