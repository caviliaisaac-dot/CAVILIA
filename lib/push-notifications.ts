import webpush from "web-push"
import { prisma } from "@/lib/db"
import type { ScheduledReminder } from "./reminders"

const DEFAULT_MESSAGE = "Olá {{nome}}, seu {{servico}} é {{data}} às {{hora}}."

export function resolveReminderMessage(
  template: string,
  data: { nome: string; servico: string; data: string; hora: string }
): string {
  let msg = template || DEFAULT_MESSAGE
  msg = msg.replace(/\{\{nome\}\}/g, data.nome)
  msg = msg.replace(/\{\{servico\}\}/g, data.servico)
  msg = msg.replace(/\{\{data\}\}/g, data.data)
  msg = msg.replace(/\{\{hora\}\}/g, data.hora)
  return msg
}

export async function getReminderMessageTemplate(): Promise<string> {
  const row = await prisma.reminderMessage.findFirst()
  return row?.mensagem ?? DEFAULT_MESSAGE
}

export async function createScheduledNotifications(
  booking: {
    id: string
    clientName: string
    phone: string
    serviceName: string
    date: Date
    time: string
  },
  scheduled: ScheduledReminder[]
): Promise<void> {
  const template = await getReminderMessageTemplate()
  const dataStr = booking.date instanceof Date
    ? booking.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : String(booking.date)

  for (const s of scheduled) {
    const messageText = resolveReminderMessage(template, {
      nome: booking.clientName,
      servico: booking.serviceName,
      data: dataStr,
      hora: booking.time,
    })
    await prisma.scheduledNotification.create({
      data: {
        bookingId: booking.id,
        sendAt: s.sendAt,
        clientName: booking.clientName,
        phone: booking.phone,
        serviceName: booking.serviceName,
        date: dataStr,
        time: booking.time,
        messageText,
      },
    })
  }
}

function normalizePhone(phone: string): string {
  const d = phone.replace(/\D/g, "")
  return d.length >= 12 && d.startsWith("55") ? d.slice(2) : d
}

export async function sendPendingPushNotifications(baseUrl: string): Promise<{ sent: number; failed: number }> {
  const vapidPublic = process.env.VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  if (!vapidPublic || !vapidPrivate) {
    console.warn("[push] VAPID keys not set. Skip sending.")
    return { sent: 0, failed: 0 }
  }

  webpush.setVapidDetails(`mailto:${process.env.VAPID_MAILTO ?? "contato@cavilia.app"}`, vapidPublic, vapidPrivate)

  const now = new Date()
  const pending = await prisma.scheduledNotification.findMany({
    where: { sendAt: { lte: now }, sentAt: null },
    take: 50,
  })

  let sent = 0
  let failed = 0

  for (const notif of pending) {
    const phoneNorm = normalizePhone(notif.phone)
    const sub = await prisma.pushSubscription.findUnique({
      where: { phone: phoneNorm },
    })
    if (!sub) {
      console.warn("[push] No subscription for phone:", notif.phone)
      await prisma.scheduledNotification.update({
        where: { id: notif.id },
        data: { sentAt: now },
      })
      failed++
      continue
    }

    const payload = JSON.stringify({
      title: "Lembrete CAVILIA",
      body: notif.messageText,
      icon: `${baseUrl}/images/app-icon.png`,
      image: `${baseUrl}/images/emblem.png`,
      tag: `reminder-${notif.bookingId}`,
    })

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload,
        { TTL: 60 }
      )
      await prisma.scheduledNotification.update({
        where: { id: notif.id },
        data: { sentAt: now },
      })
      sent++
    } catch (e) {
      console.error("[push] Send failed:", notif.id, e)
      failed++
    }
  }

  return { sent, failed }
}
