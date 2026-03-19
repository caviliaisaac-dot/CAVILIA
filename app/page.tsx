"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { HomeScreen } from "@/components/home-screen"
import { ScheduleScreen, type BookingData, type ServiceItem, DEFAULT_SERVICES } from "@/components/schedule-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { SuccessScreen } from "@/components/success-screen"
import { AdmLoginScreen } from "@/components/adm-login-screen"
import { AdmScreen } from "@/components/adm-screen"
import { AuthScreen, type UserData } from "@/components/auth-screen"
import { BottomNav } from "@/components/bottom-nav"
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api"

type Screen = "home" | "schedule" | "profile" | "adm"

export default function CaviliaApp() {
  const [activeScreen, setActiveScreen] = useState<Screen>("home")
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [lastBooking, setLastBooking] = useState<BookingData | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [admLoggedIn, setAdmLoggedIn] = useState(false)
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES)
  const [scheduleBlocks, setScheduleBlocks] = useState<{ dayoffs: string[]; timeBlocks: { date: string; time: string; label: string }[] }>({ dayoffs: [], timeBlocks: [] })
  const [currentUser, setCurrentUser] = useState<UserData | null>(() => {
    if (typeof window === "undefined") return null
    try {
      const saved = localStorage.getItem("cavilia-current-user")
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [profileBookings, setProfileBookings] = useState<BookingData[]>([])
  const [showAuth, setShowAuth] = useState(false)
  const [bookingSaving, setBookingSaving] = useState(false)

  // ----- Notificações push (Web Push) -----
  const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  useEffect(() => {
    Promise.all([
      apiGet<Array<{ id: string; service: string; price: string; date: string; time: string; clientName: string; phone: string; status: string }>>("/api/bookings"),
      apiGet<ServiceItem[]>("/api/services"),
      apiGet<{ dayoffs: string[]; timeBlocks: { date: string; time: string; label: string }[] }>("/api/schedule"),
    ]).then(([b, s, sch]) => {
      try {
        if (b) setBookings(b.map((x) => ({ id: x.id, service: x.service, price: x.price, date: new Date(x.date), time: x.time, clientName: x.clientName, phone: x.phone, status: x.status as "active" | "cancelled" | "rescheduled" })))
        if (s && s.length > 0) setServices(s)
        if (sch) setScheduleBlocks({ dayoffs: sch.dayoffs || [], timeBlocks: sch.timeBlocks || [] })
      } catch (_) {
        // ignora erro de hidratação ou dados inesperados
      }
    }).catch(() => {
      toast.error("Erro ao carregar dados. Verifique se o Supabase está configurado (npx prisma migrate dev)")
    })
  }, [])

  // Registra o dispositivo do cliente para receber notificações push,
  // usando o telefone do usuário logado.
  useEffect(() => {
    if (!currentUser?.phone) return
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return
    if (!publicVapidKey) return

    const alreadyForPhoneKey = `cavilia-push-registered-${currentUser.phone.replace(/\D/g, "")}`
    if (localStorage.getItem(alreadyForPhoneKey) === "1") return

    const register = async () => {
      try {
        const permission = await Notification.requestPermission()
        if (permission !== "granted") return

        const reg = await navigator.serviceWorker.ready

        const convertedKey = urlBase64ToUint8Array(publicVapidKey)
        const existing = await reg.pushManager.getSubscription()
        const sub =
          existing ||
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
          }))

        await fetch("/api/push-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: currentUser.phone,
            subscription: sub.toJSON(),
          }),
        })

        localStorage.setItem(alreadyForPhoneKey, "1")
      } catch {
        // falha silenciosa; o app continua funcionando sem push
      }
    }

    register()
  }, [currentUser?.phone, publicVapidKey])

  const refetchBookings = useCallback(() => {
    apiGet<Array<{ id: string; service: string; price: string; date: string; time: string; clientName: string; phone: string; status: string }>>("/api/bookings")
      .then((b) => {
        if (b) setBookings(b.map((x) => ({ id: x.id, service: x.service, price: x.price, date: new Date(x.date), time: x.time, clientName: x.clientName, phone: x.phone, status: x.status as "active" | "cancelled" | "rescheduled" })))
      })
      .catch(() => {})
  }, [])

  // Atualização automática no ADM para o barbeiro acompanhar novos agendamentos
  // sem precisar recarregar manualmente a página.
  useEffect(() => {
    if (activeScreen !== "adm" || !admLoggedIn) return

    const refreshNow = () => refetchBookings()
    const intervalId = window.setInterval(refreshNow, 5000)

    const onFocus = () => refreshNow()
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshNow()
    }

    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibilityChange)
    refreshNow()

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [activeScreen, admLoggedIn, refetchBookings])

  // Agendamentos só do usuário logado (para o perfil)
  useEffect(() => {
    if (!currentUser?.phone) {
      setProfileBookings([])
      return
    }
    const phone = encodeURIComponent(currentUser.phone)
    apiGet<Array<{ id: string; service: string; price: string; date: string; time: string; clientName: string; phone: string; status: string }>>(`/api/bookings?phone=${phone}`)
      .then((b) => {
        if (b) setProfileBookings(b.map((x) => ({ id: x.id, service: x.service, price: x.price, date: new Date(x.date), time: x.time, clientName: x.clientName, phone: x.phone, status: x.status as "active" | "cancelled" | "rescheduled" })))
        else setProfileBookings([])
      })
      .catch(() => setProfileBookings([]))
  }, [currentUser?.phone])

  function handleNavigate(screen: Screen) {
    setShowSuccess(false)
    if (screen !== "adm") setAdmLoggedIn(false)
    setActiveScreen(screen)

    if (screen === "schedule" || screen === "adm") {
      refetchBookings()
    }

    if (screen === "schedule") {
      if (!currentUser) setShowAuth(true)
    } else {
      setShowAuth(false)
    }
  }

  async function handleConfirmBooking(booking: BookingData) {
    if (bookingSaving) return
    setBookingSaving(true)
    const payload = {
      serviceName: booking.service,
      price: booking.price,
      clientName: booking.clientName,
      phone: booking.phone,
      date: booking.date instanceof Date ? booking.date.toISOString().slice(0, 10) : booking.date,
      time: booking.time,
    }
    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await r.json().catch(() => ({}))
      if (r.ok) {
        const created = data as BookingData & { id: string; date: string }
        const withId: BookingData = { ...booking, id: created.id, date: new Date(created.date) }
        setBookings((prev) => [...prev, withId])
        if (currentUser && (booking.phone === currentUser.phone || booking.phone.replace(/\D/g, "") === currentUser.phone.replace(/\D/g, ""))) {
          setProfileBookings((prev) => [...prev, withId])
        }
        setLastBooking(withId)
        setShowSuccess(true)
        if (currentUser) {
          const novasVisitas = (currentUser.totalVisitas ?? 0) + 1
          const updated = { ...currentUser, totalVisitas: novasVisitas }
          setCurrentUser(updated)
          localStorage.setItem("cavilia-current-user", JSON.stringify(updated))
          await apiPost("/api/users/update", { phone: currentUser.phone, totalVisitas: novasVisitas })
        }
      } else {
        let msg = data.error || "Não foi possível salvar o agendamento."
        let desc = data.detalhe || data.dica
        if (r.status === 409) {
          msg = "Horário já reservado."
          desc = "Já existe um agendamento nesse horário (talvez você tenha tocado em Confirmar duas vezes). Seu agendamento anterior continua válido."
        } else if (r.status === 500 && !desc) {
          desc = "Verifique as variáveis DATABASE_URL e DIRECT_URL na Vercel (Settings → Environment Variables)."
        }
        toast.error(msg, { description: desc })
      }
    } catch {
      toast.error("Erro de rede ao salvar.", {
        description: "Verifique se DATABASE_URL e DIRECT_URL estão na Vercel. Acesse /api/db-check para diagnosticar.",
      })
    } finally {
      setBookingSaving(false)
    }
  }

  async function handleCancelBooking(index: number) {
    const b = bookings[index]
    if (b?.id) {
      const ok = await apiPatch<BookingData>(`/api/bookings/${b.id}`, { status: "cancelled" })
      if (ok) {
        setBookings((prev) => prev.map((bk, i) => (i === index ? { ...bk, status: "cancelled" as const } : bk)))
        setProfileBookings((prev) => prev.map((bk) => (bk.id === b.id ? { ...bk, status: "cancelled" as const } : bk)))
      }
      return
    }
    setBookings((prev) => prev.map((bk, i) => (i === index ? { ...bk, status: "cancelled" as const } : bk)))
  }

  async function handleDeleteBooking(index: number) {
    const b = bookings[index]
    if (b?.id) {
      const ok = await apiDelete(`/api/bookings/${b.id}`)
      if (ok) setBookings((prev) => prev.filter((_, i) => i !== index))
    } else {
      setBookings((prev) => prev.filter((_, i) => i !== index))
    }
  }

  async function handleUpdateBooking(index: number, updated: BookingData) {
    const b = bookings[index]
    if (b?.id) {
      const payload: { status?: string; date?: string; time?: string } = {}
      if (updated.status) payload.status = updated.status
      if (updated.date) payload.date = updated.date instanceof Date ? updated.date.toISOString().slice(0, 10) : String(updated.date)
      if (updated.time) payload.time = updated.time
      const res = await apiPatch<BookingData & { date: string }>(`/api/bookings/${b.id}`, payload)
      if (res) setBookings((prev) => prev.map((bk, i) => (i === index ? { ...updated, id: b.id, date: new Date(res.date) } : bk)))
      return
    }
    setBookings((prev) => prev.map((bk, i) => (i === index ? updated : bk)))
  }

  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  if (showSuccess && lastBooking) {
    return (
      <SuccessScreen
        booking={lastBooking}
        onGoHome={() => handleNavigate("home")}
        onViewBookings={() => handleNavigate("profile")}
      />
    )
  }

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-md lg:max-w-none">
      {/* Fundo couro real */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/leather-real.png')" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/55" aria-hidden="true" />
      <div className="relative z-10">
        {activeScreen === "home" && (
          <HomeScreen onNavigate={handleNavigate} />
        )}
        {activeScreen === "schedule" && showAuth && (
          <AuthScreen
            onAuth={(user) => { setCurrentUser(user); setShowAuth(false) }}
            onBack={() => { setShowAuth(false); setActiveScreen("home") }}
          />
        )}
        {activeScreen === "schedule" && !showAuth && (
          <ScheduleScreen
            onBack={() => setActiveScreen("home")}
            onConfirm={handleConfirmBooking}
            services={services}
            scheduleBlocks={scheduleBlocks}
            user={currentUser}
            bookings={bookings}
            onRefetchBookings={refetchBookings}
            confirmDisabled={bookingSaving}
          />
        )}
        {activeScreen === "profile" && (
          <ProfileScreen
            bookings={profileBookings}
            allBookings={bookings}
            user={currentUser}
            onCancelBooking={handleCancelBooking}
            onUpdateUser={async (u) => {
              setCurrentUser(u)
              await apiPost("/api/users/update", { phone: u.phone, totalVisitas: u.totalVisitas, photoUrl: u.photoUrl, name: u.name, email: u.email })
            }}
            onLogout={() => {
              localStorage.removeItem("cavilia-current-user")
              setCurrentUser(null)
              setActiveScreen("home")
            }}
          />
        )}
        {activeScreen === "adm" && !admLoggedIn && (
          <AdmLoginScreen onLogin={() => setAdmLoggedIn(true)} />
        )}
        {activeScreen === "adm" && admLoggedIn && (
          <AdmScreen
            bookings={bookings}
            services={services}
            scheduleBlocks={scheduleBlocks}
            onUpdateBooking={handleUpdateBooking}
            onCancelBooking={handleCancelBooking}
            onDeleteBooking={handleDeleteBooking}
            onUpdateServices={async (newServices) => {
              const res = await apiPut<ServiceItem[]>("/api/services", newServices)
              if (res) setServices(res)
              else setServices(newServices)
            }}
            onUpdateScheduleBlocks={async (blocks) => {
              const res = await apiPut<{ dayoffs: string[]; timeBlocks: { date: string; time: string; label: string }[] }>("/api/schedule", blocks)
              if (res) setScheduleBlocks(res)
              else setScheduleBlocks(blocks)
            }}
            onRefreshBookings={refetchBookings}
            onExitAdm={() => {
              // Apenas sair do painel ADM e voltar para a Home
              setAdmLoggedIn(false)
              setActiveScreen("home")
            }}
            onLogoutApp={() => {
              // Sair do aplicativo: deslogar ADM e também o cliente
              try {
                localStorage.removeItem("cavilia-current-user")
              } catch {
                // ignore
              }
              setAdmLoggedIn(false)
              setCurrentUser(null)
              setProfileBookings([])
              setShowAuth(false)
              setActiveScreen("home")
            }}
          />
        )}
        <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} />
      </div>
    </main>
  )
}
