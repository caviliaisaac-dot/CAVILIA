"use client"

import { useState } from "react"
import { HomeScreen } from "@/components/home-screen"
import { ScheduleScreen, type BookingData } from "@/components/schedule-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { SuccessScreen } from "@/components/success-screen"
import { AdmLoginScreen } from "@/components/adm-login-screen"
import { AdmScreen } from "@/components/adm-screen"
import { BottomNav } from "@/components/bottom-nav"

type Screen = "home" | "schedule" | "profile" | "adm"

export default function CaviliaApp() {
  const [activeScreen, setActiveScreen] = useState<Screen>("home")
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [lastBooking, setLastBooking] = useState<BookingData | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [admLoggedIn, setAdmLoggedIn] = useState(false)

  function handleNavigate(screen: Screen) {
    setShowSuccess(false)
    if (screen !== "adm") setAdmLoggedIn(false)
    setActiveScreen(screen)
  }

  function handleConfirmBooking(booking: BookingData) {
    setBookings((prev) => [...prev, booking])
    setLastBooking(booking)
    setShowSuccess(true)
  }

  function handleCancelBooking(index: number) {
    setBookings((prev) => prev.filter((_, i) => i !== index))
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
        {activeScreen === "schedule" && (
          <ScheduleScreen
            onBack={() => setActiveScreen("home")}
            onConfirm={handleConfirmBooking}
          />
        )}
        {activeScreen === "profile" && (
          <ProfileScreen
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
          />
        )}
        {activeScreen === "adm" && !admLoggedIn && (
          <AdmLoginScreen onLogin={() => setAdmLoggedIn(true)} />
        )}
        {activeScreen === "adm" && admLoggedIn && (
          <AdmScreen
            bookings={bookings}
            onUpdateBooking={handleUpdateBooking}
            onCancelBooking={handleCancelBooking}
            onLogout={() => { setAdmLoggedIn(false); setActiveScreen("home") }}
          />
        )}
        <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} />
      </div>
    </main>
  )
}
