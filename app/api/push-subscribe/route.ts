import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, subscription } = body
    if (!phone || typeof phone !== "string" || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { error: "Envie phone e subscription (endpoint, keys.p256dh, keys.auth)" },
        { status: 400 }
      )
    }

    const phoneNorm = phone.replace(/\D/g, "")
    const phoneClean = phoneNorm.length >= 12 && phoneNorm.startsWith("55") ? phoneNorm.slice(2) : phoneNorm
    if (!phoneClean) {
      return NextResponse.json({ error: "Telefone inválido" }, { status: 400 })
    }

    await prisma.pushSubscription.upsert({
      where: { phone: phoneClean },
      create: {
        phone: phoneClean,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      update: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[push-subscribe]", e)
    return NextResponse.json({ error: "Erro ao registrar notificações" }, { status: 500 })
  }
}
