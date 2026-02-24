import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

const VALID_UNITS = ["day", "hour", "minute"] as const

export async function GET() {
  try {
    const list = await prisma.reminderSetting.findMany({
      orderBy: [{ unidade: "asc" }, { quantidade: "desc" }],
    })
    return NextResponse.json(
      list.map((r) => ({
        id: r.id,
        unidade: r.unidade,
        quantidade: r.quantidade,
        ativo: r.ativo,
      }))
    )
  } catch (e) {
    console.error("[reminder-settings GET]", e)
    return NextResponse.json({ error: "Erro ao listar configurações de lembretes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { unidade, quantidade, ativo } = body
    if (!unidade || !VALID_UNITS.includes(unidade)) {
      return NextResponse.json(
        { error: "unidade inválida. Use: day, hour ou minute" },
        { status: 400 }
      )
    }
    const q = Number(quantidade)
    if (Number.isNaN(q) || q < 1) {
      return NextResponse.json({ error: "quantidade deve ser um número maior que 0" }, { status: 400 })
    }
    const created = await prisma.reminderSetting.create({
      data: {
        unidade,
        quantidade: q,
        ativo: ativo !== false,
      },
    })
    return NextResponse.json({
      id: created.id,
      unidade: created.unidade,
      quantidade: created.quantidade,
      ativo: created.ativo,
    })
  } catch (e) {
    console.error("[reminder-settings POST]", e)
    return NextResponse.json({ error: "Erro ao criar lembrete" }, { status: 500 })
  }
}
