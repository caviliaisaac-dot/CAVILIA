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
      <h1 className="mb-0 font-serif text-5xl font-bold tracking-[0.14em] text-gold drop-shadow-[0_0_16px_rgba(232,184,75,0.55)]">
        CAVILIA
      </h1>
      {/* — STUDIO CLUB 1998 — com linhas douradas */}
      <div className="mt-2 mb-8 flex items-center gap-2">
        <span className="text-gold/70">—</span>
        <span className="font-sans text-[11px] font-medium tracking-[0.28em] uppercase text-gold/90">
          Studio Club 1998
        </span>
        <span className="text-gold/70">—</span>
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

      {/* Botões: marrom escuro, borda dourada, texto dourado, leve efeito em relevo */}
      <div className="flex w-full max-w-xs flex-col gap-4">
        <button
          onClick={() => onNavigate("schedule")}
          className="rounded-lg border border-gold/50 bg-[#2a2420] px-6 py-3.5 font-sans text-sm font-semibold tracking-[0.18em] uppercase text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.35)] transition-colors hover:border-gold/70 hover:bg-[#342d26]"
        >
          Agendar Horário
        </button>
        <button
          onClick={() => onNavigate("profile")}
          className="rounded-lg border border-gold/50 bg-[#2a2420] px-6 py-3.5 font-sans text-sm font-semibold tracking-[0.18em] uppercase text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.35)] transition-colors hover:border-gold/70 hover:bg-[#342d26]"
        >
          Meus Horários
        </button>
      </div>
    </div>
  )
}
