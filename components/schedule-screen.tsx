"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, Check, Scissors, Clock, CalendarDays } from "lucide-react"
import { format, addDays, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { ScheduleBlock } from "./adm-schedule-manager"

export interface ServiceItem {
  id: string
  name: string
  desc: string
  price: string
  duration: string
}

interface ScheduleScreenProps {
  onBack: () => void
  onConfirm: (booking: BookingData) => void
  services?: ServiceItem[]
  scheduleBlocks?: ScheduleBlock
}

export interface BookingData {
  service: string
  price: string
  date: Date
  time: string
  clientName: string
  phone: string
  status?: "active" | "cancelled" | "rescheduled"
}

export const DEFAULT_SERVICES: ServiceItem[] = [
  { id: "corte", name: "Corte Classico", desc: "Corte masculino com tesoura e maquina", price: "R$ 45", duration: "40 min" },
  { id: "barba", name: "Barba Completa", desc: "Barba com toalha quente e navalha", price: "R$ 35", duration: "30 min" },
  { id: "combo", name: "Combo Premium", desc: "Corte + Barba + Toalha quente", price: "R$ 70", duration: "60 min" },
  { id: "sobrancelha", name: "Design Sobrancelha", desc: "Alinhamento e limpeza com navalha", price: "R$ 20", duration: "15 min" },
  { id: "hidratacao", name: "Hidratacao Capilar", desc: "Tratamento profundo para cabelos", price: "R$ 50", duration: "45 min" },
]

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "13:00", "13:30", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
  "18:30", "19:00", "19:30",
]

const TAKEN_SLOTS: string[] = []

type Step = 1 | 2 | 3 | 4 | 5

