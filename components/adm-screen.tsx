"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { LogOut, Pencil, Trash2, MessageCircle, Check, X, CalendarDays } from "lucide-react"
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

export function AdmScreen({ bookings, onUpdateBooking, onCancelBooking, onLogout }: AdmScreenProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<BookingData>>({})
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null)

  function startEdit(index: number) {
    setEditingIndex(index)
    setEditData({ ...bookings[index] })
  }

  function saveEdit() {
    if (editingIndex !== null && editData) {
      onUpdateBooking(editingIndex, { ...bookings[editingIndex], ...editData })
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

  const upcoming = bookings.filter((b) => b.date >= new Date())
  const past = bookings.filter((b) => b.date < new Date())

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
      <div className="grid grid-cols-3 border-b border-border">
        <div className="flex flex-col items-center border-r border-border py-3">
          <span className="font-serif text-2xl font-bold text-gold">{bookings.length}</span>
          <span className="text-[10px] text-muted-foreground">Total</span>
        </div>
        <div className="flex flex-col items-center border-r border-border py-3">
          <span className="font-serif text-2xl font-bold text-foreground">{upcoming.length}</span>
          <span className="text-[10px] text-muted-foreground">Próximos</span>
        </div>
        <div className="flex flex-col items-center py-3">
          <span className="font-serif text-2xl font-bold text-foreground">{past.length}</span>
          <span className="text-[10px] text-muted-foreground">Realizados</span>
        </div>
      </div>

      <div className="flex-1 px-4 pt-5">
        {bookings.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
            <CalendarDays className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum agendamento ainda</p>
            <p className="mt-1 text-xs text-muted-foreground/50">Os agendamentos dos clientes aparecerão aqui</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gold" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Próximos</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {upcoming.map((b, i) => (
                    <BookingCard
                      key={i}
                      booking={b}
                      index={i}
                      isEditing={editingIndex === i}
                      editData={editData}
                      onEdit={() => startEdit(i)}
                      onSave={saveEdit}
                      onCancelEdit={() => setEditingIndex(null)}
                      onCancel={() => setConfirmCancel(i)}
                      onWhatsApp={() => openWhatsApp(b.phone, b.clientName, b)}
                      onEditDataChange={setEditData}
                    />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Histórico</h2>
                </div>
                <div className="flex flex-col gap-3 opacity-60">
                  {past.map((b, i) => (
                    <BookingCard
                      key={`past-${i}`}
                      booking={b}
                      index={bookings.indexOf(b)}
                      isEditing={false}
                      editData={{}}
                      onEdit={() => {}}
                      onSave={() => {}}
                      onCancelEdit={() => {}}
                      onCancel={() => {}}
                      onWhatsApp={() => openWhatsApp(b.phone, b.clientName, b)}
                      onEditDataChange={() => {}}
                      isPast
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel dialog */}
      {confirmCancel !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-6 w-full max-w-sm rounded-lg border border-border bg-card p-6">
            <h3 className="font-serif text-lg font-bold text-foreground">Cancelar Agendamento?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Deseja cancelar o agendamento de <span className="text-foreground font-medium">{bookings[confirmCancel]?.clientName}</span>?
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
                Cancelar
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
  index: number
  isEditing: boolean
  editData: Partial<BookingData>
  onEdit: () => void
  onSave: () => void
  onCancelEdit: () => void
  onCancel: () => void
  onWhatsApp: () => void
  onEditDataChange: (data: Partial<BookingData>) => void
  isPast?: boolean
}

function BookingCard({
  booking, isEditing, editData, onEdit, onSave, onCancelEdit, onCancel, onWhatsApp, onEditDataChange, isPast
}: BookingCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header do card */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div>
          <p className="font-serif text-sm font-semibold text-foreground">{booking.clientName || "Cliente"}</p>
          <p className="text-xs text-muted-foreground">
            {format(booking.date, "dd/MM/yyyy", { locale: ptBR })} • {booking.time}
          </p>
        </div>
        {!isPast && (
          <div className="flex items-center gap-1">
            {booking.phone && (
              <button
                onClick={onWhatsApp}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-green-800/40 bg-green-900/20 text-green-400 transition-colors hover:bg-green-900/40"
                title="WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </button>
            )}
            {!isEditing && (
              <>
                <button
                  onClick={onEdit}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:border-gold/40 hover:text-gold text-muted-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onCancel}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:border-red-500/40 hover:text-red-400 text-muted-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Corpo do card */}
      {isEditing ? (
        <div className="flex flex-col gap-3 p-4">
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
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gold/20 border border-gold/40 py-2 text-xs font-medium text-gold hover:bg-gold/30"
            >
              <Check className="h-3.5 w-3.5" /> Salvar
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
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-foreground">{booking.service}</span>
          <span className="font-serif text-sm font-bold text-gold">{booking.price}</span>
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
