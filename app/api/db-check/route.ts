import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Rota de diagnóstico: verifica se o Supabase está conectado.
 * Acesse: http://localhost:3000/api/db-check (ou sua URL)/api/db-check
 */
export async function GET() {
  try {
    const hasDbUrl = !!process.env.DATABASE_URL
    const hasDirectUrl = !!process.env.DIRECT_URL

    if (!hasDbUrl || !hasDirectUrl) {
      return NextResponse.json({
        ok: false,
        error: "Variáveis de ambiente faltando",
        details: {
          DATABASE_URL: hasDbUrl ? "✓ definida" : "✗ NÃO definida",
          DIRECT_URL: hasDirectUrl ? "✓ definida" : "✗ NÃO definida",
        },
        solucao: "Crie .env.local com DATABASE_URL e DIRECT_URL (veja .env.example)",
      }, { status: 500 })
    }

    await prisma.$queryRaw`SELECT 1`
    const servicesCount = await prisma.service.count()
    const bookingsCount = await prisma.booking.count()

    return NextResponse.json({
      ok: true,
      message: "Supabase conectado com sucesso!",
      tabelas: {
        services: servicesCount,
        bookings: bookingsCount,
      },
      dica: servicesCount === 0 ? "Rode: npm run db:seed" : undefined,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[db-check] Erro:", e)

    let solucao = "Verifique DATABASE_URL e DIRECT_URL no .env.local"
    if (msg.includes("connect") || msg.includes("ECONNREFUSED")) {
      solucao = "URL ou senha incorretos. Copie a Connection string do Supabase (Project Settings → Database)"
    }
    if (msg.includes("relation") || msg.includes("does not exist")) {
      solucao = "Tabelas não existem. Rode: npx prisma migrate dev --name init"
    }

    return NextResponse.json({
      ok: false,
      error: msg,
      solucao,
    }, { status: 500 })
  }
}
