"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { LogOut, Pencil, Trash2, MessageCircle, Check, X, CalendarDays, AlertCircle, ChevronDown, ChevronUp, Plus, KeyRound, Bell } from "lucide-react"
import type { BookingData, ServiceItem } from "./schedule-screen"
import { AdmScheduleManager, type ScheduleBlock } from "./adm-schedule-manager"
import { AdmCredentials } from "./adm-credentials"
import { AdmReminderSettings } from "./adm-reminder-settings"

interface AdmScreenProps {
  bookings: BookingData[]
  services: ServiceItem[]
  scheduleBlocks: ScheduleBlock
  onUpdateBooking: (index: number, updated: BookingData) => void
  onCancelBooking: (index: number) => void
  onDeleteBooking: (index: number) => void
  onUpdateServices: (services: ServiceItem[]) => void
  onUpdateScheduleBlocks: (blocks: ScheduleBlock) => void
  onLogout: () => void
}

const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","13:00","13:30","14:00","14:30","15:00",
  "15:30","16:00","16:30","17:00","17:30","18:00",
  "18:30","19:00","19:30",
]

export function AdmScreen({ bookings, services, scheduleBlocks, onUpdateBooking, onCancelBooking, onDeleteBooking, onUpdateServices, onUpdateScheduleBlocks, onLogout }: AdmScreenProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<BookingData>>({})
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null)
  const [showServicesPanel, setShowServicesPanel] = useState(false)
  const [showScheduleManager, setShowScheduleManager] = useState(false)
  const [showReminderSettings, setShowReminderSettings] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [editingService, setEditingService] = useState<number | null>(null)
  const [serviceEdit, setServiceEdit] = useState<Partial<ServiceItem>>({})

  function startServiceEdit(i: number) {
    setEditingService(i)
    setServiceEdit({ ...services[i] })
  }

  function saveServiceEdit() {
    if (editingService !== null) {
      const updated = services.map((s, i) => i === editingService ? { ...s, ...serviceEdit } : s)
      onUpdateServices(updated)
      setEditingService(null)
    }
  }

  function addService() {
    const newSvc: ServiceItem = {
      id: `svc-${Date.now()}`,
      name: "Novo Serviço",
      desc: "Descrição do serviço",
      price: "R$ 0",
      duration: "30 min",
    }
    onUpdateServices([...services, newSvc])
    setEditingService(services.length)
    setServiceEdit({ ...newSvc })
  }

  function removeService(i: number) {
    onUpdateServices(services.filter((_, idx) => idx !== i))
  }

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
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="px-4 py-3 flex flex-col items-center gap-3">
          <div className="text-center">
            <h1 className="font-serif text-base font-bold" style={{
              background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Painel ADM
            </h1>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">CAVILIA Studio Club</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => setShowScheduleManager(true)}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-all"
              style={{
                border: "1.5px solid rgba(212,160,23,0.3)",
                color: "rgba(212,160,23,0.6)",
              }}
              title="Folgas e horários bloqueados"
            >
              <X className="h-3 w-3" />
              Agenda
            </button>
            <button
              onClick={() => setShowServicesPanel(!showServicesPanel)}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-all"
              style={{
                border: showServicesPanel ? "1.5px solid #d4a017" : "1.5px solid rgba(212,160,23,0.3)",
                color: showServicesPanel ? "#d4a017" : "rgba(212,160,23,0.6)",
                background: showServicesPanel ? "rgba(212,160,23,0.08)" : "transparent",
              }}
            >
              <Pencil className="h-3 w-3" />
              Serviços
              {showServicesPanel ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
            </button>
            <button
              onClick={() => setShowReminderSettings(true)}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-all"
              style={{
                border: "1.5px solid rgba(212,160,23,0.3)",
                color: "rgba(212,160,23,0.6)",
              }}
              title="Configurações de Lembretes"
            >
              <Bell className="h-3 w-3" />
              Lembretes
            </button>
            <button
              onClick={() => setShowCredentials(true)}
              className="flex items-center justify-center rounded-md p-1.5 border border-border text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
              title="Credenciais ADM"
            >
              <KeyRound className="h-3 w-3" />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-400 border border-transparent hover:border-red-500/40"
            >
              <LogOut className="h-3 w-3" />
              Sair
            </button>
          </div>
        </div>

        {/* Painel de Serviços */}
        {showServicesPanel && (
          <div className="border-t border-border/50 bg-background/98 px-4 pb-4 pt-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">Gerenciar Serviços</p>
              <button
                onClick={addService}
                className="flex items-center gap-1 rounded-lg border border-gold/30 bg-gold/10 px-2.5 py-1.5 text-[10px] font-medium text-gold hover:bg-gold/20"
              >
                <Plus className="h-3 w-3" /> Adicionar
              </button>
            </div>
            <div className="flex flex-col gap-3 max-h-[65vh] overflow-y-auto pr-1">
              {services.map((svc, i) => (
                <div key={svc.id} className="rounded-lg border border-border bg-card overflow-hidden">
                  {editingService === i ? (
                    <div className="flex flex-col gap-2 p-3">
                      <input
                        value={serviceEdit.name || ""}
                        onChange={(e) => setServiceEdit({ ...serviceEdit, name: e.target.value })}
                        placeholder="Nome do serviço"
                        className="w-full rounded border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground focus:border-gold focus:outline-none"
                      />
                      <input
                        value={serviceEdit.desc || ""}
                        onChange={(e) => setServiceEdit({ ...serviceEdit, desc: e.target.value })}
                        placeholder="Descrição"
                        className="w-full rounded border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground focus:border-gold focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={serviceEdit.price || ""}
                          onChange={(e) => setServiceEdit({ ...serviceEdit, price: e.target.value })}
                          placeholder="Preço (ex: R$ 45)"
                          className="w-full rounded border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground focus:border-gold focus:outline-none"
                        />
                        <input
                          value={serviceEdit.duration || ""}
                          onChange={(e) => setServiceEdit({ ...serviceEdit, duration: e.target.value })}
                          placeholder="Duração (ex: 40 min)"
                          className="w-full rounded border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveServiceEdit} className="flex flex-1 items-center justify-center gap-1 rounded border border-gold/40 bg-gold/15 py-1.5 text-[10px] font-medium text-gold hover:bg-gold/25">
                          <Check className="h-3 w-3" /> Salvar
                        </button>
                        <button onClick={() => setEditingService(null)} className="flex flex-1 items-center justify-center gap-1 rounded border border-border py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-secondary">
                          <X className="h-3 w-3" /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-3.5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{svc.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{svc.desc} • {svc.duration}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs font-bold text-gold">{svc.price}</span>
                        <button onClick={() => startServiceEdit(i)} className="text-muted-foreground hover:text-gold">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => removeService(i)} className="text-muted-foreground hover:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {showReminderSettings && (
        <AdmReminderSettings onClose={() => setShowReminderSettings(false)} />
      )}

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
                      services={services}
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
                        services={services}
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
                        services={services}
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

      {/* Modal de Credenciais */}
      {showCredentials && (
        <AdmCredentials onClose={() => setShowCredentials(false)} />
      )}

      {/* Modal de Agenda */}
      {showScheduleManager && (
        <AdmScheduleManager
          blocks={scheduleBlocks}
          onUpdate={onUpdateScheduleBlocks}
          onClose={() => setShowScheduleManager(false)}
        />
      )}

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
                onClick={() => { onDeleteBooking(confirmCancel); setConfirmCancel(null) }}
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
  services: ServiceItem[]
  onEdit: () => void
  onSave: () => void
  onCancelEdit: () => void
  onDelete: () => void
  onWhatsApp: () => void
  onEditDataChange: (data: Partial<BookingData>) => void
  isPast?: boolean
}

function BookingCard({
  booking, isEditing, editData, services, onEdit, onSave, onCancelEdit,
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
              {services.map(s => (
                <option key={s.id} value={s.name}>{s.name} — {s.price}</option>
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
