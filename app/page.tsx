"use client"

import { useState, useEffect } from "react"
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
  const [showAuth, setShowAuth] = useState(false)

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
    }).catch(() => {})
  }, [])

  function handleNavigate(screen: Screen) {
    setShowSuccess(false)
    if (screen !== "adm") setAdmLoggedIn(false)
    setActiveScreen(screen)
    // Ao clicar em Agendar, verifica se tem usuário logado
    if (screen === "schedule" && !currentUser) {
      setShowAuth(true)
    } else {
      setShowAuth(false)
    }
  }

  async function handleConfirmBooking(booking: BookingData) {
    const payload = {
      serviceName: booking.service,
      clientName: booking.clientName,
      phone: booking.phone,
      date: booking.date instanceof Date ? booking.date.toISOString().slice(0, 10) : booking.date,
      time: booking.time,
    }
    const created = await apiPost<BookingData & { id: string; date: string }>("/api/bookings", payload)
    if (created) {
      const withId: BookingData = { ...booking, id: created.id, date: new Date(created.date) }
      setBookings((prev) => [...prev, withId])
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
      setBookings((prev) => [...prev, booking])
      setLastBooking(booking)
      setShowSuccess(true)
      if (currentUser) {
        const novasVisitas = (currentUser.totalVisitas ?? 0) + 1
        const updated = { ...currentUser, totalVisitas: novasVisitas }
        setCurrentUser(updated)
        localStorage.setItem("cavilia-current-user", JSON.stringify(updated))
        const raw = localStorage.getItem("cavilia-users")
        const users = raw ? JSON.parse(raw) : []
        const idx = users.findIndex((u: UserData) => u.phone === currentUser.phone)
        if (idx >= 0) users[idx] = updated
        localStorage.setItem("cavilia-users", JSON.stringify(users))
      }
    }
  }

  async function handleCancelBooking(index: number) {
    const b = bookings[index]
    if (b?.id) {
      const ok = await apiPatch<BookingData>(`/api/bookings/${b.id}`, { status: "cancelled" })
      if (ok) setBookings((prev) => prev.map((bk, i) => (i === index ? { ...bk, status: "cancelled" as const } : bk)))
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
    <main className="relative mx-auto min-h-screen max-w-md">
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
          />
        )}
        {activeScreen === "profile" && (
          <ProfileScreen
            bookings={bookings}
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
            onLogout={() => { setAdmLoggedIn(false); setActiveScreen("home") }}
          />
        )}
        <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} />
      </div>
    </main>
  )
}
