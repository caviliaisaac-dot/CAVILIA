"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, BellRing, Clock, CalendarClock, Timer, Plus, Trash2, Check, X, Zap, Info } from "lucide-react"
import { toast } from "sonner"

export type ReminderUnit = "day" | "hour" | "minute"

export interface ReminderSettingItem {
  id: string
  unidade: ReminderUnit
  quantidade: number
  ativo: boolean
  quantidadeDias?: number
  quantidadeHoras?: number
  quantidadeMinutos?: number
}

interface AdmReminderSettingsProps {
  onClose: () => void
  inline?: boolean
  onEditWhatsAppMessage?: () => void
}

interface Preset {
  icon: typeof Bell
  label: string
  desc: string
  color: string
  match: (item: ReminderSettingItem) => boolean
  create: () => { unidade: ReminderUnit; quantidade: number }
}

const PRESETS: Preset[] = [
  {
    icon: CalendarClock,
    label: "1 dia antes",
    desc: "Lembrete na véspera do atendimento",
    color: "#3b82f6",
    match: (i) => i.unidade === "day" && i.quantidade === 1 && !(i.quantidadeDias || i.quantidadeHoras || i.quantidadeMinutos),
    create: () => ({ unidade: "day" as ReminderUnit, quantidade: 1 }),
  },
  {
    icon: Clock,
    label: "1 hora antes",
    desc: "Aviso para o cliente se preparar",
    color: "#f59e0b",
    match: (i) => i.unidade === "hour" && i.quantidade === 1 && !(i.quantidadeDias || i.quantidadeHoras || i.quantidadeMinutos),
    create: () => ({ unidade: "hour" as ReminderUnit, quantidade: 1 }),
  },
  {
    icon: Timer,
    label: "15 minutos antes",
    desc: "Último aviso — hora de ir!",
    color: "#ef4444",
    match: (i) => i.unidade === "minute" && i.quantidade === 15 && !(i.quantidadeDias || i.quantidadeHoras || i.quantidadeMinutos),
    create: () => ({ unidade: "minute" as ReminderUnit, quantidade: 15 }),
  },
]

function buildLabel(item: ReminderSettingItem): string {
  const dias = item.quantidadeDias ?? 0
  const horas = item.quantidadeHoras ?? 0
  const mins = item.quantidadeMinutos ?? 0
  if (dias > 0 || horas > 0 || mins > 0) {
    return (
      [
        dias ? `${dias} ${dias === 1 ? "dia" : "dias"}` : "",
        horas ? `${horas} ${horas === 1 ? "hora" : "horas"}` : "",
        mins ? `${mins} ${mins === 1 ? "min" : "min"}` : "",
      ]
        .filter(Boolean)
        .join(", ") + " antes"
    )
  }
  const q = item.quantidade
  if (item.unidade === "day") return `${q} ${q === 1 ? "dia" : "dias"} antes`
  if (item.unidade === "hour") return `${q} ${q === 1 ? "hora" : "horas"} antes`
  return `${q} ${q === 1 ? "minuto" : "minutos"} antes`
}

function isPreset(item: ReminderSettingItem): boolean {
  return PRESETS.some((p) => p.match(item))
}

