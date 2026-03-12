"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { X, ChevronLeft, ChevronRight, Moon, Clock, Trash2 } from "lucide-react"
import { toast } from "sonner"

export interface ScheduleBlock {
  dayoffs: string[]        // YYYY-MM-DD — dias fechados
  timeBlocks: TimeBlock[]  // horários bloqueados
}

export interface TimeBlock {
  date: string   // YYYY-MM-DD ou "*" para todos os dias
  time: string   // "12:00"
  label: string  // "Almoço", "Fechado", etc.
}

interface AdmScheduleManagerProps {
  blocks: ScheduleBlock
  onUpdate: (blocks: ScheduleBlock) => void
  onClose: () => void
}

const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30",
  "18:00","18:30","19:00","19:30","20:00","20:30",
  "21:00","21:30","22:00",
]

const BLOCK_LABELS = ["Almoço", "Fechado", "Reunião", "Horário reservado", "Saída antecipada"]

const LEAD_OPTIONS = [
  { value: 0, label: "Sem antecedência mínima" },
  { value: 30, label: "30 minutos" },
  { value: 60, label: "1 hora" },
  { value: 120, label: "2 horas" },
]

export function AdmScheduleManager({ blocks, onUpdate, onClose }: AdmScheduleManagerProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [tab, setTab] = useState<"calendar" | "timeblocks">("calendar")
  const [newTimeLabel, setNewTimeLabel] = useState("Almoço")
  const [newTimeSlot, setNewTimeSlot] = useState("12:00")
  const [newTimeDate, setNewTimeDate] = useState<"*" | string>("*")
  const [leadMinutes, setLeadMinutes] = useState<number | null>(null)
  const [savingLead, setSavingLead] = useState(false)

  // Semana atual baseada no offset
  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const today = new Date()

  function dateKey(d: Date) {
    return format(d, "yyyy-MM-dd")
  }

  function isDayOff(d: Date) {
    return blocks.dayoffs.includes(dateKey(d))
  }

  function toggleDayOff(d: Date) {
    const key = dateKey(d)
    const newDayoffs = isDayOff(d)
      ? blocks.dayoffs.filter((x) => x !== key)
      : [...blocks.dayoffs, key]
    onUpdate({ ...blocks, dayoffs: newDayoffs })
  }

  function addTimeBlock() {
    const newBlock: TimeBlock = {
      date: newTimeDate,
      time: newTimeSlot,
      label: newTimeLabel,
    }
    // Evita duplicatas
    const exists = blocks.timeBlocks.some(
      (b) => b.date === newTimeDate && b.time === newTimeSlot
    )
    if (exists) return
    onUpdate({ ...blocks, timeBlocks: [...blocks.timeBlocks, newBlock] })
  }

  function removeTimeBlock(idx: number) {
    onUpdate({ ...blocks, timeBlocks: blocks.timeBlocks.filter((_, i) => i !== idx) })
  }

  const goldGradient = {
    background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 50%, #f0bc2a 100%)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    backgroundClip: "text" as const,
  }

  const recurringBlocks = blocks.timeBlocks.filter((b) => b.date === "*")
  const specificBlocks = blocks.timeBlocks.filter((b) => b.date !== "*")

  useEffect(() => {
    let cancelled = false
    async function loadLead() {
      try {
        const r = await fetch("/api/app-settings?key=min_lead_minutes", { cache: "no-store" })
        if (!r.ok) throw new Error()
        const data = await r.json().catch(() => ({}))
        const n = data && typeof data.value === "string" ? parseInt(data.value, 10) : Number(data.value)
        if (!cancelled) {
          setLeadMinutes(Number.isFinite(n) && n >= 0 ? n : 0)
        }
      } catch {
        if (!cancelled) setLeadMinutes(0)
      }
    }
    loadLead()
    return () => { cancelled = true }
  }, [])

  async function handleLeadChange(next: number) {
    setLeadMinutes(next)
    setSavingLead(true)
    try {
      const r = await fetch("/api/app-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "min_lead_minutes", value: String(next) }),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        throw new Error(data.error || "Erro ao salvar configuração")
      }
      toast.success("Antecedência mínima atualizada!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar antecedência")
    } finally {
      setSavingLead(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-[#110e0b] max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-[#110e0b] px-4 py-4">
          <h2 className="font-serif text-lg font-bold" style={goldGradient}>
            Agenda do Barbeiro
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Configuração de antecedência mínima */}
        <div className="px-4 pt-3">
          <div className="mb-3 rounded-lg border border-border bg-card px-3 py-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Antecedência mínima para agendar
            </p>
            <p className="mb-2 text-[11px] text-muted-foreground">
              Define quanto tempo antes do horário o cliente pode marcar (ex: não permitir agendar para daqui a 5 minutos).
            </p>
            <select
              value={leadMinutes ?? 0}
              onChange={(e) => handleLeadChange(parseInt(e.target.value, 10))}
              disabled={leadMinutes === null || savingLead}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none disabled:opacity-60"
            >
              {LEAD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("calendar")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              tab === "calendar" ? "border-b-2 border-gold text-gold" : "text-muted-foreground"
            }`}
          >
            <Moon className="h-4 w-4" /> Dias de Folga
          </button>
          <button
            onClick={() => setTab("timeblocks")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              tab === "timeblocks" ? "border-b-2 border-gold text-gold" : "text-muted-foreground"
            }`}
          >
            <Clock className="h-4 w-4" /> Horários Bloqueados
          </button>
        </div>

        {/* TAB: DIAS DE FOLGA */}
        {tab === "calendar" && (
          <div className="p-4">
            <p className="mb-4 text-xs text-muted-foreground">
              Toque em um dia para marcar como <span className="text-red-400 font-medium">Fechado</span>. O cliente não verá esses dias no agendamento.
            </p>

            {/* Navegação de semana */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-gold/40 hover:text-gold"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-foreground">
                {format(weekStart, "dd MMM", { locale: ptBR })} —{" "}
                {format(addDays(weekStart, 6), "dd MMM yyyy", { locale: ptBR })}
              </span>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-gold/40 hover:text-gold"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-muted-foreground/60 pb-1">{d}</div>
              ))}
              {weekDays.map((day) => {
                const off = isDayOff(day)
                const isToday = isSameDay(day, today)
                const isPast = day < today && !isToday
                const isSunday = day.getDay() === 0

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => !isPast && toggleDayOff(day)}
                    disabled={isPast}
                    className={`flex flex-col items-center rounded-lg py-2 transition-all ${
                      isPast
                        ? "opacity-30 cursor-not-allowed"
                        : off
                          ? "bg-red-900/50 border border-red-500/60"
                          : isSunday
                            ? "border border-amber-800/40 bg-amber-900/20 hover:bg-amber-900/40"
                            : "border border-border bg-card hover:border-gold/40"
                    }`}
                  >
                    <span className={`text-[10px] font-medium ${off ? "text-red-300" : isSunday ? "text-amber-400" : "text-muted-foreground"}`}>
                      {format(day, "dd")}
                    </span>
                    {off && <span className="text-[8px] text-red-400 mt-0.5">Folga</span>}
                    {isSunday && !off && <span className="text-[8px] text-amber-500/70 mt-0.5">Dom</span>}
                    {isToday && !off && <span className="text-[8px] text-gold mt-0.5">Hoje</span>}
                  </button>
                )
              })}
            </div>

            {/* Resumo de folgas */}
            {blocks.dayoffs.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Folgas marcadas</p>
                <div className="flex flex-col gap-1.5">
                  {blocks.dayoffs.sort().map((d) => (
                    <div key={d} className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-900/20 px-3 py-2">
                      <span className="text-sm text-red-300">
                        {format(new Date(d + "T12:00:00"), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </span>
                      <button
                        onClick={() => onUpdate({ ...blocks, dayoffs: blocks.dayoffs.filter((x) => x !== d) })}
                        className="text-red-400/60 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: HORÁRIOS BLOQUEADOS */}
        {tab === "timeblocks" && (
          <div className="p-4">
            <p className="mb-4 text-xs text-muted-foreground">
              Bloqueie horários que ficam <span className="text-amber-400 font-medium">indisponíveis para todos os dias</span> (ex: almoço, fechamento). Para um dia específico, escolha a data no seletor.
            </p>

            {/* Formulário de novo bloqueio */}
            <div className="rounded-lg border border-border bg-card p-4 mb-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold">Novo bloqueio</p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Motivo</label>
                  <select
                    value={newTimeLabel}
                    onChange={(e) => setNewTimeLabel(e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                  >
                    {BLOCK_LABELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Horário</label>
                    <select
                      value={newTimeSlot}
                      onChange={(e) => setNewTimeSlot(e.target.value)}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                    >
                      {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Dia</label>
                    <select
                      value={newTimeDate}
                      onChange={(e) => setNewTimeDate(e.target.value)}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                    >
                      <option value="*">Todos os dias</option>
                      {Array.from({ length: 21 }, (_, i) => addDays(new Date(), i)).map((d) => (
                        <option key={dateKey(d)} value={dateKey(d)}>
                          {format(d, "dd/MM (EEE)", { locale: ptBR })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={addTimeBlock}
                  className="w-full rounded-lg py-2.5 text-sm font-bold transition-all"
                  style={{ background: "#2a2420", border: "2px solid #d4a017", boxShadow: "0 0 8px rgba(212,160,23,0.3)" }}
                >
                  <span style={goldGradient}>+ Adicionar Bloqueio</span>
                </button>
              </div>
            </div>

            {/* Bloqueios recorrentes (todos os dias) */}
            {recurringBlocks.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2">
                  <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">🔒 Bloqueados — Todos os dias</p>
                  <span className="text-[10px] text-muted-foreground/50">(toque no lixo para desbloquear)</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {recurringBlocks.map((b, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-amber-800/40 bg-amber-900/15 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-amber-300">{b.time}</span>
                        <span className="text-[10px] text-muted-foreground bg-amber-900/30 px-1.5 py-0.5 rounded">{b.label}</span>
                      </div>
                      <button
                        onClick={() => removeTimeBlock(blocks.timeBlocks.indexOf(b))}
                        className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-red-400/70 hover:bg-red-900/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Desbloquear
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bloqueios específicos */}
            {specificBlocks.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Dias específicos</p>
                <div className="flex flex-col gap-1.5">
                  {specificBlocks.map((b, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
                      <div>
                        <span className="text-sm font-medium text-foreground">{b.time}</span>
                        <span className="mx-1.5 text-muted-foreground/40">•</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(b.date + "T12:00:00"), "dd/MM", { locale: ptBR })}
                        </span>
                        <span className="ml-2 text-xs text-gold/70">{b.label}</span>
                      </div>
                      <button onClick={() => removeTimeBlock(blocks.timeBlocks.indexOf(b))} className="text-muted-foreground/50 hover:text-red-400">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recurringBlocks.length === 0 && specificBlocks.length === 0 && (
              <p className="text-center text-sm text-muted-foreground/50 py-6">Nenhum horário bloqueado</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
