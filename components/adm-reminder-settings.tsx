"use client"

import { useState, useEffect } from "react"
import { Bell, Plus, Trash2, Check, X } from "lucide-react"

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

const UNIDADE_LABEL: Record<ReminderUnit, string> = {
  day: "dias",
  hour: "horas",
  minute: "minutos",
}

interface AdmReminderSettingsProps {
  onClose: () => void
  inline?: boolean
}

export function AdmReminderSettings({ onClose, inline }: AdmReminderSettingsProps) {
  const [list, setList] = useState<ReminderSettingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [adding, setAdding] = useState(false)
  const [modeComposite, setModeComposite] = useState(false)
  const [newUnidade, setNewUnidade] = useState<ReminderUnit>("hour")
  const [newQuantidade, setNewQuantidade] = useState(1)
  const [newDias, setNewDias] = useState(0)
  const [newHoras, setNewHoras] = useState(0)
  const [newMinutos, setNewMinutos] = useState(15)

  async function fetchList() {
    setLoading(true)
    setError("")
    try {
      const r = await fetch("/api/reminder-settings", { cache: "no-store" })
      if (!r.ok) throw new Error("Erro ao carregar")
      const data = await r.json()
      setList(data)
    } catch (e) {
      setError("Não foi possível carregar as configurações.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  async function addReminder() {
    setError("")
    const isComposite = modeComposite && (newDias > 0 || newHoras > 0 || newMinutos > 0)
    if (!isComposite && (newQuantidade < 1)) return
    try {
      const body = isComposite
        ? { dias: newDias, horas: newHoras, minutos: newMinutos, ativo: true }
        : { unidade: newUnidade, quantidade: newQuantidade, ativo: true }
      const r = await fetch("/api/reminder-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        throw new Error(data.error || "Erro ao criar")
      }
      const created = await r.json()
      setList((prev) => [...prev, created])
      setAdding(false)
      setNewQuantidade(1)
      setNewUnidade("hour")
      setNewDias(0)
      setNewHoras(0)
      setNewMinutos(15)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao adicionar lembrete")
    }
  }

  async function toggleAtivo(item: ReminderSettingItem) {
    try {
      const r = await fetch(`/api/reminder-settings/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !item.ativo }),
      })
      if (!r.ok) throw new Error("Erro ao atualizar")
      const updated = await r.json()
      setList((prev) => prev.map((x) => (x.id === item.id ? updated : x)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao ativar/desativar")
    }
  }

  async function remove(id: string) {
    try {
      const r = await fetch(`/api/reminder-settings/${id}`, { method: "DELETE" })
      if (!r.ok) throw new Error("Erro ao excluir")
      setList((prev) => prev.filter((x) => x.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir")
    }
  }

  const goldStyle = {
    background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    backgroundClip: "text" as const,
  }
  const goldButton = {
    background: "#2a2420",
    border: "2.5px solid #d4a017",
    boxShadow: "0 0 12px 3px rgba(212,160,23,0.4)",
  }

  const inner = (
    <div className={inline ? "flex flex-col gap-4" : "flex-1 overflow-y-auto px-4 py-6"}>
      {inline && (
        <p className="text-xs font-semibold uppercase tracking-wider text-gold">Configurar Lembretes</p>
      )}
        <p className="mb-4 text-xs text-muted-foreground">
          Defina quando o cliente deve ser avisado antes do atendimento. Os lembretes são usados para notificações push (integração Firebase).
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((item) => {
              const dias = item.quantidadeDias ?? 0
              const horas = item.quantidadeHoras ?? 0
              const mins = item.quantidadeMinutos ?? 0
              const isComposite = dias > 0 || horas > 0 || mins > 0
              const label = isComposite
                ? [
                    dias ? `${dias} ${dias === 1 ? "dia" : "dias"}` : "",
                    horas ? `${horas} ${horas === 1 ? "hora" : "horas"}` : "",
                    mins ? `${mins} ${mins === 1 ? "minuto" : "minutos"}` : "",
                  ].filter(Boolean).join(", ") + " antes"
                : `Avisar ${item.quantidade} ${item.quantidade === 1 ? UNIDADE_LABEL[item.unidade].replace(/s$/, "") : UNIDADE_LABEL[item.unidade]} antes`
              return (
              <div
                key={item.id}
                className={`rounded-lg border bg-card px-4 py-3 ${
                  item.ativo ? "border-border" : "border-border/50 opacity-70"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {label}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {isComposite ? "dias, horas e minutos" : item.unidade}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAtivo(item)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        item.ativo
                          ? "border border-gold/50 bg-gold/15 text-gold"
                          : "border border-border bg-secondary text-muted-foreground"
                      }`}
                    >
                      {item.ativo ? "Ativo" : "Inativo"}
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
            })}

            {adding ? (
              <div className="rounded-lg border border-gold/30 bg-card p-4">
                <p className="mb-3 text-xs font-semibold text-gold">Novo lembrete</p>
                <div className="mb-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModeComposite(false)}
                    className={`rounded px-3 py-1.5 text-xs font-medium ${!modeComposite ? "bg-gold/20 text-gold border border-gold/50" : "border border-border bg-secondary text-muted-foreground"}`}
                  >
                    Um tipo
                  </button>
                  <button
                    type="button"
                    onClick={() => setModeComposite(true)}
                    className={`rounded px-3 py-1.5 text-xs font-medium ${modeComposite ? "bg-gold/20 text-gold border border-gold/50" : "border border-border bg-secondary text-muted-foreground"}`}
                  >
                    Dias, horas e minutos
                  </button>
                </div>
                {modeComposite ? (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="mb-1 block text-[10px] uppercase text-muted-foreground">Dias</label>
                        <input
                          type="number"
                          min={0}
                          value={newDias}
                          onChange={(e) => setNewDias(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className="w-full rounded border border-border bg-secondary px-2 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] uppercase text-muted-foreground">Horas</label>
                        <input
                          type="number"
                          min={0}
                          value={newHoras}
                          onChange={(e) => setNewHoras(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className="w-full rounded border border-border bg-secondary px-2 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] uppercase text-muted-foreground">Minutos</label>
                        <input
                          type="number"
                          min={0}
                          value={newMinutos}
                          onChange={(e) => setNewMinutos(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className="w-full rounded border border-border bg-secondary px-2 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Preencha pelo menos um valor (dias, horas ou minutos).</p>
                    <div className="flex gap-2">
                      <button
                        onClick={addReminder}
                        disabled={newDias === 0 && newHoras === 0 && newMinutos === 0}
                        className="flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium text-gold disabled:opacity-50"
                        style={{ border: "1.5px solid #d4a017", background: "rgba(212,160,23,0.1)" }}
                      >
                        <Check className="h-3.5 w-3.5" /> Salvar
                      </button>
                      <button
                        onClick={() => { setAdding(false); setError(""); setModeComposite(false); }}
                        className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] uppercase text-muted-foreground">Tipo</label>
                    <select
                      value={newUnidade}
                      onChange={(e) => setNewUnidade(e.target.value as ReminderUnit)}
                      className="w-full rounded border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                    >
                      <option value="day">Dias</option>
                      <option value="hour">Horas</option>
                      <option value="minute">Minutos</option>
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="mb-1 block text-[10px] uppercase text-muted-foreground">Quantidade</label>
                    <input
                      type="number"
                      min={1}
                      value={newQuantidade}
                      onChange={(e) => setNewQuantidade(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full rounded border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addReminder}
                      className="flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium text-gold"
                      style={{ border: "1.5px solid #d4a017", background: "rgba(212,160,23,0.1)" }}
                    >
                      <Check className="h-3.5 w-3.5" /> Salvar
                    </button>
                    <button
                      onClick={() => { setAdding(false); setError(""); }}
                      className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gold/40 py-4 text-sm font-medium text-gold hover:border-gold hover:bg-gold/5"
              >
                <Plus className="h-4 w-4" /> Adicionar lembrete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (inline) return inner

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
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
        </div>
      </header>
      {inner}
    </div>
  )
}
