"use client"

import { useState, useRef } from "react"
import { Eye, EyeOff, Camera, ArrowLeft, User, Phone, Mail, Lock, CheckCircle } from "lucide-react"

export interface UserData {
  name: string
  phone: string
  email: string
  password: string
  photoUrl?: string
  totalVisitas: number
  dataCadastro: string  // ISO string
}

interface AuthScreenProps {
  onAuth: (user: UserData) => void
  onBack: () => void
}

type AuthStep = "choice" | "login" | "register" | "forgot"

export function AuthScreen({ onAuth, onBack }: AuthScreenProps) {
  const [step, setStep] = useState<AuthStep>("choice")
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [error, setError] = useState("")
  const [forgotSent, setForgotSent] = useState(false)

  // Login fields
  const [loginPhone, setLoginPhone] = useState("")
  const [loginPass, setLoginPass] = useState("")

  // Register fields
  const [regName, setRegName] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPass, setRegPass] = useState("")
  const [regConfirmPass, setRegConfirmPass] = useState("")
  const [regPhoto, setRegPhoto] = useState<string>("")

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("")

  const photoInputRef = useRef<HTMLInputElement>(null)

  function formatPhone(val: string) {
    const d = val.replace(/\D/g, "").slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setRegPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleLogin() {
    setError("")
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", loginId: loginPhone.trim(), password: loginPass }),
    })
    if (res.ok) {
      const user = await res.json()
      localStorage.setItem("cavilia-current-user", JSON.stringify(user))
      onAuth(user)
      return
    }
    const raw = localStorage.getItem("cavilia-users")
    const users: UserData[] = raw ? JSON.parse(raw) : []
    const found = users.find(
      (u) => u.phone.replace(/\D/g, "") === loginPhone.replace(/\D/g, "") && u.password === loginPass
    )
    if (found) {
      localStorage.setItem("cavilia-current-user", JSON.stringify(found))
      onAuth(found)
    } else {
      setError("Telefone ou senha incorretos")
    }
  }

  async function handleRegister() {
    setError("")
    if (!regName.trim()) return setError("Informe seu nome")
    if (regPhone.replace(/\D/g, "").length < 10) return setError("Telefone inválido")
    if (regPass.length < 4) return setError("Senha deve ter pelo menos 4 caracteres")
    if (regPass !== regConfirmPass) return setError("Senhas não conferem")

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register",
        name: regName.trim(),
        phone: regPhone,
        email: regEmail.trim(),
        password: regPass,
        photoUrl: regPhoto || undefined,
      }),
    })
    if (res.ok) {
      const newUser = await res.json()
      localStorage.setItem("cavilia-current-user", JSON.stringify(newUser))
      onAuth(newUser)
      return
    }
    const err = await res.json().catch(() => ({}))
    if (res.status === 409) return setError("Telefone já cadastrado")
    if (err.error) return setError(err.error)

    const raw = localStorage.getItem("cavilia-users")
    const users: UserData[] = raw ? JSON.parse(raw) : []
    const exists = users.find((u) => u.phone.replace(/\D/g, "") === regPhone.replace(/\D/g, ""))
    if (exists) return setError("Telefone já cadastrado")
    const newUser: UserData = {
      name: regName.trim(),
      phone: regPhone,
      email: regEmail.trim(),
      password: regPass,
      photoUrl: regPhoto || undefined,
      totalVisitas: 0,
      dataCadastro: new Date().toISOString(),
    }
    users.push(newUser)
    localStorage.setItem("cavilia-users", JSON.stringify(users))
    localStorage.setItem("cavilia-current-user", JSON.stringify(newUser))
    onAuth(newUser)
  }

  function handleForgot() {
    setError("")
    if (!forgotEmail.trim()) return setError("Informe seu e-mail")
    const raw = localStorage.getItem("cavilia-users")
    const users: UserData[] = raw ? JSON.parse(raw) : []
    const found = users.find((u) => u.email?.toLowerCase() === forgotEmail.toLowerCase())
    if (!found) return setError("E-mail não encontrado")
    setForgotSent(true)
  }

  const goldGradient = {
    background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    backgroundClip: "text" as const,
  }

  const goldButton = {
    background: "#2a2420",
    border: "2.5px solid #d4a017",
    boxShadow: "0 0 12px 3px rgba(212,160,23,0.4)",
  }

  return (
    <div className="flex min-h-screen flex-col pb-24">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button
          onClick={step === "choice" ? onBack : () => { setStep("choice"); setError("") }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-serif text-lg font-semibold" style={goldGradient}>
          {step === "choice" ? "Acesso" : step === "login" ? "Entrar" : step === "register" ? "Cadastro" : "Recuperar Senha"}
        </h1>
      </header>

      <div className="flex flex-1 flex-col items-center px-6 pt-8">
        <div className="w-full max-w-xs">

          {/* CHOICE */}
          {step === "choice" && (
            <div className="flex flex-col gap-4">
              <p className="text-center text-sm text-muted-foreground mb-2">
                Para agendar, faça login ou crie sua conta
              </p>
              <button
                onClick={() => setStep("register")}
                className="w-full rounded-lg py-4 font-serif text-base font-bold transition-all"
                style={goldButton}
              >
                <span style={goldGradient}>Criar Conta</span>
              </button>
              <button
                onClick={() => setStep("login")}
                className="w-full rounded-lg border border-border bg-card py-4 font-serif text-base font-bold text-foreground transition-all hover:border-gold/40"
              >
                Já tenho conta
              </button>
            </div>
          )}

          {/* LOGIN */}
          {step === "login" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input type="tel" value={loginPhone}
                    onChange={(e) => { setLoginPhone(formatPhone(e.target.value)); setError("") }}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input type={showPass ? "text" : "password"} value={loginPass}
                    onChange={(e) => { setLoginPass(e.target.value); setError("") }}
                    placeholder="••••"
                    className="w-full rounded-lg border border-border bg-card pl-9 pr-11 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-gold">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button onClick={() => { setStep("forgot"); setError("") }} className="self-end text-xs text-gold/60 hover:text-gold">
                Esqueci minha senha
              </button>
              {error && <p className="text-center text-xs text-red-400">{error}</p>}
              <button onClick={handleLogin} className="w-full rounded-lg py-4 font-serif text-base font-bold" style={goldButton}>
                <span style={goldGradient}>Entrar</span>
              </button>
            </div>
          )}

          {/* REGISTER */}
          {step === "register" && (
            <div className="flex flex-col gap-4">
              {/* Foto de perfil */}
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => photoInputRef.current?.click()} className="relative">
                  <div className="h-20 w-20 rounded-full border-2 border-dashed border-gold/40 bg-card flex items-center justify-center overflow-hidden hover:border-gold/70 transition-colors">
                    {regPhoto
                      ? <img src={regPhoto} alt="Foto" className="h-full w-full object-cover" />
                      : <User className="h-8 w-8 text-muted-foreground/40" />
                    }
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold">
                    <Camera className="h-3.5 w-3.5 text-black" />
                  </div>
                </button>
                <span className="text-[10px] text-muted-foreground">Foto de perfil (opcional)</span>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Nome completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input type="text" value={regName} onChange={(e) => { setRegName(e.target.value); setError("") }}
                    placeholder="Seu nome"
                    className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">WhatsApp *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input type="tel" value={regPhone} onChange={(e) => { setRegPhone(formatPhone(e.target.value)); setError("") }}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">E-mail (recuperar senha)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input type="email" value={regEmail} onChange={(e) => { setRegEmail(e.target.value); setError("") }}
                    placeholder="seu@email.com"
                    className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input type={showPass ? "text" : "password"} value={regPass} onChange={(e) => { setRegPass(e.target.value); setError("") }}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full rounded-lg border border-border bg-card pl-9 pr-11 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                  />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-gold">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Confirmar Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input type={showConfirmPass ? "text" : "password"} value={regConfirmPass} onChange={(e) => { setRegConfirmPass(e.target.value); setError("") }}
                    placeholder="Repita a senha"
                    className="w-full rounded-lg border border-border bg-card pl-9 pr-11 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                  />
                  <button onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-gold">
                    {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-center text-xs text-red-400">{error}</p>}
              <button onClick={handleRegister} className="w-full rounded-lg py-4 font-serif text-base font-bold" style={goldButton}>
                <span style={goldGradient}>Criar Conta</span>
              </button>
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {step === "forgot" && (
            <div className="flex flex-col gap-4">
              {forgotSent ? (
                <div className="flex flex-col items-center gap-4 py-6">
                  <CheckCircle className="h-14 w-14 text-gold" />
                  <h2 className="font-serif text-xl font-bold text-foreground text-center">E-mail enviado!</h2>
                  <p className="text-sm text-muted-foreground text-center">
                    Verifique sua caixa de entrada para redefinir sua senha.
                  </p>
                  <button onClick={() => { setStep("login"); setForgotSent(false) }} className="w-full rounded-lg py-4 font-serif text-base font-bold mt-2" style={goldButton}>
                    <span style={goldGradient}>Voltar ao Login</span>
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Informe o e-mail cadastrado para recuperar sua senha.</p>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <input type="email" value={forgotEmail} onChange={(e) => { setForgotEmail(e.target.value); setError("") }}
                        placeholder="seu@email.com"
                        className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && handleForgot()}
                      />
                    </div>
                  </div>
                  {error && <p className="text-center text-xs text-red-400">{error}</p>}
                  <button onClick={handleForgot} className="w-full rounded-lg py-4 font-serif text-base font-bold" style={goldButton}>
                    <span style={goldGradient}>Enviar</span>
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
