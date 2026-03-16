import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Endpoint de teste: insere um booking fictício e retorna o resultado.
 * Acesse: GET /api/test-booking
 * Objetivo: confirmar se o salvamento no Supabase está funcionando.
 */
export async function GET() {
  try {
    const service = await prisma.service.findFirst()
    if (!service) {
      return NextResponse.json({
        ok: false,
        error: "Nenhum serviço encontrado na tabela services. Rode npm run db:seed ou crie um serviço antes.",
      }, { status: 400 })
    }

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())

    const booking = await prisma.booking.create({
      data: {
        clientName: "TESTE SISTEMA",
        phone: "00000000000",
        serviceId: service.id,
        date: dateOnly,
        time: "14:00",
        status: "active",
      },
    })

    const totalBookings = await prisma.booking.count()

    return NextResponse.json({
      ok: true,
      booking_created: true,
      booking_id: booking.id,
      total_bookings: totalBookings,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[test-booking] Erro:", e)
    return NextResponse.json({
      ok: false,
      error: msg,
    }, { status: 500 })
  }
}
