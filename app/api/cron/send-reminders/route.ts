import { NextResponse } from "next/server"
import { sendPendingPushNotifications } from "@/lib/push-notifications"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    const { sent, failed } = await sendPendingPushNotifications(baseUrl)
    return NextResponse.json({ ok: true, sent, failed })
  } catch (e) {
    console.error("[cron send-reminders]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
