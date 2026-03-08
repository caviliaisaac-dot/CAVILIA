import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email?.trim()) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
    })
    if (!user) {
      return NextResponse.json(
        {
          error: "E-mail não encontrado. Se você criou a conta sem informar e-mail (campo opcional), a recuperação por e-mail não está disponível — tente entrar com seu WhatsApp e senha.",
        },
        { status: 404 },
      )
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    })

    if (error) {
      console.error("[forgot-password] Supabase OTP error:", error)
      return NextResponse.json(
        { error: "Erro ao enviar código. Tente novamente em alguns minutos." },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[forgot-password]", e)
    return NextResponse.json({ error: "Erro ao enviar código." }, { status: 500 })
  }
}
