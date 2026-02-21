"use client"

import { useState, useEffect } from "react"
import { Lock, Eye, EyeOff } from "lucide-react"

interface AdmLoginScreenProps {
  onLogin: () => void
}

export function AdmLoginScreen({ onLogin }: AdmLoginScreenProps) {
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState(false)

  // Carrega credenciais salvas ao abrir
  useEffect(() => {
    const saved = localStorage.getItem("cavilia-adm-saved")
    if (saved) {
      try {
        const { user: u, pass: p } = JSON.parse(saved)
        setUser(u || "")
        setPass(p || "")
        setRememberMe(true)
      } catch {}
    }
  }, [])

  function handleLogin() {
    if (user.toLowerCase() === "cavilia" && pass === "0000") {
      setError(false)
      if (rememberMe) {
        localStorage.setItem("cavilia-adm-saved", JSON.stringify({ user, pass }))
      } else {
        localStorage.removeItem("cavilia-adm-saved")
      }
      onLogin()
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-24">
      <div className="w-full max-w-xs">
        {/* Ícone */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex-shrink-0"
            style={{
              width: 116,
              height: 116,
              padding: 3,
              borderRadius: "9999px",
              background: "conic-gradient(from 0deg, #f5cc6a 0%, #e8b84b 18%, #c49a2e 35%, #fff3b0 50%, #c49a2e 65%, #e8b84b 82%, #f5cc6a 100%)",
              boxShadow: "0 0 22px 6px rgba(212,160,23,0.55), 0 0 8px 2px rgba(255,243,176,0.3)",
            }}
          >
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-black overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/cowboy-coin.png"
                alt="ADM"
                style={{
                  position: "absolute",
                  width: "140%",
                  height: "140%",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -46%)",
                  objectFit: "cover",
                  borderRadius: "9999px",
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold" style={{
              background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              ADM
            </h1>
            <p className="mt-0.5 text-xs tracking-widest uppercase text-gold/60">Área Restrita</p>
          </div>
        </div>

        {/* Formulário */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Usuário
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => { setUser(e.target.value); setError(false) }}
              placeholder="cavilia"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={pass}
                onChange={(e) => { setPass(e.target.value); setError(false) }}
                placeholder="••••"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-gold"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Lembrar senha */}
          <button
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2.5 self-start"
          >
            <div
              className="flex h-5 w-5 items-center justify-center rounded"
              style={{
                border: rememberMe ? "2px solid #d4a017" : "2px solid rgba(212,160,23,0.3)",
                background: rememberMe ? "rgba(212,160,23,0.15)" : "transparent",
                transition: "all 0.2s",
                boxShadow: rememberMe ? "0 0 6px rgba(212,160,23,0.4)" : "none",
              }}
            >
              {rememberMe && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#d4a017" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="text-xs text-muted-foreground" style={{ color: rememberMe ? "#d4a017" : undefined }}>
              Lembrar senha
            </span>
          </button>

          {error && (
            <p className="text-center text-xs text-red-400">Usuário ou senha incorretos</p>
          )}

          <button
            onClick={handleLogin}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 font-serif text-base font-bold transition-all"
            style={{
              background: "#2a2420",
              border: "2.5px solid #d4a017",
              boxShadow: "0 0 12px 3px rgba(212,160,23,0.4)",
            }}
          >
            <Lock className="h-4 w-4" style={{ color: "#d4a017" }} />
            <span style={{
              background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Entrar
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
