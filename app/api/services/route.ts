import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const list = await prisma.service.findMany({ orderBy: { name: "asc" } })
    const data = list.map((s) => ({
      id: s.id,
      name: s.name,
      desc: s.desc,
      price: s.price,
      duration: s.duration,
    }))
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao listar serviços" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Envie um array de serviços" }, { status: 400 })
    }
    for (const s of body) {
      const data = { name: s.name, desc: s.desc ?? "", price: s.price, duration: s.duration }
      if (s.id) {
        await prisma.service.upsert({
          where: { id: s.id },
          create: { id: s.id, ...data },
          update: data,
        })
      } else {
        await prisma.service.create({ data })
      }
    }
    const list = await prisma.service.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json(
      list.map((s) => ({ id: s.id, name: s.name, desc: s.desc, price: s.price, duration: s.duration }))
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao salvar serviços" }, { status: 500 })
  }
}
