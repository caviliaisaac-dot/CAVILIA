import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, name, phone, email, password, photoUrl } = body

    if (action === "register") {
      if (!name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
      if (!phone?.trim()) return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 })
      if (!password || password.length < 4) return NextResponse.json({ error: "Senha deve ter pelo menos 4 caracteres" }, { status: 400 })
      const phoneClean = phone.replace(/\D/g, "")
      if (phoneClean.length < 10) return NextResponse.json({ error: "Telefone inválido" }, { status: 400 })
      const existing = await prisma.user.findUnique({ where: { phone } })
      if (existing) return NextResponse.json({ error: "Telefone já cadastrado" }, { status: 409 })
      const hash = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          phone,
          email: (email && typeof email === "string") ? email.trim() : "",
          passwordHash: hash,
          photoUrl: photoUrl || null,
          totalVisitas: 0,
          dataCadastro: new Date().toISOString(),
        },
      })
      return NextResponse.json({
        name: user.name,
        phone: user.phone,
        email: user.email,
        password: password,
        photoUrl: user.photoUrl ?? undefined,
        totalVisitas: user.totalVisitas,
        dataCadastro: user.dataCadastro,
      })
    }

    if (action === "login") {
      const { loginId, password: pass } = body
      const byPhone = await prisma.user.findUnique({ where: { phone: loginId } })
      const byEmail = loginId?.includes("@")
        ? await prisma.user.findFirst({ where: { email: loginId } })
        : null
      const user = byPhone || byEmail
      if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
      const ok = await bcrypt.compare(pass, user.passwordHash)
      if (!ok) return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
      return NextResponse.json({
        name: user.name,
        phone: user.phone,
        email: user.email,
        password: pass,
        photoUrl: user.photoUrl ?? undefined,
        totalVisitas: user.totalVisitas,
        dataCadastro: user.dataCadastro,
      })
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[users POST] Erro:", msg)
    return NextResponse.json({
      error: "Erro ao criar usuário",
      detalhe: msg,
      dica: msg.includes("connect") || msg.includes("ECONNREFUSED")
        ? "Verifique o Supabase (DATABASE_URL no .env.local)"
        : msg.includes("relation") || msg.includes("does not exist")
          ? "Rode: npx prisma migrate dev"
          : undefined,
    }, { status: 500 })
  }
}
