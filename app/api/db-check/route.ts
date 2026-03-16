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
        solucao: "Na Vercel: Settings → Environment Variables. Adicione DATABASE_URL e DIRECT_URL. Depois: Redeploy.",
      }, { status: 500 })
    }

    await prisma.$queryRaw`SELECT 1`
    const servicesCount = await prisma.service.count()
    const bookingsCount = await prisma.booking.count()

    // Diagnóstico de app_settings (antecedência mínima etc.) — ajuda a descobrir se produção e localhost usam o mesmo banco
    let appSettingsInfo: { min_lead_minutes: string; total_keys: number } = { min_lead_minutes: "—", total_keys: 0 }
    try {
      const settings = await prisma.appSetting.findMany({ select: { key: true, value: true } })
      const minLead = settings.find((s) => s.key === "min_lead_minutes")
      appSettingsInfo = {
        min_lead_minutes: minLead ? minLead.value : "(não configurado)",
        total_keys: settings.length,
      }
    } catch {
      appSettingsInfo = { min_lead_minutes: "(tabela app_settings ausente ou erro)", total_keys: 0 }
    }

    // Indício de qual banco está sendo usado (só o host, sem senha) para comparar localhost vs Vercel
    let dbHost = "(não mostrado)"
    try {
      const u = process.env.DATABASE_URL
      if (u && typeof u === "string") {
        const parsed = new URL(u.replace(/^postgresql:\/\//, "https://"))
        dbHost = parsed.hostname ?? "(inválido)"
      }
    } catch {
      // ignora
    }

    return NextResponse.json({
      ok: true,
      message: "Supabase conectado com sucesso!",
      tabelas: {
        services: servicesCount,
        bookings: bookingsCount,
      },
      app_settings: appSettingsInfo,
      database_host: dbHost,
      dica: servicesCount === 0 ? "Rode: npm run db:seed" : undefined,
      como_descobrir_erro:
        "Compare esta página com a mesma URL no outro ambiente (localhost vs Vercel). Se app_settings ou database_host forem diferentes, cada ambiente está usando um banco diferente — a antecedência que você salvou no ADM foi só no banco deste ambiente.",
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
