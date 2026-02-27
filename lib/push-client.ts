/**
 * Pede permissão de notificação e inscreve o dispositivo para push.
 * Envia a inscrição ao backend associada ao telefone do usuário.
 */
export async function subscribeToPushNotifications(phone: string): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") return false

    const reg = await navigator.serviceWorker.ready
    const vapidRes = await fetch("/api/push-vapid")
    if (!vapidRes.ok) return false
    const { publicKey } = await vapidRes.json()
    if (!publicKey) return false

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })

    const subscription = sub.toJSON()
    const r = await fetch("/api/push-subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        subscription: {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.keys?.p256dh, auth: subscription.keys?.auth },
        },
      }),
    })
    return r.ok
  } catch {
    return false
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
