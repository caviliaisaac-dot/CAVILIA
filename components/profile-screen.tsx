"use client"

import { useState } from "react"
import { CalendarDays, Clock, X, Scissors, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { BookingData } from "./schedule-screen"
import { HorseLogo } from "./horse-logo"

interface ProfileScreenProps {
  bookings: BookingData[]
  onCancelBooking: (index: number) => void
}

export function ProfileScreen({ bookings, onCancelBooking }: ProfileScreenProps) {
  const [showCancelDialog, setShowCancelDialog] = useState<number | null>(null)

  const upcomingBookings = bookings.filter((b) => b.date >= new Date())
  const pastBookings = bookings.filter((b) => b.date < new Date())

  function handleCancel(index: number) {
    onCancelBooking(index)
    setShowCancelDialog(null)
  }

  return (
    <div className="flex min-h-screen flex-col pb-24">
      {/* Header */}
      <header className="border-b border-border px-4 pb-6 pt-12 flex flex-col items-center text-center">
        <div className="mb-3 flex-shrink-0" style={{ width: 86, height: 86, padding: 3, borderRadius: '9999px', background: 'conic-gradient(from 0deg, #f5cc6a 0%, #e8b84b 18%, #c49a2e 35%, #fff3b0 50%, #c49a2e 65%, #e8b84b 82%, #f5cc6a 100%)', boxShadow: '0 0 18px 4px rgba(232,184,75,0.45), 0 0 6px 1px rgba(255,243,176,0.3)' }}>
          <div className="flex h-full w-full items-center justify-center rounded-full bg-black overflow-hidden">
            <img src="/logo-cavilia.png" alt="Cavilia Logo" className="h-full w-full object-contain" />
          </div>
        </div>
        <h1 className="font-serif text-xl font-bold text-foreground">
          Meu Perfil
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Membro desde 2024
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-gold" />
          <span className="text-[10px] font-medium tracking-wider uppercase text-gold">
            Cliente VIP
          </span>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 border-b border-border">
        <div className="flex flex-col items-center border-r border-border py-4">
          <span className="font-serif text-2xl font-bold text-gold">
            {bookings.length}
          </span>
          <span className="text-[10px] text-muted-foreground">Total</span>
        </div>
        <div className="flex flex-col items-center border-r border-border py-4">
          <span className="font-serif text-2xl font-bold text-foreground">
            {upcomingBookings.length}
          </span>
          <span className="text-[10px] text-muted-foreground">Proximos</span>
        </div>
        <div className="flex flex-col items-center py-4">
          <span className="font-serif text-2xl font-bold text-foreground">
            {pastBookings.length}
          </span>
          <span className="text-[10px] text-muted-foreground">Realizados</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-6">
        {/* Upcoming */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gold" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Proximos Agendamentos
            </h2>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card px-6 py-8 text-center">
              <Scissors className="mx-auto mb-2 h-6 w-6 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Nenhum agendamento futuro
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Agende pelo menu Agendar
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingBookings.map((booking, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                    <Scissors className="h-4 w-4 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-sm font-semibold text-foreground">
                      {booking.service}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {format(booking.date, "dd/MM", { locale: ptBR })}
                      </span>
                      <span className="text-muted-foreground/30">|</span>
                      <span className="text-xs text-muted-foreground">
                        {booking.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gold">
                      {booking.price}
                    </span>
                    <button
                      onClick={() => setShowCancelDialog(i)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-border transition-colors hover:border-destructive-foreground/30 hover:bg-destructive/20"
                      aria-label="Cancelar agendamento"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past bookings */}
        {pastBookings.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Historico
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {pastBookings.map((booking, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4 opacity-60"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{booking.service}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(booking.date, "dd/MM/yyyy", { locale: ptBR })} - {booking.time}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {booking.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu options */}
        <div className="mt-8 mb-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/50">
              Configuracoes
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          {["Dados Pessoais", "Notificacoes", "Sobre a CAVILIA"].map((item) => (
            <button
              key={item}
              className="flex w-full items-center justify-between border-b border-border/50 px-1 py-3.5 text-left transition-colors hover:bg-secondary/30"
            >
              <span className="text-sm text-foreground">{item}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
            </button>
          ))}
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-6 w-full max-w-sm rounded-lg border border-border bg-card p-6">
            <h3 className="font-serif text-lg font-bold text-foreground">
              Cancelar Agendamento?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tem certeza que deseja cancelar este agendamento? Esta acao nao pode ser desfeita.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowCancelDialog(null)}
                className="flex-1 rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-leather"
              >
                Manter
              </button>
              <button
                onClick={() => handleCancel(showCancelDialog)}
                className="flex-1 rounded-lg bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/80"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
