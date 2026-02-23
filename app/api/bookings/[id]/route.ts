import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, date, time } = body
    const update: { status?: string; date?: Date; time?: string } = {}
    if (status) update.status = status
    if (date) update.date = new Date(date)
    if (time) update.time = time

    const booking = await prisma.booking.update({
      where: { id },
      data: update,
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
    return NextResponse.json({ error: "Erro ao atualizar agendamento" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.booking.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao excluir agendamento" }, { status: 500 })
  }
}
