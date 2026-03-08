"use client"

export function BuildId() {
  const sha = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA as string) : ""
  if (!sha) return null
  return (
    <div className="fixed bottom-14 left-2 z-40 text-[10px] text-muted-foreground/50 font-mono" title="Versão do deploy (muda a cada push)">
      v {sha.slice(0, 7)}
    </div>
  )
}
