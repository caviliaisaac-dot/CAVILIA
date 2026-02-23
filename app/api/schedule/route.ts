import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [dayoffs, timeBlocks] = await Promise.all([
      prisma.scheduleDayOff.findMany({ orderBy: { date: "asc" } }),
      prisma.scheduleTimeBlock.findMany({ orderBy: [{ date: "asc" }, { time: "asc" }] }),
    ])
    return NextResponse.json({
      dayoffs: dayoffs.map((d) => d.date),
      timeBlocks: timeBlocks.map((t) => ({ date: t.date, time: t.time, label: t.label })),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao carregar agenda" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { dayoffs = [], timeBlocks = [] } = body

    await prisma.scheduleDayOff.deleteMany({})
    await prisma.scheduleTimeBlock.deleteMany({})

    if (dayoffs.length) {
      await prisma.scheduleDayOff.createMany({
        data: dayoffs.map((date: string) => ({ date })),
      })
    }
    if (timeBlocks.length) {
      await prisma.scheduleTimeBlock.createMany({
        data: timeBlocks.map((b: { date: string; time: string; label: string }) => ({
          date: b.date,
          time: b.time,
          label: b.label,
        })),
      })
    }

    const [dayoffsList, timeBlocksList] = await Promise.all([
      prisma.scheduleDayOff.findMany({ orderBy: { date: "asc" } }),
      prisma.scheduleTimeBlock.findMany({ orderBy: [{ date: "asc" }, { time: "asc" }] }),
    ])
    return NextResponse.json({
      dayoffs: dayoffsList.map((d) => d.date),
      timeBlocks: timeBlocksList.map((t) => ({ date: t.date, time: t.time, label: t.label })),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao salvar agenda" }, { status: 500 })
  }
}
