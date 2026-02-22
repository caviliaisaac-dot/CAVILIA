"use client"

import { useState } from "react"
import { HomeScreen } from "@/components/home-screen"
import { ScheduleScreen, type BookingData, type ServiceItem, DEFAULT_SERVICES } from "@/components/schedule-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { SuccessScreen } from "@/components/success-screen"
import { AdmLoginScreen } from "@/components/adm-login-screen"
import { AdmScreen } from "@/components/adm-screen"
import { AuthScreen, type UserData } from "@/components/auth-screen"
import { BottomNav } from "@/components/bottom-nav"

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
    const saved = localStorage.getItem("cavilia-current-user")
    return saved ? JSON.parse(saved) : null
  })
  const [showAuth, setShowAuth] = useState(false)

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

  function handleConfirmBooking(booking: BookingData) {
    setBookings((prev) => [...prev, booking])
    setLastBooking(booking)
    setShowSuccess(true)
    // Incrementa visitas e recalcula nível
    if (currentUser) {
      const novasVisitas = (currentUser.totalVisitas ?? 0) + 1
      const updated = { ...currentUser, totalVisitas: novasVisitas }
      setCurrentUser(updated)
      // Persiste no localStorage
      const raw = localStorage.getItem("cavilia-users")
      const users = raw ? JSON.parse(raw) : []
      const idx = users.findIndex((u: typeof updated) => u.phone === currentUser.phone)
      if (idx >= 0) users[idx] = updated
      localStorage.setItem("cavilia-users", JSON.stringify(users))
      localStorage.setItem("cavilia-current-user", JSON.stringify(updated))
    }
  }

  function handleCancelBooking(index: number) {
    setBookings((prev) => prev.map((b, i) => i === index ? { ...b, status: "cancelled" as const } : b))
  }

  function handleUpdateBooking(index: number, updated: BookingData) {
    setBookings((prev) => prev.map((b, i) => (i === index ? updated : b)))
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
            onUpdateUser={(u) => setCurrentUser(u)}
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
            onUpdateServices={setServices}
            onUpdateScheduleBlocks={setScheduleBlocks}
            onLogout={() => { setAdmLoggedIn(false); setActiveScreen("home") }}
          />
        )}
        <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} />
      </div>
    </main>
  )
}
