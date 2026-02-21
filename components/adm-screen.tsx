"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { LogOut, Pencil, Trash2, MessageCircle, Check, X, CalendarDays, AlertCircle } from "lucide-react"
import type { BookingData } from "./schedule-screen"

interface AdmScreenProps {
  bookings: BookingData[]
  onUpdateBooking: (index: number, updated: BookingData) => void
  onCancelBooking: (index: number) => void
  onLogout: () => void
}

const SERVICES_LIST = [
  { name: "Corte Classico", price: "R$ 45" },
  { name: "Barba Completa", price: "R$ 35" },
  { name: "Combo Premium", price: "R$ 70" },
  { name: "Design Sobrancelha", price: "R$ 20" },
  { name: "Hidratacao Capilar", price: "R$ 50" },
  { name: "Corte + Barba", price: "R$ 65" },
  { name: "Bigode", price: "R$ 15" },
  { name: "Pigmentacao Barba", price: "R$ 40" },
]

const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","13:00","13:30","14:00","14:30","15:00",
  "15:30","16:00","16:30","17:00","17:30","18:00",
  "18:30","19:00","19:30",
]

export function AdmScreen({ bookings, onUpdateBooking, onCancelBooking, onLogout }: AdmScreenProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<BookingData>>({})
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null)

  function startEdit(index: number) {
    setEditingIndex(index)
    setEditData({ ...bookings[index] })
  }

  function saveEdit() {
    if (editingIndex !== null) {
      onUpdateBooking(editingIndex, {
        ...bookings[editingIndex],
        ...editData,
        status: editData.date !== bookings[editingIndex].date || editData.time !== bookings[editingIndex].time
          ? "rescheduled"
          : bookings[editingIndex].status,
      })
      setEditingIndex(null)
    }
  }

  function openWhatsApp(phone: string, clientName: string, booking: BookingData) {
    const msg = encodeURIComponent(
      `Olá ${clientName}! Sou da CAVILIA Studio Club. Gostaria de falar sobre seu agendamento de ${booking.service} no dia ${format(booking.date, "dd/MM", { locale: ptBR })} às ${booking.time}.`
    )
    const number = phone.replace(/\D/g, "")
    window.open(`https://wa.me/55${number}?text=${msg}`, "_blank")
  }

  const cancelled = bookings.filter((b) => b.status === "cancelled")
  const active = bookings.filter((b) => b.status !== "cancelled")
  const upcoming = active.filter((b) => b.date >= new Date())
  const past = active.filter((b) => b.date < new Date())

  return (
    <div className="flex min-h-screen flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-lg font-bold" style={{
            background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Painel ADN
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">CAVILIA Studio Club</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-4 border-b border-border">
        <div className="flex flex-col items-center border-r border-border py-3">
          <span className="font-serif text-xl font-bold text-gold">{bookings.length}</span>
          <span className="text-[9px] text-muted-foreground">Total</span>
        </div>
        <div className="flex flex-col items-center border-r border-border py-3">
          <span className="font-serif text-xl font-bold text-foreground">{upcoming.length}</span>
          <span className="text-[9px] text-muted-foreground">Próximos</span>
        </div>
        <div className="flex flex-col items-center border-r border-border py-3">
          <span className="font-serif text-xl font-bold text-foreground">{past.length}</span>
          <span className="text-[9px] text-muted-foreground">Realizados</span>
        </div>
        <div className="flex flex-col items-center py-3">
          <span className="font-serif text-xl font-bold text-red-400">{cancelled.length}</span>
          <span className="text-[9px] text-muted-foreground">Cancelados</span>
        </div>
      </div>

      <div className="flex-1 px-4 pt-5">
        {bookings.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
            <CalendarDays className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum agendamento ainda</p>
          </div>
        ) : (
          <>
            {/* Cancelamentos — aparecem primeiro com destaque vermelho */}
            {cancelled.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400">
                    Cancelados pelo cliente
                  </h2>
                </div>
                <div className="flex flex-col gap-3">
                  {cancelled.map((b, i) => (
                    <BookingCard
                      key={`cancelled-${i}`}
                      booking={b}
                      globalIndex={bookings.indexOf(b)}
                      isEditing={editingIndex === bookings.indexOf(b)}
                      editData={editData}
                      onEdit={() => startEdit(bookings.indexOf(b))}
                      onSave={saveEdit}
                      onCancelEdit={() => setEditingIndex(null)}
                      onDelete={() => setConfirmCancel(bookings.indexOf(b))}
                      onWhatsApp={() => openWhatsApp(b.phone, b.clientName, b)}
                      onEditDataChange={setEditData}
                    />
                  ))}
                </div>
              </div>
            )}

            {upcoming.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gold" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Próximos</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {upcoming.map((b) => {
                    const gi = bookings.indexOf(b)
                    return (
                      <BookingCard
                        key={gi}
                        booking={b}
                        globalIndex={gi}
                        isEditing={editingIndex === gi}
                        editData={editData}
                        onEdit={() => startEdit(gi)}
                        onSave={saveEdit}
                        onCancelEdit={() => setEditingIndex(null)}
                        onDelete={() => setConfirmCancel(gi)}
                        onWhatsApp={() => openWhatsApp(b.phone, b.clientName, b)}
                        onEditDataChange={setEditData}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Histórico</h2>
                </div>
                <div className="flex flex-col gap-3 opacity-60">
                  {past.map((b) => {
                    const gi = bookings.indexOf(b)
                    return (
                      <BookingCard
                        key={`past-${gi}`}
                        booking={b}
                        globalIndex={gi}
                        isEditing={false}
                        editData={{}}
                        onEdit={() => {}}
                        onSave={() => {}}
                        onCancelEdit={() => {}}
                        onDelete={() => {}}
                        onWhatsApp={() => openWhatsApp(b.phone, b.clientName, b)}
                        onEditDataChange={() => {}}
                        isPast
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialog de confirmação de remoção */}
      {confirmCancel !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-6 w-full max-w-sm rounded-lg border border-border bg-card p-6">
            <h3 className="font-serif text-lg font-bold text-foreground">Remover Agendamento?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Remover definitivamente o agendamento de{" "}
              <span className="font-medium text-foreground">{bookings[confirmCancel]?.clientName}</span>?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmCancel(null)}
                className="flex-1 rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/80"
              >
                Manter
              </button>
              <button
                onClick={() => { onCancelBooking(confirmCancel); setConfirmCancel(null) }}
                className="flex-1 rounded-lg bg-red-900/60 px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-900/80"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface BookingCardProps {
  booking: BookingData
  globalIndex: number
  isEditing: boolean
  editData: Partial<BookingData>
  onEdit: () => void
  onSave: () => void
  onCancelEdit: () => void
  onDelete: () => void
  onWhatsApp: () => void
  onEditDataChange: (data: Partial<BookingData>) => void
  isPast?: boolean
}

function BookingCard({
  booking, isEditing, editData, onEdit, onSave, onCancelEdit,
  onDelete, onWhatsApp, onEditDataChange, isPast
}: BookingCardProps) {
  const isCancelled = booking.status === "cancelled"
  const isRescheduled = booking.status === "rescheduled"

  return (
    <div className={`rounded-lg border overflow-hidden ${
      isCancelled
        ? "border-red-500/50 bg-red-950/30"
        : "border-border bg-card"
    }`}>
      {/* Faixa de status cancelado */}
      {isCancelled && (
        <div className="flex items-center gap-2 bg-red-900/50 px-4 py-2 border-b border-red-500/30">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
            <X className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">
            Cancelado pelo cliente
          </span>
        </div>
      )}
      {isRescheduled && (
        <div className="flex items-center gap-2 bg-amber-900/40 px-4 py-2 border-b border-amber-500/30">
          <CalendarDays className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Remarcado
          </span>
        </div>
      )}

      {/* Header do card */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className={`font-serif text-sm font-semibold ${isCancelled ? "text-red-300 line-through" : "text-foreground"}`}>
            {booking.clientName || "Cliente"}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(booking.date, "dd/MM/yyyy", { locale: ptBR })} • {booking.time}
          </p>
        </div>
        {!isPast && (
          <div className="flex items-center gap-1">
            {booking.phone && (
              <button
                onClick={onWhatsApp}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-green-800/40 bg-green-900/20 text-green-400 hover:bg-green-900/40"
                title="WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </button>
            )}
            {!isEditing && (
              <>
                <button
                  onClick={onEdit}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-gold/40 hover:text-gold"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onDelete}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-red-500/40 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Formulário de edição */}
      {isEditing ? (
        <div className="flex flex-col gap-3 border-t border-border/50 p-4">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Serviço</label>
            <select
              value={editData.service || booking.service}
              onChange={(e) => {
                const svc = SERVICES_LIST.find(s => s.name === e.target.value)
                onEditDataChange({ ...editData, service: e.target.value, price: svc?.price || editData.price })
              }}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
            >
              {SERVICES_LIST.map(s => (
                <option key={s.name} value={s.name}>{s.name} — {s.price}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Valor</label>
            <input
              type="text"
              value={editData.price || booking.price}
              onChange={(e) => onEditDataChange({ ...editData, price: e.target.value })}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Data</label>
              <input
                type="date"
                value={editData.date ? format(new Date(editData.date), "yyyy-MM-dd") : format(booking.date, "yyyy-MM-dd")}
                onChange={(e) => onEditDataChange({ ...editData, date: new Date(e.target.value + "T12:00:00") })}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Horário</label>
              <select
                value={editData.time || booking.time}
                onChange={(e) => onEditDataChange({ ...editData, time: e.target.value })}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
              >
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={onSave}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gold/40 bg-gold/20 py-2 text-xs font-medium text-gold hover:bg-gold/30"
            >
              <Check className="h-3.5 w-3.5" /> Salvar Remarcar
            </button>
            <button
              onClick={onCancelEdit}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
          <span className={`text-sm ${isCancelled ? "text-muted-foreground/50 line-through" : "text-foreground"}`}>
            {booking.service}
          </span>
          <span className={`font-serif text-sm font-bold ${isCancelled ? "text-muted-foreground/50" : "text-gold"}`}>
            {booking.price}
          </span>
        </div>
      )}

      {booking.phone && !isEditing && (
        <div className="border-t border-border/50 px-4 py-2">
          <span className="text-[10px] text-muted-foreground/60">WhatsApp: </span>
          <span className="text-[10px] text-muted-foreground">{booking.phone}</span>
        </div>
      )}
    </div>
  )
}
