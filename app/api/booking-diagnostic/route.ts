import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

function getDatabaseHost(): string {
  try {
    const u = process.env.DATABASE_URL
    if (u && typeof u === "string") {
      const parsed = new URL(u.replace(/^postgresql:\/\//, "https://"))
      return parsed.hostname ?? "(inválido)"
    }
  } catch {
    // ignora
  }
  return "(não mostrado)"
}

/**
 * Rota de diagnóstico completo do sistema de agendamentos.
 * GET /api/booking-diagnostic
 * Descobre se o problema está no banco, backend, timezone, antecedência ou leitura da agenda.
 */
export async function GET() {
  let createdBookingId: string | null = null
  let diagnosticDate: Date | null = null

  try {
    // PASSO 1 — Verificar conexão com Supabase
    const database_host = getDatabaseHost()
    await prisma.$queryRaw`SELECT 1`

    // PASSO 2 — Contar registros
    const bookings_total = await prisma.booking.count()

    // PASSO 3 — Criar booking de teste
    const service = await prisma.service.findFirst()
    if (!service) {
      return NextResponse.json({
        ok: false,
        step: "criar_booking_teste",
        error: "Nenhum serviço encontrado na tabela services. Crie um serviço ou rode npm run db:seed.",
      }, { status: 400 })
    }

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    diagnosticDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())

    const booking = await prisma.booking.create({
      data: {
        clientName: "DIAGNOSTICO SISTEMA",
        phone: "00000000000",
        serviceId: service.id,
        date: diagnosticDate,
        time: "15:00",
        status: "active",
      },
    })
    createdBookingId = booking.id

    // PASSO 4 — Buscar o booking criado
    const bookingFound = await prisma.booking.findUnique({
      where: { id: createdBookingId },
      include: { service: true },
    })
    const booking_found = !!bookingFound
    const booking_data = bookingFound
      ? {
          id: bookingFound.id,
          client_name: bookingFound.clientName,
          phone: bookingFound.phone,
          date: bookingFound.date,
          time: bookingFound.time,
          status: bookingFound.status,
          service_name: bookingFound.service.name,
        }
      : null

    // PASSO 5 — Testar leitura da agenda (bookings naquele dia)
    const startOfDay = new Date(diagnosticDate!.getFullYear(), diagnosticDate!.getMonth(), diagnosticDate!.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    const bookingsThatDay = await prisma.booking.count({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
      },
    })

    // PASSO 6 — Testar configurações (min_lead_minutes)
    let min_lead_minutes: number | null = null
    try {
      const setting = await prisma.appSetting.findUnique({ where: { key: "min_lead_minutes" } })
      if (setting?.value != null) {
        const n = parseInt(setting.value, 10)
        min_lead_minutes = Number.isFinite(n) ? n : null
      }
    } catch {
      // tabela pode não existir
    }

    // PASSO 7 — Testar timezone
    const server_time = new Date().toISOString()
    let database_time = "(erro)"
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? process.env.TZ ?? "(não detectado)"
    try {
      const rows = await prisma.$queryRaw<[{ now: Date }]>`SELECT NOW() as now`
      if (rows?.[0]?.now) {
        database_time = new Date(rows[0].now).toISOString()
      }
    } catch {
      // ignora
    }

    return NextResponse.json({
      ok: true,
      database_host,
      bookings_total,
      booking_created: true,
      booking_id: createdBookingId,
      booking_found,
      booking_data,
      bookings_that_day: bookingsThatDay,
      min_lead_minutes,
      server_time,
      database_time,
      timezone,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[booking-diagnostic] Erro:", e)

    const step =
      !createdBookingId && !diagnosticDate
        ? "conexao_ou_criar_booking"
        : !createdBookingId
          ? "criar_booking_teste"
          : "buscar_ou_contar_ou_config"

    return NextResponse.json(
      {
        ok: false,
        step,
        error: msg,
      },
      { status: 500 },
    )
  }
}
