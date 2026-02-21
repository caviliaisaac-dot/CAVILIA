"use client"
// Para trocar o ícone: substitua o arquivo public/images/emblem.png pela sua imagem.
// Para ajustar o layout: veja COMO-PERSONALIZAR.md na raiz do projeto.

interface HomeScreenProps {
  onNavigate: (screen: "schedule" | "profile") => void
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-24">
      {/* CAVILIA: grande, dourado, brilho metálico */}
      <h1
        className="mb-0 font-serif text-6xl font-bold tracking-[0.14em]"
        style={{
          background: "linear-gradient(180deg, #f0bc2a 0%, #d4a017 40%, #f5cc50 60%, #a87c0e 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 10px rgba(212,160,23,0.6))",
        }}
      >
        CAVILIA
      </h1>
      {/* — STUDIO CLUB 1998 — com linhas douradas */}
      <div className="mt-2 mb-8 flex items-center gap-2">
        <span className="text-gold/80">—</span>
        <span
          className="font-sans text-[13px] font-medium tracking-[0.28em] uppercase"
          style={{
            background: "linear-gradient(180deg, #f0bc2a 0%, #d4a017 50%, #f5cc50 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Studio Club 1998
        </span>
        <span className="text-gold/80">—</span>
      </div>

      {/* Emblema circular central: cavalo e ferradura */}
      <div className="relative mb-12 flex-shrink-0" style={{ padding: 4, borderRadius: '9999px', background: 'conic-gradient(from 0deg, #f5cc6a 0%, #e8b84b 18%, #c49a2e 35%, #fff3b0 50%, #c49a2e 65%, #e8b84b 82%, #f5cc6a 100%)', boxShadow: '0 0 18px 4px rgba(232,184,75,0.45), 0 0 6px 1px rgba(255,243,176,0.3)' }}>
        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/emblem.png"
            alt="CAVILIA - Cavalo e Ferradura"
            className="h-full w-full rounded-full object-contain object-center"
            width={144}
            height={144}
          />
        </div>
      </div>

      {/* Botões com borda dourada grossa e vibrante */}
      <div className="flex w-full max-w-xs flex-col gap-4">
        <button
          onClick={() => onNavigate("schedule")}
          className="rounded-lg px-6 py-3.5 font-sans text-sm font-semibold tracking-[0.18em] uppercase transition-all hover:brightness-110"
          style={{
            background: "#2a2420",
            border: "2.5px solid #d4a017",
            boxShadow: "0 0 12px 3px rgba(212,160,23,0.55), 0 0 4px 1px rgba(240,188,42,0.4), inset 0 1px 0 rgba(255,255,255,0.07), 0 3px 12px rgba(0,0,0,0.5)",
          }}
        >
          <span style={{
            background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 4px rgba(212,160,23,0.8))",
          }}>
            Agendar Horário
          </span>
        </button>
        <button
          onClick={() => onNavigate("profile")}
          className="rounded-lg px-6 py-3.5 font-sans text-sm font-semibold tracking-[0.18em] uppercase transition-all hover:brightness-110"
          style={{
            background: "#2a2420",
            border: "2.5px solid #d4a017",
            boxShadow: "0 0 12px 3px rgba(212,160,23,0.55), 0 0 4px 1px rgba(240,188,42,0.4), inset 0 1px 0 rgba(255,255,255,0.07), 0 3px 12px rgba(0,0,0,0.5)",
          }}
        >
          <span style={{
            background: "linear-gradient(180deg, #f5cc50 0%, #d4a017 45%, #f0bc2a 70%, #a87c0e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 4px rgba(212,160,23,0.8))",
          }}>
            Meus Horários
          </span>
        </button>
      </div>
    </div>
  )
}
