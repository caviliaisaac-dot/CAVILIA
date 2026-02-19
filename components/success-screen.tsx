"use client"

import { Check, CalendarDays } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { BookingData } from "./schedule-screen"
import { HorseLogo } from "./horse-logo"

interface SuccessScreenProps {
  booking: BookingData
  onGoHome: () => void
  onViewBookings: () => void
}

export function SuccessScreen({ booking, onGoHome, onViewBookings }: SuccessScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Success animation circle */}
      <div className="relative mb-6">
        <div className="absolute -inset-4 animate-ping rounded-full bg-gold/10" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-gold/10">
          <Check className="h-8 w-8 text-gold" strokeWidth={3} />
        </div>
      </div>

      <h1 className="mb-2 font-serif text-2xl font-bold text-foreground">
        Agendamento Confirmado!
      </h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Seu horario foi reservado com sucesso
      </p>

      {/* Booking card */}
      <div className="mb-8 w-full max-w-sm overflow-hidden rounded-lg border border-gold/30 bg-card">
        <div className="flex items-center gap-3 border-b border-border bg-gold/5 px-5 py-4">
          <HorseLogo size={32} />
          <div>
            <p className="font-serif text-sm font-bold text-foreground">CAVILIA</p>
            <p className="text-[10px] tracking-wider text-gold">STUDIO CLUB 1998</p>
          </div>
        </div>
        <div className="flex flex-col divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-muted-foreground">Servico</span>
            <span className="text-sm font-medium text-foreground">{booking.service}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-muted-foreground">Data</span>
            <span className="text-sm text-foreground">
              {format(booking.date, "dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-muted-foreground">Horario</span>
            <span className="text-sm text-foreground">{booking.time}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-muted-foreground">Valor</span>
            <span className="font-serif text-base font-bold text-gold">{booking.price}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={onViewBookings}
          className="w-full rounded-lg bg-gold px-6 py-3.5 font-serif text-sm font-bold text-primary-foreground transition-colors hover:bg-gold-light active:bg-gold-dark"
        >
          Ver Meus Agendamentos
        </button>
        <button
          onClick={onGoHome}
          className="w-full rounded-lg border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Voltar ao Inicio
        </button>
      </div>
    </div>
  )
}
