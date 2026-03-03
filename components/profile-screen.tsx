"use client"

import { useState, useRef, useEffect } from "react"
import { CalendarDays, Clock, X, Scissors, ChevronRight, ChevronDown, ChevronUp, Camera, LogOut, Bell, User, Lock, Mail, Eye, EyeOff, Info, Check } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { BookingData } from "./schedule-screen"
import type { UserData } from "./auth-screen"
import { getLevelConfig, visitasParaProximoNivel, progressoNivel } from "@/lib/client-level"
import { subscribeToPushNotifications } from "@/lib/push-client"

interface ProfileScreenProps {
  bookings: BookingData[]
  allBookings?: BookingData[]
  user: UserData | null
  onCancelBooking: (index: number) => void
  onUpdateUser: (user: UserData) => void
  onLogout: () => void
}

function normalizePhone(phone: string) {
  if (!phone || typeof phone !== "string") return ""
  const digits = phone.replace(/\D/g, "")
  // Remove código do país 55 (Brasil) se estiver no início
  if (digits.length >= 12 && digits.startsWith("55")) {
    return digits.slice(2)
  }
  return digits
}

function isSamePhone(a: string, b: string) {
  const na = normalizePhone(a)
  const nb = normalizePhone(b)
  if (!na || !nb) return false
  return na === nb
}

