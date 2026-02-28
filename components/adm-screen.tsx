"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ArrowLeft, Settings, Pencil, Trash2, MessageCircle, Check, X,
  CalendarDays, AlertCircle, Plus, LogOut, KeyRound
} from "lucide-react"
import type { BookingData, ServiceItem } from "./schedule-screen"
import { AdmScheduleManager, type ScheduleBlock } from "./adm-schedule-manager"
import { AdmCredentials } from "./adm-credentials"
import { AdmReminderSettings } from "./adm-reminder-settings"

type TabId = "agenda" | "historico" | "servicos" | "lembretes"

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

export function AdmScreen({
  bookings, services, scheduleBlocks,
  onUpdateBooking, onCancelBooking, onDeleteBooking,
  onUpdateServices, onUpdateScheduleBlocks, onLogout
}: AdmScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>("agenda")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<BookingData>>({})
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [showGearMenu, setShowGearMenu] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [showScheduleManager, setShowScheduleManager] = useState(false)
  const [editingService, setEditingService] = useState<number | null>(null)
  const [serviceEdit, setServiceEdit] = useState<Partial<ServiceItem>>({})
  const serviceRefs = useRef<(HTMLDivElement | null)[]>([])

  const cancelled = bookings.filter((b) => b.status === "cancelled")
  const active = bookings.filter((b) => b.status !== "cancelled")
  const upcoming = active.filter((b) => new Date(b.date) >= new Date(new Date().setHours(0,0,0,0)))
  const past = active.filter((b) => new Date(b.date) < new Date(new Date().setHours(0,0,0,0)))

  function startEdit(index: number) {
    setEditingIndex(index)
    setEditData({ ...bookings[index] })
  }

  function saveEdit() {
    if (editingIndex !== null) {
      onUpdateBooking(editingIndex, {
        ...bookings[editingIndex],
        ...editData,
        status:
          editData.date !== bookings[editingIndex].date ||
          editData.time !== bookings[editingIndex].time
            ? "rescheduled"
            : bookings[editingIndex].status,
      })
      setEditingIndex(null)
    }
  }

  function openWhatsApp(phone: string, clientName: string, booking: BookingData) {
    const msg = encodeURIComponent(
      `Olá ${clientName}! Sou da CAVILIA Studio Club. Gostaria de falar sobre seu agendamento de ${booking.service} no dia ${format(new Date(booking.date), "dd/MM", { locale: ptBR })} às ${booking.time}.`
    )
    const number = phone.replace(/\D/g, "")
    window.open(`https://wa.me/55${number}?text=${msg}`, "_blank")
  }

  function startServiceEdit(i: number) {
    setEditingService(i)
    setServiceEdit({ ...services[i] })
  }

  function saveServiceEdit() {
    if (editingService !== null) {
      onUpdateServices(services.map((s, i) => i === editingService ? { ...s, ...serviceEdit } : s))
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

  useEffect(() => {
    if (editingService !== null) {
      const t = setTimeout(() => {
        serviceRefs.current[editingService]?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
      return () => clearTimeout(t)
    }
  }, [editingService])

  const tabs: { id: TabId; label: string }[] = [
    { id: "agenda", label: "Agenda" },
    { id: "historico", label: "Histórico" },
    { id: "servicos", label: "Serviços" },
    { id: "lembretes", label: "Lembretes" },
  ]

  return (
    <div className="flex min-h-screen flex-col pb-24">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="relative flex items-center px-4 py-3">
          {/* Seta voltar */}
          <button
            onClick={onLogout}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Título centralizado */}
          <div className="absolute left-0 right-0 flex flex-col items-center pointer-events-none">
            <span
              className="font-serif text-base font-bold"
              style={{
                background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Painel ADM
            </span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
              CAVILIA Studio Club
            </span>
          </div>

          {/* Engrenagem */}
          <div className="ml-auto relative">
            <button
              onClick={() => setShowGearMenu((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold hover:bg-gold/10"
            >
              <Settings className="h-4 w-4" />
            </button>

            {showGearMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowGearMenu(false)} />
                <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
                  <button
                    onClick={() => { setShowGearMenu(false); setShowScheduleManager(true) }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary"
                  >
                    <CalendarDays className="h-4 w-4 text-gold" />
                    Folgas e bloqueios
                  </button>
                  <div className="border-t border-border/50" />
                  <button
                    onClick={() => { setShowGearMenu(false); setShowCredentials(true) }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary"
                  >
                    <KeyRound className="h-4 w-4 text-gold" />
                    Trocar senha ADM
                  </button>
                  <div className="border-t border-border/50" />
                  <button
                    onClick={() => { setShowGearMenu(false); onLogout() }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-950/30"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── ABAS ── */}
        <div className="flex border-t border-border/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-xs font-medium tracking-wide transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-gold text-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── ABA: AGENDA ── */}
      {activeTab === "agenda" && (
        <div className="flex-1 px-4 pt-4">
          {upcoming.length === 0 ? (
            <div className="mt-10 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
              <CalendarDays className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Nenhum agendamento próximo</p>
            </div>
          ) : (
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
                    onDelete={() => setConfirmDelete(gi)}
                    onWhatsApp={() => openWhatsApp(b.phone, b.clientName, b)}
                    onEditDataChange={setEditData}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ABA: HISTÓRICO ── */}
      {activeTab === "historico" && (
        <div className="flex-1 px-4 pt-4">
          {/* Stats rápidos */}
          <div className="mb-4 grid grid-cols-4 rounded-xl border border-border bg-card overflow-hidden">
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

          {bookings.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
              <CalendarDays className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Nenhum agendamento ainda</p>
            </div>
          ) : (
            <>
              {cancelled.length > 0 && (
                <div className="mb-5">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-red-400">
                      Cancelados
                    </h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    {cancelled.map((b) => {
                      const gi = bookings.indexOf(b)
                      return (
                        <BookingCard
                          key={`c-${gi}`}
                          booking={b}
                          globalIndex={gi}
                          isEditing={editingIndex === gi}
                          editData={editData}
                          services={services}
                          onEdit={() => startEdit(gi)}
                          onSave={saveEdit}
                          onCancelEdit={() => setEditingIndex(null)}
                          onDelete={() => setConfirmDelete(gi)}
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
                  <div className="mb-2 flex items-center gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Realizados
                    </h2>
                  </div>
                  <div className="flex flex-col gap-3 opacity-70">
                    {past.map((b) => {
                      const gi = bookings.indexOf(b)
                      return (
                        <BookingCard
                          key={`p-${gi}`}
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
      )}

      {/* ── ABA: SERVIÇOS ── */}
      {activeTab === "servicos" && (
        <div className="flex-1 px-4 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">Gerenciar Serviços</p>
            <button
              onClick={addService}
              className="flex items-center gap-1 rounded-lg border border-gold/30 bg-gold/10 px-2.5 py-1.5 text-[10px] font-medium text-gold hover:bg-gold/20"
            >
              <Plus className="h-3 w-3" /> Adicionar
            </button>
          </div>
          <div className="flex flex-col gap-5">
            {services.map((svc, i) => (
              <div
                key={svc.id}
                ref={(el) => { serviceRefs.current[i] = el }}
                className={`rounded-xl border overflow-hidden shadow-lg ${
                  editingService === i
                    ? "border-gold/60 bg-card ring-2 ring-gold/30"
                    : "border-border bg-card"
                }`}
              >
                {editingService === i ? (
                  <div className="flex flex-col gap-4 p-4">
                    <div>
                      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Nome</label>
                      <input
                        value={serviceEdit.name || ""}
                        onChange={(e) => setServiceEdit({ ...serviceEdit, name: e.target.value })}
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Descrição</label>
                      <input
                        value={serviceEdit.desc || ""}
                        onChange={(e) => setServiceEdit({ ...serviceEdit, desc: e.target.value })}
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Preço</label>
                        <input
                          value={serviceEdit.price || ""}
                          onChange={(e) => setServiceEdit({ ...serviceEdit, price: e.target.value })}
                          className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Duração</label>
                        <input
                          value={serviceEdit.duration || ""}
                          onChange={(e) => setServiceEdit({ ...serviceEdit, duration: e.target.value })}
                          className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button onClick={saveServiceEdit} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gold/40 bg-gold/20 py-2.5 text-xs font-medium text-gold hover:bg-gold/30">
                        <Check className="h-4 w-4" /> Salvar
                      </button>
                      <button onClick={() => setEditingService(null)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary">
                        <X className="h-4 w-4" /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4 px-4 py-4 min-h-[80px]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{svc.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{svc.desc} • {svc.duration}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold text-gold whitespace-nowrap">{svc.price}</span>
                      <button
                        onClick={() => startServiceEdit(i)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground hover:border-gold/60 hover:text-gold active:scale-95"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeService(i)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/40 bg-red-900/40 text-red-300 hover:border-red-400 hover:text-red-200 active:scale-95"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ABA: LEMBRETES ── */}
      {activeTab === "lembretes" && (
        <div className="flex-1 px-4 pt-4">
          <AdmReminderSettings onClose={() => {}} inline />
        </div>
      )}

      {/* Modais */}
      {showCredentials && (
        <AdmCredentials onClose={() => setShowCredentials(false)} />
      )}
      {showScheduleManager && (
        <AdmScheduleManager
          blocks={scheduleBlocks}
          onUpdate={onUpdateScheduleBlocks}
          onClose={() => setShowScheduleManager(false)}
        />
      )}

      {/* Confirmação de remoção */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-6 w-full max-w-sm rounded-lg border border-border bg-card p-6">
            <h3 className="font-serif text-lg font-bold text-foreground">Remover Agendamento?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Remover definitivamente o agendamento de{" "}
              <span className="font-medium text-foreground">{bookings[confirmDelete]?.clientName}</span>?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-foreground"
              >
                Manter
              </button>
              <button
                onClick={() => { onDeleteBooking(confirmDelete); setConfirmDelete(null) }}
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
  booking, isEditing, editData, services,
  onEdit, onSave, onCancelEdit, onDelete, onWhatsApp, onEditDataChange, isPast
}: BookingCardProps) {
  const isCancelled = booking.status === "cancelled"
  const isRescheduled = booking.status === "rescheduled"

  return (
    <div className={`rounded-lg border overflow-hidden ${
      isCancelled ? "border-red-500/50 bg-red-950/30" : "border-border bg-card"
    }`}>
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
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Remarcado</span>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className={`font-serif text-sm font-semibold ${isCancelled ? "text-red-300 line-through" : "text-foreground"}`}>
            {booking.clientName || "Cliente"}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(booking.date), "dd/MM/yyyy", { locale: ptBR })} • {booking.time}
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
                  title="Editar / Remarcar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onDelete}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-red-500/40 hover:text-red-400"
                  title="Remover"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-3 border-t border-border/50 p-4">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Serviço</label>
            <select
              value={editData.service || booking.service}
              onChange={(e) => {
                const svc = services.find(s => s.name === e.target.value)
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
                value={editData.date ? format(new Date(editData.date), "yyyy-MM-dd") : format(new Date(booking.date), "yyyy-MM-dd")}
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
