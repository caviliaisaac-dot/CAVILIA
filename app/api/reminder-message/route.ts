import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const row = await prisma.reminderMessage.findFirst()
    return NextResponse.json({
      mensagem: row?.mensagem ?? "",
    })
  } catch (e) {
    console.error("[reminder-message GET]", e)
    return NextResponse.json({ error: "Erro ao buscar mensagem" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mensagem } = body
    const text = typeof mensagem === "string" ? mensagem : ""

    const existing = await prisma.reminderMessage.findFirst()
    if (existing) {
      await prisma.reminderMessage.update({
        where: { id: existing.id },
        data: { mensagem: text },
      })
      return NextResponse.json({ mensagem: text })
    }
    const created = await prisma.reminderMessage.create({
      data: { mensagem: text },
    })
    return NextResponse.json({ mensagem: created.mensagem })
  } catch (e) {
    console.error("[reminder-message POST]", e)
    return NextResponse.json({ error: "Erro ao salvar mensagem" }, { status: 500 })
  }
}
