"use client"

import { HorseLogo } from "./horse-logo"
import { CalendarDays, Clock, Scissors } from "lucide-react"

interface HomeScreenProps {
  onNavigate: (screen: "schedule" | "profile") => void
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center px-6 pb-24 pt-12">
      {/* Top decorative line */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-px w-12 bg-gold/40" />
        <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold/60">
          Est. 1998
        </span>
        <div className="h-px w-12 bg-gold/40" />
      </div>

      {/* Logo */}
      <div className="mb-4">
        <HorseLogo size={100} />
      </div>

      {/* Brand Name */}
      <h1 className="mb-1 font-serif text-4xl font-bold tracking-wider text-foreground">
        CAVILIA
      </h1>
      <div className="mb-1 flex items-center gap-2">
        <div className="h-px w-8 bg-gold/50" />
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-gold">
          Studio Club
        </span>
        <div className="h-px w-8 bg-gold/50" />
      </div>
      <p className="mb-10 text-xs tracking-[0.2em] text-muted-foreground">
        BARBEARIA PREMIUM
      </p>

      {/* Main actions */}
      <div className="flex w-full max-w-sm flex-col gap-4">
        <button
          onClick={() => onNavigate("schedule")}
          className="group relative flex items-center gap-4 overflow-hidden rounded-lg border border-gold/30 bg-card px-6 py-5 transition-all hover:border-gold/60 hover:bg-leather/50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
            <CalendarDays className="h-5 w-5 text-gold" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-serif text-lg font-semibold text-foreground">
              Agendar Horario
            </p>
            <p className="text-xs text-muted-foreground">
              Escolha seu servico e horario
            </p>
          </div>
          <div className="text-gold/40 transition-colors group-hover:text-gold">
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => onNavigate("profile")}
          className="group relative flex items-center gap-4 overflow-hidden rounded-lg border border-border bg-card px-6 py-5 transition-all hover:border-gold/30 hover:bg-leather/50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-serif text-lg font-semibold text-foreground">
              Meus Agendamentos
            </p>
            <p className="text-xs text-muted-foreground">
              Veja seus horarios marcados
            </p>
          </div>
          <div className="text-muted-foreground/40 transition-colors group-hover:text-gold">
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </div>

      {/* Services preview */}
      <div className="mt-10 w-full max-w-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground">
            Nossos Servicos
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Scissors, name: "Corte", price: "R$ 45" },
            { icon: Scissors, name: "Barba", price: "R$ 35" },
            { icon: Scissors, name: "Combo", price: "R$ 70" },
          ].map((service) => (
            <button
              key={service.name}
              onClick={() => onNavigate("schedule")}
              className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-all hover:border-gold/30"
            >
              <service.icon className="h-4 w-4 text-gold/70" />
              <span className="text-xs font-medium text-foreground">{service.name}</span>
              <span className="text-[10px] text-gold">{service.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-auto pt-10 text-center">
        <p className="text-[10px] tracking-wider text-muted-foreground/60">
          Seg - Sab | 09:00 - 20:00
        </p>
      </div>
    </div>
  )
}
