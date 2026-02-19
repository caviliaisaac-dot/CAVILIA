"use client"

import { useState } from "react"
import { HomeScreen } from "@/components/home-screen"
import { ScheduleScreen, type BookingData } from "@/components/schedule-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { SuccessScreen } from "@/components/success-screen"
import { BottomNav } from "@/components/bottom-nav"

type Screen = "home" | "schedule" | "profile"

export default function CaviliaApp() {
  const [activeScreen, setActiveScreen] = useState<Screen>("home")
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [lastBooking, setLastBooking] = useState<BookingData | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  function handleNavigate(screen: Screen) {
    setShowSuccess(false)
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
      <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} />
    </main>
  )
}
