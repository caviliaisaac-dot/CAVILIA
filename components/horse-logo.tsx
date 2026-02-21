"use client"

export function HorseLogo({ size = 120 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CAVILIA - Cavalo e Ferradura"
    >
      <defs>
        {/* Gradiente dourado metálico */}
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5e6b8" />
          <stop offset="35%" stopColor="#d4b56a" />
          <stop offset="70%" stopColor="#b8943e" />
          <stop offset="100%" stopColor="#9a7b2e" />
        </linearGradient>
        <linearGradient id="goldLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff5d6" />
          <stop offset="100%" stopColor="#c9a96e" />
        </linearGradient>
        <linearGradient id="goldShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a68b52" />
          <stop offset="100%" stopColor="#6b5028" />
        </linearGradient>
      </defs>

      {/* Ferradura – arco grosso em U com pontas abertas */}
      <path
        d="M28 78 Q28 32 60 28 Q92 32 92 78"
        stroke="url(#gold)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* Pontas da ferradura (bolinhas) */}
      <circle cx="28" cy="78" r="5" fill="url(#gold)" />
      <circle cx="92" cy="78" r="5" fill="url(#gold)" />
      {/* Furos de prego na ferradura */}
      <circle cx="38" cy="48" r="2.5" fill="url(#goldShadow)" />
      <circle cx="82" cy="48" r="2.5" fill="url(#goldShadow)" />
      <circle cx="48" cy="32" r="2.5" fill="url(#goldShadow)" />
      <circle cx="72" cy="32" r="2.5" fill="url(#goldShadow)" />

      {/* Cabeça do cavalo em perfil – testa, focinho, queixo (dentro da ferradura) */}
      <path
        d="M50 78
           L50 66 Q50 58 52 52 Q54 46 56 42 Q58 38 62 36 L66 35 Q70 34 74 36 Q78 40 78 46 Q78 52 76 58 Q74 64 74 72 L74 78 Z"
        fill="url(#goldLight)"
        stroke="url(#gold)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Orelha esquerda */}
      <path d="M62 36 L58 28 L64 34" stroke="url(#gold)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Orelha direita (mais atrás) */}
      <path d="M72 36 L76 28 L74 34" stroke="url(#gold)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Olho */}
      <ellipse cx="64" cy="50" rx="2.8" ry="2.2" fill="url(#goldShadow)" />
      <circle cx="65" cy="49.5" r="0.9" fill="#1a1512" />
      {/* Narina e boca */}
      <path d="M50 58 Q54 60 58 58" stroke="url(#gold)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="54" cy="58" r="1.3" fill="url(#goldShadow)" />
      {/* Linha do pescoço / crina */}
      <path d="M60 36 Q66 34 74 38" stroke="url(#goldShadow)" strokeWidth="1" fill="none" opacity="0.7" />
      {/* Queixo / linha inferior */}
      <path d="M50 66 L52 74 L72 74 L74 68" stroke="url(#gold)" strokeWidth="1" fill="none" strokeLinejoin="round" />
    </svg>
  )
}
