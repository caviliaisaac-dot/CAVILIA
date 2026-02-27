"use client"

import { useState, useRef } from "react"
import { CalendarDays, Clock, X, Scissors, ChevronRight, Camera, LogOut, Bell } from "lucide-react"
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
  const [pushSubscribing, setPushSubscribing] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Perfil mostra só os agendamentos passados (já filtrados pela API ou pelo parent)
  const myBookings = user ? bookings : []
  const fullList = allBookings ?? bookings

  const upcomingBookings = myBookings.filter((b) => b.status !== "cancelled" && b.date >= new Date())
  const pastBookings = myBookings.filter((b) => b.status !== "cancelled" && b.date < new Date())

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

        {/* Past bookings */}
        {pastBookings.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Historico
              </h2>
            </div>
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
          {["Dados Pessoais", "Notificacoes", "Sobre a CAVILIA"].map((item) => (
            <button
              key={item}
              className="flex w-full items-center justify-between border-b border-border/50 px-1 py-3.5 text-left transition-colors hover:bg-secondary/30"
            >
              <span className="text-sm text-foreground">{item}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
            </button>
          ))}
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
