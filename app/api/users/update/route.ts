import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, totalVisitas, photoUrl, name, email } = body
    if (!phone) return NextResponse.json({ error: "Telefone obrigatório" }, { status: 400 })

    const update: { totalVisitas?: number; photoUrl?: string | null; name?: string; email?: string } = {}
    if (typeof totalVisitas === "number") update.totalVisitas = totalVisitas
    if (photoUrl !== undefined) update.photoUrl = photoUrl || null
    if (name !== undefined) update.name = name
    if (email !== undefined) update.email = email

    const user = await prisma.user.update({
      where: { phone },
      data: update,
    })
    return NextResponse.json({
      name: user.name,
      phone: user.phone,
      email: user.email,
      password: "",
      photoUrl: user.photoUrl ?? undefined,
      totalVisitas: user.totalVisitas,
      dataCadastro: user.dataCadastro,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
  }
}
