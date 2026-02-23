import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const list = await prisma.booking.findMany({
      orderBy: [{ date: "asc" }, { time: "asc" }],
      include: { service: true, user: true },
    })
    const data = list.map((b) => ({
      id: b.id,
      service: b.service.name,
      price: b.service.price,
      date: b.date,
      time: b.time,
      clientName: b.clientName,
      phone: b.phone,
      status: b.status as "active" | "cancelled" | "rescheduled",
    }))
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao listar agendamentos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { serviceId, serviceName, userId, clientName, phone, date, time } = body
    if (!clientName || !phone || !date || !time) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }
    const service = serviceId
      ? await prisma.service.findUnique({ where: { id: serviceId } })
      : serviceName
        ? await prisma.service.findFirst({ where: { name: serviceName } })
        : null
    if (!service) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 })

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
    console.error(e)
    return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 })
  }
}
