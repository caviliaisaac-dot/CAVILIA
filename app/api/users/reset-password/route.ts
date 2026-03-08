import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json()
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }
    if (newPassword.length < 4) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 4 caracteres" }, { status: 400 })
    }

    const { error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    })

    if (otpError) {
      console.error("[reset-password] OTP error:", otpError)
      if (otpError.message?.toLowerCase().includes("expired")) {
        return NextResponse.json(
          { error: "Código expirado. Solicite um novo código pelo botão 'Enviar Código'." },
          { status: 400 },
        )
      }
      return NextResponse.json({ error: "Código inválido. Confira o código ou solicite um novo." }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
    })
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const hash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hash, resetCode: null, resetCodeExp: null },
    })

    return NextResponse.json({ ok: true, message: "Senha redefinida com sucesso" })
  } catch (e) {
    console.error("[reset-password]", e)
    return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 })
  }
}