export function AdmReminderSettings({ onClose, inline, onEditWhatsAppMessage }: AdmReminderSettingsProps) {
  const [list, setList] = useState<ReminderSettingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [customUnit, setCustomUnit] = useState<ReminderUnit>("hour")
  const [customQty, setCustomQty] = useState(2)
  const [initialSetupDone, setInitialSetupDone] = useState(false)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch("/api/reminder-settings", { cache: "no-store" })
      if (!r.ok) throw new Error()
      const data: ReminderSettingItem[] = await r.json()
      setList(data)
      return data
    } catch {
      toast.error("Erro ao carregar lembretes")
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchList().then(async (data) => {
      if (data.length === 0 && !initialSetupDone) {
        setInitialSetupDone(true)
        await setupDefaults()
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function setupDefaults() {
    const created: ReminderSettingItem[] = []
    for (const preset of PRESETS) {
      try {
        const { unidade, quantidade } = preset.create()
        const r = await fetch("/api/reminder-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unidade, quantidade, ativo: true }),
        })
        if (r.ok) {
          const item = await r.json()
          created.push(item)
        }
      } catch { /* silently skip */ }
    }
    if (created.length > 0) {
      setList(created)
      toast.success(`${created.length} lembretes padrão configurados!`)
    }
  }

  function findPresetItem(preset: Preset): ReminderSettingItem | undefined {
    return list.find((i) => preset.match(i))
  }

  async function togglePreset(preset: Preset) {
    const existing = findPresetItem(preset)
    if (existing) {
      try {
        const r = await fetch(`/api/reminder-settings/${existing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ativo: !existing.ativo }),
        })
        if (!r.ok) throw new Error()
        const updated = await r.json()
        setList((prev) => prev.map((x) => (x.id === existing.id ? updated : x)))
      } catch {
        toast.error("Erro ao atualizar lembrete")
      }
    } else {
      try {
        const { unidade, quantidade } = preset.create()
        const r = await fetch("/api/reminder-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unidade, quantidade, ativo: true }),
        })
        if (!r.ok) throw new Error()
        const created = await r.json()
        setList((prev) => [...prev, created])
        toast.success(`"${preset.label}" ativado!`)
      } catch {
        toast.error("Erro ao criar lembrete")
      }
    }
  }

  async function addCustomReminder() {
    if (customQty < 1) return
    try {
      const r = await fetch("/api/reminder-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unidade: customUnit, quantidade: customQty, ativo: true }),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        throw new Error(data.error || "Erro ao criar")
      }
      const created = await r.json()
      setList((prev) => [...prev, created])
      setAdding(false)
      setCustomQty(2)
      setCustomUnit("hour")
      toast.success("Lembrete personalizado criado!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao adicionar")
    }
  }

  async function toggleCustom(item: ReminderSettingItem) {
    try {
      const r = await fetch(`/api/reminder-settings/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !item.ativo }),
      })
      if (!r.ok) throw new Error()
      const updated = await r.json()
      setList((prev) => prev.map((x) => (x.id === item.id ? updated : x)))
    } catch {
      toast.error("Erro ao atualizar")
    }
  }

  async function removeCustom(id: string) {
    try {
      const r = await fetch(`/api/reminder-settings/${id}`, { method: "DELETE" })
      if (!r.ok) throw new Error()
      setList((prev) => prev.filter((x) => x.id !== id))
      toast.success("Lembrete removido")
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  const customItems = list.filter((i) => !isPreset(i))
  const activeCount = list.filter((i) => i.ativo).length

  const body = (
    <div className={inline ? "flex flex-col gap-5 pb-4" : "flex-1 overflow-y-auto px-4 py-6"}>
      {/* Header info */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BellRing className="h-4 w-4 text-gold" />
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">
            Lembretes Automáticos
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Configure quando o cliente recebe um aviso no celular antes do atendimento.
          O lembrete chega como notificação push com som e vibração.
        </p>
      </div>

      {/* Status pill + WhatsApp message config */}
      <div className="flex items-center justify-between gap-2">
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
          activeCount > 0
            ? "border border-green-500/40 bg-green-500/10 text-green-400"
            : "border border-red-500/40 bg-red-500/10 text-red-400"
        }`}>
          <Zap className="h-3 w-3" />
          {activeCount > 0 ? `${activeCount} lembrete${activeCount > 1 ? "s" : ""} ativo${activeCount > 1 ? "s" : ""}` : "Nenhum lembrete ativo"}
        </div>
        {onEditWhatsAppMessage && (
          <button
            type="button"
            onClick={onEditWhatsAppMessage}
            className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold hover:bg-gold/20"
          >
            Mensagem WhatsApp
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Smart Presets */}
          <div>
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Lembretes Recomendados
            </p>
            <div className="flex flex-col gap-2.5">
              {PRESETS.map((preset) => {
                const existing = findPresetItem(preset)
                const active = existing?.ativo ?? false
                const Icon = preset.icon
                return (
                  <button
                    key={preset.label}
                    onClick={() => togglePreset(preset)}
                    className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
                      active
                        ? "border-gold/50 bg-gold/5 shadow-[0_0_12px_rgba(212,160,23,0.1)]"
                        : "border-border bg-card hover:border-border/80 hover:bg-secondary/30"
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all"
                      style={{
                        background: active ? `${preset.color}20` : "rgba(255,255,255,0.05)",
                        border: `1.5px solid ${active ? preset.color : "rgba(255,255,255,0.1)"}`,
                      }}
                    >
                      <Icon className="h-4.5 w-4.5" style={{ color: active ? preset.color : "rgba(255,255,255,0.3)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}>
                        {preset.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70">{preset.desc}</p>
                    </div>
                    <div
                      className={`flex h-7 w-12 items-center rounded-full px-0.5 transition-all ${
                        active ? "bg-gold justify-end" : "bg-secondary justify-start"
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full shadow-md transition-all ${active ? "bg-black" : "bg-muted-foreground/40"}`} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom reminders */}
          <div>
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Lembretes Personalizados
            </p>

            {customItems.length > 0 && (
              <div className="mb-2.5 flex flex-col gap-2">
                {customItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                      item.ativo ? "border-border bg-card" : "border-border/50 bg-card/50 opacity-60"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
                      <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{buildLabel(item)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleCustom(item)}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                          item.ativo
                            ? "border border-gold/50 bg-gold/10 text-gold"
                            : "border border-border bg-secondary text-muted-foreground"
                        }`}
                      >
                        {item.ativo ? "ON" : "OFF"}
                      </button>
                      <button
                        onClick={() => removeCustom(item.id)}
                        className="rounded-lg p-1.5 text-muted-foreground/50 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adding ? (
              <div className="rounded-xl border border-gold/30 bg-card p-4">
                <p className="mb-3 text-xs font-semibold text-gold">Novo lembrete</p>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] uppercase text-muted-foreground">Avisar</label>
                    <input
                      type="number"
                      min={1}
                      value={customQty}
                      onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] uppercase text-muted-foreground">Unidade</label>
                    <select
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value as ReminderUnit)}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                    >
                      <option value="minute">minutos antes</option>
                      <option value="hour">horas antes</option>
                      <option value="day">dias antes</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addCustomReminder}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gold/40 bg-gold/20 py-2.5 text-xs font-medium text-gold hover:bg-gold/30"
                  >
                    <Check className="h-3.5 w-3.5" /> Salvar
                  </button>
                  <button
                    onClick={() => setAdding(false)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
                  >
                    <X className="h-3.5 w-3.5" /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3.5 text-xs font-medium text-muted-foreground hover:border-gold/40 hover:text-gold hover:bg-gold/5 transition-all"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar lembrete personalizado
              </button>
            )}
          </div>

          {/* Info box */}
          <div className="rounded-xl border border-border/50 bg-secondary/30 px-4 py-3.5">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 shrink-0 text-muted-foreground/50 mt-0.5" />
              <div className="text-[10px] text-muted-foreground/70 leading-relaxed">
                <p className="font-semibold text-muted-foreground/90 mb-1">Como funciona?</p>
                <p>
                  Quando um cliente agenda um serviço, os lembretes ativos são programados automaticamente.
                  O cliente recebe uma notificação push no celular com som e vibração no horário configurado.
                </p>
                <p className="mt-1">
                  Para receber, o cliente precisa ativar as notificações no perfil dele.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  if (inline) return body

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary"
        >
          <X className="h-4 w-4 text-foreground" />
        </button>
        <h1
          className="font-serif text-lg font-semibold"
          style={{
            background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Configurações de Lembretes
        </h1>
      </header>
      {body}
    </div>
  )
}
