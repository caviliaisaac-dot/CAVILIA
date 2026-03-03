import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key") || "sobre"
    const setting = await prisma.appSetting.findUnique({ where: { key } })
    return NextResponse.json({ key, value: setting?.value ?? "" })
  } catch (e) {
    console.error("[app-settings GET]", e)
    return NextResponse.json({ key: "sobre", value: "" })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { key, value } = body
    if (!key || typeof value !== "string") {
      return NextResponse.json({ error: "key e value são obrigatórios" }, { status: 400 })
    }
    const setting = await prisma.appSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })
    return NextResponse.json({ key: setting.key, value: setting.value })
  } catch (e) {
    console.error("[app-settings PUT]", e)
    return NextResponse.json({ error: "Erro ao salvar configuração" }, { status: 500 })
  }
}
