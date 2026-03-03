import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { phone, senhaAtual, novaSenha } = await request.json()
    if (!phone || !senhaAtual || !novaSenha) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }
    if (novaSenha.length < 4) {
      return NextResponse.json({ error: "A nova senha deve ter pelo menos 4 caracteres" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const senhaOk = await bcrypt.compare(senhaAtual, user.passwordHash)
    if (!senhaOk) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 401 })
    }

    const novoHash = await bcrypt.hash(novaSenha, 10)
    await prisma.user.update({
      where: { phone },
      data: { passwordHash: novoHash },
    })

    return NextResponse.json({ ok: true, message: "Senha alterada com sucesso" })
  } catch (e) {
    console.error("[change-password]", e)
    return NextResponse.json({ error: "Erro ao alterar senha" }, { status: 500 })
  }
}
