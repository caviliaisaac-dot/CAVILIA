import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

const VALID_UNITS = ["day", "hour", "minute"] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { ativo, unidade, quantidade } = body
    const data: { ativo?: boolean; unidade?: string; quantidade?: number } = {}
    if (typeof ativo === "boolean") data.ativo = ativo
    if (unidade && VALID_UNITS.includes(unidade)) data.unidade = unidade
    if (typeof quantidade === "number" && quantidade >= 1) data.quantidade = quantidade

    const updated = await prisma.reminderSetting.update({
      where: { id },
      data,
    })
    return NextResponse.json({
      id: updated.id,
      unidade: updated.unidade,
      quantidade: updated.quantidade,
      ativo: updated.ativo,
      quantidadeDias: updated.quantidadeDias ?? 0,
      quantidadeHoras: updated.quantidadeHoras ?? 0,
      quantidadeMinutos: updated.quantidadeMinutos ?? 0,
    })
  } catch (e) {
    console.error("[reminder-settings PATCH]", e)
    return NextResponse.json({ error: "Erro ao atualizar lembrete" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.reminderSetting.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[reminder-settings DELETE]", e)
    return NextResponse.json({ error: "Erro ao excluir lembrete" }, { status: 500 })
  }
}
