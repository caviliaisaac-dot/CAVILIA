import { prisma } from "@/lib/db"

export type ReminderUnit = "day" | "hour" | "minute"

export interface ReminderSettingRow {
  id: string
  unidade: ReminderUnit
  quantidade: number
  ativo: boolean
  quantidadeDias?: number
  quantidadeHoras?: number
  quantidadeMinutos?: number
}

export interface AppointmentForReminders {
  id: string
  date: Date
  time: string
  clientName: string
  phone: string
  service?: { name: string }
}

export interface ScheduledReminder {
  sendAt: Date
  label: string
  bookingId: string
}

/**
 * Busca todas as configurações de lembrete ativas do banco.
 */
export async function getActiveReminderSettings(): Promise<ReminderSettingRow[]> {
  const list = await prisma.reminderSetting.findMany({
    where: { ativo: true },
    orderBy: [{ unidade: "asc" }, { quantidade: "desc" }],
  })
  return list.map((r) => ({
    id: r.id,
    unidade: r.unidade as ReminderUnit,
    quantidade: r.quantidade,
    ativo: r.ativo,
    quantidadeDias: r.quantidadeDias ?? 0,
    quantidadeHoras: r.quantidadeHoras ?? 0,
    quantidadeMinutos: r.quantidadeMinutos ?? 0,
  }))
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.trim().split(":").map(Number)
  return { hours: h ?? 0, minutes: m ?? 0 }
}

/**
 * Calcula a data/hora em que o lembrete deve ser enviado com base no horário do atendimento
 * e na configuração (unidade + quantidade, ou dias + horas + minutos).
 */
function computeSendAt(appointmentDate: Date, appointmentTime: string, setting: ReminderSettingRow): Date {
  const { hours: appH, minutes: appM } = parseTime(appointmentTime)
  const base = new Date(appointmentDate)
  base.setHours(appH, appM, 0, 0)

  const sendAt = new Date(base)
  const dias = setting.quantidadeDias ?? 0
  const horas = setting.quantidadeHoras ?? 0
  const mins = setting.quantidadeMinutos ?? 0

  if (dias > 0 || horas > 0 || mins > 0) {
    sendAt.setDate(sendAt.getDate() - dias)
    sendAt.setHours(sendAt.getHours() - horas)
    sendAt.setMinutes(sendAt.getMinutes() - mins)
  } else {
    if (setting.unidade === "day") {
      sendAt.setDate(sendAt.getDate() - setting.quantidade)
    } else if (setting.unidade === "hour") {
      sendAt.setHours(sendAt.getHours() - setting.quantidade)
    } else {
      sendAt.setMinutes(sendAt.getMinutes() - setting.quantidade)
    }
  }
  return sendAt
}

/**
 * Retorna o label do lembrete para exibição (ex: "1 dia antes", "2 dias, 3 horas e 15 min antes").
 */
function reminderLabel(setting: ReminderSettingRow): string {
  const dias = setting.quantidadeDias ?? 0
  const horas = setting.quantidadeHoras ?? 0
  const mins = setting.quantidadeMinutos ?? 0
  if (dias > 0 || horas > 0 || mins > 0) {
    const parts: string[] = []
    if (dias > 0) parts.push(`${dias} ${dias === 1 ? "dia" : "dias"}`)
    if (horas > 0) parts.push(`${horas} ${horas === 1 ? "hora" : "horas"}`)
    if (mins > 0) parts.push(`${mins} ${mins === 1 ? "minuto" : "minutos"}`)
    return parts.join(", ") + " antes"
  }
  const q = setting.quantidade
  if (setting.unidade === "day") return `${q} ${q === 1 ? "dia" : "dias"} antes`
  if (setting.unidade === "hour") return `${q} ${q === 1 ? "hora" : "horas"} antes`
  return `${q} ${q === 1 ? "minuto" : "minutos"} antes`
}

/**
 * Usa as configurações ativas do banco para calcular os horários dos lembretes
 * e retorna a lista de notificações a serem agendadas.
 * Pronto para integrar com Firebase (Cloud Messaging / Cloud Functions) para envio push.
 */
export async function scheduleAppointmentReminders(
  appointment: AppointmentForReminders
): Promise<ScheduledReminder[]> {
  const settings = await getActiveReminderSettings()
  if (settings.length === 0) return []

  const appointmentDate = typeof appointment.date === "string" ? new Date(appointment.date) : appointment.date
  const results: ScheduledReminder[] = []

  for (const setting of settings) {
    const sendAt = computeSendAt(appointmentDate, appointment.time, setting)
    if (sendAt.getTime() <= Date.now()) continue
    results.push({
      sendAt,
      label: reminderLabel(setting),
      bookingId: appointment.id,
    })
  }

  return results
}
