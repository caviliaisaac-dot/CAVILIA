import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"
export const maxDuration = 15

function isTableMissing(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? "")
  return (
    msg.includes("P2021") ||
    msg.includes("does not exist") ||
    msg.includes("app_settings")
  )
}

async function ensureAppSettingsTable(): Promise<boolean> {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.app_settings (
        id TEXT NOT NULL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL DEFAULT ''
      );
    `)
    return true
  } catch (e) {
    console.error("[app-settings] ensureTable failed", e)
    return false
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key") || "sobre"
    const setting = await prisma.appSetting.findUnique({ where: { key } })
    return NextResponse.json({ key, value: setting?.value ?? "" })
  } catch (e) {
    if (isTableMissing(e)) {
      const ok = await ensureAppSettingsTable()
      if (ok) {
        try {
          const { searchParams } = new URL(request.url)
          const key = searchParams.get("key") || "sobre"
          const setting = await prisma.appSetting.findUnique({ where: { key } })
          return NextResponse.json({ key, value: setting?.value ?? "" })
        } catch (_) {}
      }
    }
    console.error("[app-settings GET]", e)
    return NextResponse.json({ key: "sobre", value: "" })
  }
}

export async function PUT(request: Request) {
  let body: { key?: string; value?: unknown } | null = null
  try {
    const text = await request.text()
    body = text ? JSON.parse(text) : null
  } catch {
    return NextResponse.json(
      { error: "Requisição inválida. Tente novamente." },
      { status: 400 }
    )
  }

  const key = body?.key
  const rawValue = body?.value
  if (!key) {
    return NextResponse.json(
      { error: "key e value são obrigatórios" },
      { status: 400 }
    )
  }
  const value = rawValue != null ? String(rawValue) : ""

  const doUpsert = async () => {
    return prisma.appSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })
  }

  try {
    const setting = await doUpsert()
    return NextResponse.json({ key: setting.key, value: setting.value })
  } catch (e) {
    const tableWasMissing = isTableMissing(e)
    if (tableWasMissing) {
      const ok = await ensureAppSettingsTable()
      if (ok) {
        try {
          const setting = await doUpsert()
          return NextResponse.json({ key: setting.key, value: setting.value })
        } catch (retryErr) {
          console.error("[app-settings PUT retry]", retryErr)
        }
      }
    } else {
      await ensureAppSettingsTable()
      try {
        const setting = await doUpsert()
        return NextResponse.json({ key: setting.key, value: setting.value })
      } catch (retryErr) {
        console.error("[app-settings PUT retry 2]", retryErr)
      }
    }
    console.error("[app-settings PUT]", e)
    return NextResponse.json(
      { error: "Erro ao salvar configuração" },
      { status: 500 }
    )
  }
}