export function ProfileScreen({ bookings, allBookings, user, onCancelBooking, onUpdateUser, onLogout }: ProfileScreenProps) {
  const [showCancelDialog, setShowCancelDialog] = useState<number | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [pushSubscribing, setPushSubscribing] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)

  // Configurações panels
  type ConfigPanel = null | "dados" | "notificacoes" | "sobre"
  const [configPanel, setConfigPanel] = useState<ConfigPanel>(null)

  // Dados Pessoais
  const [editName, setEditName] = useState(user?.name || "")
  const [editEmail, setEditEmail] = useState(user?.email || "")
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmNovaSenha, setConfirmNovaSenha] = useState("")
  const [showSenhaAtual, setShowSenhaAtual] = useState(false)
  const [showNovaSenha, setShowNovaSenha] = useState(false)
  const [dadosError, setDadosError] = useState("")
  const [dadosSuccess, setDadosSuccess] = useState("")

  // Sobre a CAVILIA
  const [sobreText, setSobreText] = useState("")
  const [sobreLoading, setSobreLoading] = useState(false)

  useEffect(() => {
    if (configPanel === "sobre") {
      setSobreLoading(true)
      fetch("/api/app-settings?key=sobre")
        .then((r) => r.json())
        .then((d) => setSobreText(d.value || ""))
        .catch(() => setSobreText(""))
        .finally(() => setSobreLoading(false))
    }
    if (configPanel === "dados" && user) {
      setEditName(user.name || "")
      setEditEmail(user.email || "")
      setSenhaAtual("")
      setNovaSenha("")
      setConfirmNovaSenha("")
      setDadosError("")
      setDadosSuccess("")
    }
  }, [configPanel, user])

  async function handleSaveDados() {
    setDadosError("")
    setDadosSuccess("")
    if (!user) return
    try {
      const res = await fetch("/api/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: user.phone, name: editName.trim(), email: editEmail.trim() }),
      })
      if (res.ok) {
        const updated = { ...user, name: editName.trim(), email: editEmail.trim() }
        localStorage.setItem("cavilia-current-user", JSON.stringify(updated))
        onUpdateUser(updated)
        setDadosSuccess("Dados atualizados!")
      } else {
        setDadosError("Erro ao salvar dados")
      }
    } catch {
      setDadosError("Erro de conexão")
    }
  }

  async function handleChangePassword() {
    setDadosError("")
    setDadosSuccess("")
    if (!user) return
    if (!senhaAtual || !novaSenha) return setDadosError("Preencha todos os campos de senha")
    if (novaSenha.length < 4) return setDadosError("Nova senha deve ter pelo menos 4 caracteres")
    if (novaSenha !== confirmNovaSenha) return setDadosError("As senhas não conferem")
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: user.phone, senhaAtual, novaSenha }),
      })
      const data = await res.json()
      if (res.ok) {
        setDadosSuccess("Senha alterada com sucesso!")
        setSenhaAtual("")
        setNovaSenha("")
        setConfirmNovaSenha("")
        const updated = { ...user, password: novaSenha }
        localStorage.setItem("cavilia-current-user", JSON.stringify(updated))
        onUpdateUser(updated)
      } else {
        setDadosError(data.error || "Erro ao alterar senha")
      }
    } catch {
      setDadosError("Erro de conexão")
    }
  }
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Perfil mostra só os agendamentos passados (já filtrados pela API ou pelo parent)
  const myBookings = user ? bookings : []
  const fullList = allBookings ?? bookings

  function getBookingDateTime(b: BookingData) {
    const dateKey =
      b.date instanceof Date
        ? b.date.toISOString().slice(0, 10)
        : String(b.date).slice(0, 10)
    const [y, m, d] = dateKey.split("-").map(Number)
    const [hh, mm] = String(b.time || "00:00").split(":").map(Number)
    return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0)
  }

  const now = new Date()
  const upcomingBookings = myBookings.filter(
    (b) => b.status !== "cancelled" && getBookingDateTime(b) >= now
  )
  const pastBookings = myBookings.filter(
    (b) => b.status !== "cancelled" && getBookingDateTime(b) < now
  )

  function handleCancel(index: number) {
    onCancelBooking(index)
    setShowCancelDialog(null)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const updated = { ...user, photoUrl: ev.target?.result as string }
      // Atualiza no localStorage
      const raw = localStorage.getItem("cavilia-users")
      const users: UserData[] = raw ? JSON.parse(raw) : []
      const idx = users.findIndex((u) => u.phone === user.phone)
      if (idx >= 0) users[idx] = updated
      localStorage.setItem("cavilia-users", JSON.stringify(users))
      localStorage.setItem("cavilia-current-user", JSON.stringify(updated))
      onUpdateUser(updated)
    }
    reader.readAsDataURL(file)
  }

  const totalVisitas = user?.totalVisitas ?? 0
  const levelCfg = getLevelConfig(totalVisitas)
  const faltam = visitasParaProximoNivel(totalVisitas)
  const progresso = progressoNivel(totalVisitas)
  const joinYear = user?.dataCadastro
    ? new Date(user.dataCadastro).getFullYear()
    : new Date().getFullYear()

  return (
    <div className="flex min-h-screen flex-col pb-24">
      {/* Header */}
      <header className="border-b border-border px-4 pb-6 pt-10 flex flex-col items-center text-center">
        {/* Foto de perfil com botão de trocar */}
        <div className="relative mb-3">
          <div className="flex-shrink-0" style={{ width: 86, height: 86, padding: 3, borderRadius: '9999px', background: 'conic-gradient(from 0deg, #f5cc6a 0%, #e8b84b 18%, #c49a2e 35%, #fff3b0 50%, #c49a2e 65%, #e8b84b 82%, #f5cc6a 100%)', boxShadow: '0 0 18px 4px rgba(232,184,75,0.45)' }}>
            <div className="flex h-full w-full items-center justify-center rounded-full bg-black overflow-hidden">
              {user?.photoUrl
                ? <img src={user.photoUrl} alt="Foto perfil" className="h-full w-full object-cover" />
                : user
                  ? <span className="font-serif text-2xl font-bold text-gold">{user.name.charAt(0).toUpperCase()}</span>
                  : <img src="/logo-cavilia.png" alt="Cavilia Logo" className="h-full w-full object-contain" />
              }
            </div>
          </div>
          {user && (
            <button
              onClick={() => photoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gold shadow-md hover:brightness-110"
            >
              <Camera className="h-3.5 w-3.5 text-black" />
            </button>
          )}
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <h1 className="font-serif text-xl font-bold text-foreground">
          {user ? user.name : "Meu Perfil"}
        </h1>
        {user?.phone && (
          <p className="mt-0.5 text-xs text-muted-foreground">{user.phone}</p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          Cliente desde {joinYear}
        </p>

        {/* Badge de nível */}
        <div
          className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            border: `1.5px solid ${levelCfg.borderColor}`,
            background: levelCfg.bgColor,
            boxShadow: levelCfg.label === "VIP" ? `0 0 14px 3px ${levelCfg.glowColor}` : undefined,
          }}
        >
          <span className="text-sm">{levelCfg.emoji}</span>
          <span
            className="text-[11px] font-bold tracking-wider uppercase"
            style={{ color: levelCfg.color }}
          >
            {levelCfg.label}
          </span>
          <span className="text-[10px] text-muted-foreground">
            • {totalVisitas} {totalVisitas === 1 ? "visita" : "visitas"}
          </span>
        </div>

        {/* Barra de progresso para próximo nível */}
        {faltam !== null && (
          <div className="mt-3 w-full max-w-[200px]">
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progresso}%`, background: levelCfg.color }}
              />
            </div>
            <p className="mt-1 text-center text-[10px] text-muted-foreground/60">
              Faltam {faltam} visita{faltam !== 1 ? "s" : ""} para {
                totalVisitas < 5 ? "Prata ⚪" :
                totalVisitas < 10 ? "Ouro 🟡" : "VIP 💎"
              }
            </p>
          </div>
        )}
        {faltam === null && (
          <p className="mt-1 text-[10px] text-gold/70">✨ Nível máximo alcançado!</p>
        )}

        {user && (
          <button
            onClick={onLogout}
            className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair da conta
          </button>
        )}
        {user && (
          <button
            onClick={async () => {
              setPushSubscribing(true)
              const ok = await subscribeToPushNotifications(user.phone)
              setPushEnabled(ok)
              setPushSubscribing(false)
            }}
            disabled={pushSubscribing || pushEnabled || (typeof Notification !== "undefined" && Notification.permission === "granted")}
            className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-gold transition-colors disabled:opacity-50"
          >
            <Bell className="h-3.5 w-3.5" />
            {pushSubscribing ? "Ativando…" : pushEnabled || (typeof Notification !== "undefined" && Notification.permission === "granted") ? "Notificações ativas" : "Receber lembretes no celular"}
          </button>
        )}
      </header>

      {/* Stats — só do cliente logado */}
      <div className="grid grid-cols-3 border-b border-border">
        <div className="flex flex-col items-center border-r border-border py-4">
          <span className="font-serif text-2xl font-bold text-gold">
            {myBookings.length}
          </span>
          <span className="text-[10px] text-muted-foreground">Total</span>
        </div>
        <div className="flex flex-col items-center border-r border-border py-4">
          <span className="font-serif text-2xl font-bold text-gold">
            {upcomingBookings.length}
          </span>
          <span className="text-[10px] text-muted-foreground">Proximos</span>
        </div>
        <div className="flex flex-col items-center py-4">
          <span className="font-serif text-2xl font-bold text-gold">
            {pastBookings.length}
          </span>
          <span className="text-[10px] text-muted-foreground">Realizados</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-6">
        {/* Upcoming */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gold" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Proximos Agendamentos
            </h2>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card px-6 py-8 text-center">
              <Scissors className="mx-auto mb-2 h-6 w-6 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {user ? "Nenhum agendamento futuro" : "Faça login para ver seus agendamentos"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {user ? "Agende pelo menu Agendar" : "Use o menu Agendar para entrar na sua conta"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingBookings.map((booking, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                    <Scissors className="h-4 w-4 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-sm font-semibold text-foreground">
                      {booking.service}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {format(booking.date, "dd/MM", { locale: ptBR })}
                      </span>
                      <span className="text-muted-foreground/30">|</span>
                      <span className="text-xs text-muted-foreground">
                        {booking.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gold">
                      {booking.price}
                    </span>
                    <button
                      onClick={() => {
                        const fullIndex = fullList.findIndex((b) => b.id === booking.id)
                        if (fullIndex >= 0) setShowCancelDialog(fullIndex)
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-border transition-colors hover:border-destructive-foreground/30 hover:bg-destructive/20"
                      aria-label="Cancelar agendamento"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past bookings — colapsável */}
        {pastBookings.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="mb-3 flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/30"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Historico ({pastBookings.length})
                </h2>
              </div>
              {showHistory
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />
              }
            </button>
            {showHistory && (
              <div className="flex flex-col gap-2">
                {pastBookings.map((booking, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4 opacity-60"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
                      <Scissors className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{booking.service}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(booking.date, "dd/MM/yyyy", { locale: ptBR })} - {booking.time}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {booking.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Menu options */}
        <div className="mt-8 mb-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/50">
              Configuracoes
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Dados Pessoais */}
          <button
            onClick={() => setConfigPanel(configPanel === "dados" ? null : "dados")}
            className="flex w-full items-center justify-between border-b border-border/50 px-1 py-3.5 text-left transition-colors hover:bg-secondary/30"
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gold" />
              <span className="text-sm text-foreground">Dados Pessoais</span>
            </div>
            {configPanel === "dados" ? <ChevronUp className="h-4 w-4 text-muted-foreground/40" /> : <ChevronRight className="h-4 w-4 text-muted-foreground/40" />}
          </button>
          {configPanel === "dados" && user && (
            <div className="border-b border-border/50 bg-card/50 px-4 py-4 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Nome</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Telefone</label>
                <input value={user.phone} disabled
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Email</label>
                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none" />
              </div>
              <button onClick={handleSaveDados} className="flex items-center justify-center gap-2 rounded-lg border border-gold/40 bg-gold/20 py-2.5 text-xs font-medium text-gold hover:bg-gold/30">
                <Check className="h-3.5 w-3.5" /> Salvar Dados
              </button>

              <div className="mt-2 border-t border-border/50 pt-3">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Trocar Senha</p>
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <input type={showSenhaAtual ? "text" : "password"} value={senhaAtual} onChange={(e) => { setSenhaAtual(e.target.value); setDadosError("") }}
                      placeholder="Senha atual"
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 pr-10 text-sm text-foreground focus:border-gold focus:outline-none" />
                    <button onClick={() => setShowSenhaAtual(!showSenhaAtual)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                      {showSenhaAtual ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showNovaSenha ? "text" : "password"} value={novaSenha} onChange={(e) => { setNovaSenha(e.target.value); setDadosError("") }}
                      placeholder="Nova senha (min. 4 caracteres)"
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 pr-10 text-sm text-foreground focus:border-gold focus:outline-none" />
                    <button onClick={() => setShowNovaSenha(!showNovaSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                      {showNovaSenha ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <input type="password" value={confirmNovaSenha} onChange={(e) => { setConfirmNovaSenha(e.target.value); setDadosError("") }}
                    placeholder="Confirmar nova senha"
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none" />
                  <button onClick={handleChangePassword} className="flex items-center justify-center gap-2 rounded-lg border border-gold/40 bg-gold/20 py-2.5 text-xs font-medium text-gold hover:bg-gold/30">
                    <Lock className="h-3.5 w-3.5" /> Alterar Senha
                  </button>
                </div>
              </div>

              {dadosError && <p className="text-center text-xs text-red-400">{dadosError}</p>}
              {dadosSuccess && <p className="text-center text-xs text-green-400">{dadosSuccess}</p>}
            </div>
          )}

          {/* Notificações */}
          <button
            onClick={() => setConfigPanel(configPanel === "notificacoes" ? null : "notificacoes")}
            className="flex w-full items-center justify-between border-b border-border/50 px-1 py-3.5 text-left transition-colors hover:bg-secondary/30"
          >
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gold" />
              <span className="text-sm text-foreground">Notificacoes</span>
            </div>
            {configPanel === "notificacoes" ? <ChevronUp className="h-4 w-4 text-muted-foreground/40" /> : <ChevronRight className="h-4 w-4 text-muted-foreground/40" />}
          </button>
          {configPanel === "notificacoes" && (
            <div className="border-b border-border/50 bg-card/50 px-4 py-4 flex flex-col gap-3">
              {upcomingBookings.length > 0 ? (
                <div className="rounded-lg border border-gold/20 bg-gold/5 px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Proximo atendimento</p>
                  <p className="text-sm font-semibold text-foreground">{upcomingBookings[0].service}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(upcomingBookings[0].date), "dd/MM/yyyy", { locale: ptBR })} as {upcomingBookings[0].time}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Nenhum agendamento proximo.</p>
              )}
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3">
                <div>
                  <p className="text-sm text-foreground">Notificacoes push</p>
                  <p className="text-[10px] text-muted-foreground">
                    {typeof Notification !== "undefined" && Notification.permission === "granted"
                      ? "Ativas — voce recebera lembretes"
                      : "Desativadas"}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (!user) return
                    setPushSubscribing(true)
                    const ok = await subscribeToPushNotifications(user.phone)
                    setPushEnabled(ok)
                    setPushSubscribing(false)
                    if (ok) toast.success("Notificacoes ativadas!")
                    else toast.error("Nao foi possivel ativar")
                  }}
                  disabled={pushSubscribing || pushEnabled || (typeof Notification !== "undefined" && Notification.permission === "granted")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    (typeof Notification !== "undefined" && Notification.permission === "granted") || pushEnabled
                      ? "border border-green-500/50 bg-green-900/20 text-green-400"
                      : "border border-gold/40 bg-gold/20 text-gold hover:bg-gold/30"
                  }`}
                >
                  {pushSubscribing ? "Ativando..." : (typeof Notification !== "undefined" && Notification.permission === "granted") || pushEnabled ? "Ativas" : "Ativar"}
                </button>
              </div>
            </div>
          )}

          {/* Sobre a CAVILIA */}
          <button
            onClick={() => setConfigPanel(configPanel === "sobre" ? null : "sobre")}
            className="flex w-full items-center justify-between border-b border-border/50 px-1 py-3.5 text-left transition-colors hover:bg-secondary/30"
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gold" />
              <span className="text-sm text-foreground">Sobre a CAVILIA</span>
            </div>
            {configPanel === "sobre" ? <ChevronUp className="h-4 w-4 text-muted-foreground/40" /> : <ChevronRight className="h-4 w-4 text-muted-foreground/40" />}
          </button>
          {configPanel === "sobre" && (
            <div className="border-b border-border/50 bg-card/50 px-4 py-4">
              {sobreLoading ? (
                <p className="text-xs text-muted-foreground">Carregando...</p>
              ) : sobreText ? (
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{sobreText}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Nenhuma informacao cadastrada.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-6 w-full max-w-sm rounded-lg border border-border bg-card p-6">
            <h3 className="font-serif text-lg font-bold text-foreground">
              Cancelar Agendamento?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tem certeza que deseja cancelar este agendamento? Esta acao nao pode ser desfeita.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowCancelDialog(null)}
                className="flex-1 rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-leather"
              >
                Manter
              </button>
              <button
                onClick={() => handleCancel(showCancelDialog)}
                className="flex-1 rounded-lg bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/80"
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
