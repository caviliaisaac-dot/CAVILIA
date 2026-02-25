"use client"

import { useState, useEffect } from "react"
import { MessageSquare, X } from "lucide-react"

const DEFAULT_MESSAGE = "Olá {{nome}}, seu {{servico}} é {{data}} às {{hora}}."

interface AdmReminderMessageProps {
  onClose: () => void
}

export function AdmReminderMessage({ onClose }: AdmReminderMessageProps) {
  const [mensagem, setMensagem] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch("/api/reminder-message", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setMensagem(data.mensagem ?? ""))
      .catch(() => setError("Erro ao carregar mensagem."))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setError("")
    setSuccess(false)
    setSaving(true)
    try {
      const r = await fetch("/api/reminder-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: mensagem.trim() || DEFAULT_MESSAGE }),
      })
      if (!r.ok) throw new Error("Erro ao salvar")
      const data = await r.json()
      setMensagem(data.mensagem ?? "")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar mensagem.")
    } finally {
      setSaving(false)
    }
  }

  const goldStyle = {
    background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    backgroundClip: "text" as const,
  }

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
          <h1 className="font-serif text-lg font-semibold" style={goldStyle}>
            Mensagem de Lembrete
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-2 text-xs text-muted-foreground">
          Use as variáveis abaixo na mensagem. Elas serão trocadas pelos dados reais na notificação push.
        </p>
        <div className="mb-4 flex flex-wrap gap-2 rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-[11px] text-muted-foreground">
          <code className="rounded bg-secondary px-1.5 py-0.5">{`{{nome}}`}</code>
          <span>nome do cliente</span>
          <code className="rounded bg-secondary px-1.5 py-0.5">{`{{servico}}`}</code>
          <span>serviço agendado</span>
          <code className="rounded bg-secondary px-1.5 py-0.5">{`{{data}}`}</code>
          <span>data (ex: 25/02)</span>
          <code className="rounded bg-secondary px-1.5 py-0.5">{`{{hora}}`}</code>
          <span>horário</span>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-600 dark:text-green-400">
            Mensagem salva.
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Mensagem
            </label>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder={DEFAULT_MESSAGE}
              rows={5}
              className="mb-4 w-full resize-y rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3.5 font-sans text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background: "#2a2420",
                border: "2.5px solid #d4a017",
                boxShadow: "0 0 12px 3px rgba(212,160,23,0.4)",
              }}
            >
              <MessageSquare className="h-4 w-4" style={{ color: "#d4a017" }} />
              <span style={{
                background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {saving ? "Salvando…" : "Salvar mensagem"}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
