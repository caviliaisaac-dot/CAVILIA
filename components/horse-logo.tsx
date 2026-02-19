"use client"

export function HorseLogo({ size = 120 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CAVILIA - Logo com cavalo e ferradura"
    >
      {/* Horseshoe */}
      <path
        d="M25 75C25 47 38 25 60 25C82 25 95 47 95 75"
        stroke="#c9a96e"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="25" cy="75" r="4" fill="#c9a96e" />
      <circle cx="95" cy="75" r="4" fill="#c9a96e" />
      {/* Nail details */}
      <circle cx="32" cy="55" r="2" fill="#c9a96e" opacity="0.6" />
      <circle cx="88" cy="55" r="2" fill="#c9a96e" opacity="0.6" />
      <circle cx="37" cy="40" r="2" fill="#c9a96e" opacity="0.6" />
      <circle cx="83" cy="40" r="2" fill="#c9a96e" opacity="0.6" />

      {/* Horse head silhouette inside horseshoe */}
      <path
        d="M52 85L52 65C52 60 50 55 48 52C46 49 46 45 48 42C50 39 53 37 56 36L58 34C59 33 61 32 63 33L65 35C68 36 71 39 73 42C75 45 75 49 73 52C71 55 69 60 69 65L69 85"
        fill="#c9a96e"
        opacity="0.15"
      />
      <path
        d="M52 85L52 65C52 60 50 55 48 52C46 49 46 45 48 42C50 39 53 37 56 36L58 34C59 33 61 32 63 33L65 35C68 36 71 39 73 42C75 45 75 49 73 52C71 55 69 60 69 65L69 85"
        stroke="#c9a96e"
        strokeWidth="2"
        fill="none"
      />
      {/* Horse ear */}
      <path
        d="M55 36L52 28L56 33"
        stroke="#c9a96e"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M63 33L66 26L64 32"
        stroke="#c9a96e"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Horse eye */}
      <circle cx="58" cy="44" r="1.5" fill="#c9a96e" />
      {/* Horse nostril */}
      <circle cx="55" cy="56" r="1" fill="#c9a96e" opacity="0.7" />
    </svg>
  )
}
