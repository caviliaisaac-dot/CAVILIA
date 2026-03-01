import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { scheduleAppointmentReminders } from "@/lib/reminders"
import { createScheduledNotifications } from "@/lib/push-notifications"

export const dynamic = "force-dynamic"

function parseDurationMinutes(duration: string): number {
  const match = String(duration || "").match(/(\d+)/)
  return match ? Math.max(1, parseInt(match[1], 10)) : 30
}

function timeToMinutes(time: string): number {
  const [h, m] = String(time || "00:00").split(":").map(Number)
  return (h || 0) * 60 + (m || 0)
}

function dateToKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phoneParam = searchParams.get("phone")

    const list = await prisma.booking.findMany({
      orderBy: [{ date: "asc" }, { time: "asc" }],
      include: { service: true, user: true },
    })

    let data = list.map((b) => ({
      id: b.id,
      service: b.service.name,
      price: b.service.price,
      date: b.date,
      time: b.time,
      clientName: b.clientName,
      phone: b.phone,
      status: b.status as "active" | "cancelled" | "rescheduled",
    }))

    // Filtro por telefone: só agendamentos do cliente (perfil)
    if (phoneParam && phoneParam.trim()) {
      const normalize = (p: string) => {
        const d = p.replace(/\D/g, "")
        return d.length >= 12 && d.startsWith("55") ? d.slice(2) : d
      }
      const want = normalize(phoneParam.trim())
      if (want) {
        data = data.filter((b) => normalize(b.phone) === want)
      }
    }

    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao listar agendamentos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { serviceId, serviceName, price, userId, clientName, phone, date, time } = body
    if (!clientName || !phone || !date || !time) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }
    let service = serviceId
      ? await prisma.service.findUnique({ where: { id: serviceId } })
      : serviceName
        ? await prisma.service.findFirst({ where: { name: serviceName } })
        : null
    if (!service && serviceName) {
      service = await prisma.service.create({
        data: {
          name: serviceName,
          desc: serviceName,
          price: price || "R$ 0",
          duration: "30 min",
        },
      })
    }
    if (!service) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 })

    const bookingDate = new Date(date)
    const dateKey = dateToKey(bookingDate)
    const newStartMin = timeToMinutes(time)
    const newDurationMin = parseDurationMinutes(service.duration)
    const newEndMin = newStartMin + newDurationMin

    const sameDayBookings = await prisma.booking.findMany({
      where: {
        date: { gte: new Date(dateKey + "T00:00:00"), lt: new Date(dateKey + "T23:59:59.999") },
        status: { in: ["active", "rescheduled"] },
      },
      include: { service: true },
    })

    for (const existing of sameDayBookings) {
      const existingStart = timeToMinutes(existing.time)
      const existingDuration = parseDurationMinutes(existing.service.duration)
      const existingEnd = existingStart + existingDuration
      const overlaps = newStartMin < existingEnd && existingStart < newEndMin
      if (overlaps) {
        return NextResponse.json(
          {
            error: "Este horário já está ocupado",
            detalhe: `Já existe um agendamento às ${existing.time} (${existing.service.name}). Escolha outro horário.`,
          },
          { status: 409 }
        )
      }
    }

    let uid: string | null = userId || null
    if (!uid) {
      const u = await prisma.user.findUnique({ where: { phone } })
      if (u) uid = u.id
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId: service.id,
        userId: uid,
        clientName,
        phone,
        date: new Date(date),
        time,
        status: "active",
      },
      include: { service: true },
    })

    scheduleAppointmentReminders({
      id: booking.id,
      date: booking.date,
      time: booking.time,
      clientName: booking.clientName,
      phone: booking.phone,
      service: { name: booking.service.name },
    }).then(async (scheduled) => {
      if (scheduled.length > 0) {
        console.log("[bookings] Lembretes agendados:", booking.id, scheduled.map((s) => ({ sendAt: s.sendAt.toISOString(), label: s.label })))
        await createScheduledNotifications(
          {
            id: booking.id,
            clientName: booking.clientName,
            phone: booking.phone,
            serviceName: booking.service.name,
            date: booking.date,
            time: booking.time,
          },
          scheduled
        )
      }
    }).catch((err) => console.error("[bookings] Erro ao agendar lembretes:", err))

    return NextResponse.json({
      id: booking.id,
      service: booking.service.name,
      price: booking.service.price,
      date: booking.date,
      time: booking.time,
      clientName: booking.clientName,
      phone: booking.phone,
      status: booking.status,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[bookings POST] Erro:", msg)
    let dica: string | undefined
    if (msg.includes("connect") || msg.includes("ECONNREFUSED")) dica = "Verifique DATABASE_URL no .env.local"
    else if (msg.includes("Tenant") || msg.includes("user not found")) dica = "Reinicie o servidor (Ctrl+C e depois npm run dev na pasta cavilia\\cavilia)"
    else if (msg.includes("relation") || msg.includes("does not exist")) dica = "Rode: npx prisma migrate dev --name init"
    return NextResponse.json({
      error: "Erro ao criar agendamento",
      detalhe: msg,
      dica,
    }, { status: 500 })
  }
}