export function ScheduleScreen({ onBack, onConfirm, services: servicesProp, scheduleBlocks }: ScheduleScreenProps) {
  const SERVICES = servicesProp ?? DEFAULT_SERVICES
  const [step, setStep] = useState<Step>(1)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [clientName, setClientName] = useState("")
  const [phone, setPhone] = useState("")

  const dates = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 21 }, (_, i) => addDays(today, i + 1))
      .filter((d) => {
        if (d.getDay() === 0) return false // Remove Sundays
        const key = format(d, "yyyy-MM-dd")
        if (scheduleBlocks?.dayoffs.includes(key)) return false // Remove folgas
        return true
      })
  }, [scheduleBlocks])

  const service = SERVICES.find((s) => s.id === selectedService)

  function handleServiceSelect(serviceId: string) {
    setSelectedService(serviceId)
    setStep(2)
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
    setStep(3)
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time)
    setStep(4)
  }

  function handleConfirm() {
    if (service && selectedDate && selectedTime) {
      onConfirm({
        service: service.name,
        price: service.price,
        date: selectedDate,
        time: selectedTime,
        clientName: clientName.trim() || "Cliente",
        phone: phone.trim(),
      })
    }
  }

  function handleStepBack() {
    if (step === 1) {
      onBack()
    } else {
      setStep((s) => (s - 1) as Step)
    }
  }

  const stepLabels = ["Servico", "Data", "Horario", "Dados", "Confirmar"]

  return (
    <div className="flex min-h-screen flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={handleStepBack}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-serif text-lg font-semibold text-foreground">
              Agendar Horario
            </h1>
          </div>
          <span className="text-xs text-muted-foreground">
            {step}/5
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 px-4 pb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-gold" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Step labels */}
        <div className="flex px-4 pb-3">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex-1 text-center">
              <span
                className={`text-[9px] font-medium tracking-wider uppercase ${
                  i + 1 <= step ? "text-gold" : "text-muted-foreground/50"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <div className="flex-1 px-4 pt-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Escolha o servico desejado:
          </p>
          <div className="flex flex-col gap-3">
            {SERVICES.map((s) => (
              <button
                key={s.id}
                onClick={() => handleServiceSelect(s.id)}
                className={`flex items-start gap-4 rounded-lg border p-4 text-left transition-all ${
                  selectedService === s.id
                    ? "border-gold bg-gold/5"
                    : "border-border bg-card hover:border-gold/30"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                    selectedService === s.id
                      ? "border-gold bg-gold/20"
                      : "border-border bg-secondary"
                  }`}
                >
                  <Scissors
                    className={`h-4 w-4 ${
                      selectedService === s.id
                        ? "text-gold"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-serif text-sm font-semibold text-foreground">
                      {s.name}
                    </p>
                    <span className="text-sm font-bold text-gold">{s.price}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground/60" />
                    <span className="text-[10px] text-muted-foreground/60">
                      {s.duration}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date Selection */}
      {step === 2 && (
        <div className="flex-1 px-4 pt-4">
          {service && (
            <div className="mb-4 rounded-lg border border-gold/20 bg-gold/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {service.name}
                </span>
                <span className="text-sm font-bold text-gold">{service.price}</span>
              </div>
            </div>
          )}
          <p className="mb-4 text-sm text-muted-foreground">
            Escolha a data:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {dates.map((date) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const dayName = format(date, "EEE", { locale: ptBR })
              const dayNum = format(date, "dd")
              const monthName = format(date, "MMM", { locale: ptBR })

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  className={`flex flex-col items-center gap-0.5 rounded-lg border px-3 py-3 transition-all ${
                    isSelected
                      ? "border-gold bg-gold/10"
                      : "border-border bg-card hover:border-gold/30"
                  }`}
                >
                  <span
                    className={`text-[10px] font-medium uppercase ${
                      isSelected ? "text-gold" : "text-muted-foreground"
                    }`}
                  >
                    {dayName}
                  </span>
                  <span
                    className={`font-serif text-xl font-bold ${
                      isSelected ? "text-gold" : "text-foreground"
                    }`}
                  >
                    {dayNum}
                  </span>
                  <span
                    className={`text-[10px] capitalize ${
                      isSelected ? "text-gold/70" : "text-muted-foreground/60"
                    }`}
                  >
                    {monthName}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 3: Time Selection */}
      {step === 3 && (
        <div className="flex-1 px-4 pt-4">
          {service && selectedDate && (
            <div className="mb-4 rounded-lg border border-gold/20 bg-gold/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {service.name}
                  </p>
                  <p className="text-xs text-gold/70">
                    {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
                <span className="text-sm font-bold text-gold">{service.price}</span>
              </div>
            </div>
          )}
          <p className="mb-4 text-sm text-muted-foreground">
            Escolha o horario:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((time) => {
              const dateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""
              const isBlocked = scheduleBlocks?.timeBlocks.some(
                (b) => b.time === time && (b.date === "*" || b.date === dateKey)
              ) ?? false
              const isTaken = TAKEN_SLOTS.includes(time) || isBlocked
              const isSelected = selectedTime === time

              return (
                <button
                  key={time}
                  onClick={() => !isTaken && handleTimeSelect(time)}
                  disabled={isTaken}
                  className={`rounded-lg border px-3 py-3 text-center transition-all ${
                    isTaken
                      ? "cursor-not-allowed border-border/50 bg-secondary/50 text-muted-foreground/30 line-through"
                      : isSelected
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-border bg-card text-foreground hover:border-gold/30"
                  }`}
                >
                  <span className="text-sm font-medium">{time}</span>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-center text-[10px] text-muted-foreground/50">
            Horarios riscados ja estao ocupados
          </p>
        </div>
      )}

      {/* Step 4: Client Data */}
      {step === 4 && (
        <div className="flex flex-1 flex-col px-4 pt-6">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
              <Scissors className="h-7 w-7 text-gold" />
            </div>
            <h2 className="font-serif text-xl font-bold text-foreground">Seus Dados</h2>
            <p className="mt-1 text-xs text-muted-foreground">Para confirmar o agendamento</p>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nome
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-auto pb-4 pt-6">
            <button
              onClick={() => clientName.trim() && setStep(5)}
              disabled={!clientName.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-4 font-serif text-base font-bold text-primary-foreground transition-colors hover:bg-gold-light disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Confirmation */}
      {step === 5 && service && selectedDate && selectedTime && (
        <div className="flex flex-1 flex-col px-4 pt-6">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
              <CalendarDays className="h-7 w-7 text-gold" />
            </div>
            <h2 className="font-serif text-xl font-bold text-foreground">
              Confirmar Agendamento
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Revise os detalhes abaixo
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Servico
              </span>
              <span className="font-serif text-sm font-semibold text-foreground">
                {service.name}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Data
              </span>
              <span className="text-sm text-foreground">
                {format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Horario
              </span>
              <span className="text-sm text-foreground">{selectedTime}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Valor
              </span>
              <span className="font-serif text-lg font-bold text-gold">
                {service.price}
              </span>
            </div>
          </div>

          <div className="mt-auto pb-4 pt-6">
            <button
              onClick={handleConfirm}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-4 font-serif text-base font-bold text-primary-foreground transition-colors hover:bg-gold-light active:bg-gold-dark"
            >
              <Check className="h-5 w-5" />
              Confirmar Agendamento
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
