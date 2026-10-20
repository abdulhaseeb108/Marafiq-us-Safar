// Hand-drawn illustrations and brand icons (no downloads needed)

export function Logo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="#c39a54" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 43h40M8 43V27c0-3 2-5 4-6M40 43V27c0-3-2-5-4-6" />
      <path d="M13 21c0-6 5-9 11-9s11 3 11 9" />
      <path d="M24 5v7M21 8h6" />
      <path d="M18 43V31a6 6 0 0 1 12 0v12" />
      <path d="M6 43V19M42 43V19M6 19l-1.5-3h3zM42 19l-1.5-3h3z" />
    </svg>
  );
}

export function Lantern() {
  return (
    <svg viewBox="0 0 80 190" fill="none">
      <path d="M40 0v26" stroke="#c39a54" strokeWidth="2" />
      <circle cx="40" cy="30" r="5" stroke="#c39a54" strokeWidth="2" />
      <path d="M22 52 40 36l18 16z" fill="#c39a54" />
      <path d="M26 52h28l4 72H22z" fill="#f3c46a" fillOpacity=".28" stroke="#c39a54" strokeWidth="2" />
      <path d="M40 52v72M33 52l-3 72M47 52l3 72" stroke="#c39a54" strokeWidth="1.4" />
      <ellipse cx="40" cy="92" rx="9" ry="16" fill="#ffd98a" fillOpacity=".75" />
      <path d="M20 124h40l-4 10H24z" fill="#c39a54" />
      <path d="M40 134v12" stroke="#c39a54" strokeWidth="2" />
      <path d="M34 146h12l-6 18z" fill="#c39a54" />
    </svg>
  );
}

export function Kaaba() {
  return (
    <svg viewBox="0 0 200 100" fill="none">
      {/* faint skyline behind */}
      <g fill="#c9d6d1">
        <rect x="8" y="48" width="5" height="40" /><path d="M8 48l2.5-9 2.5 9z" />
        <rect x="22" y="62" width="22" height="26" /><path d="M22 62q11-16 22 0z" />
        <rect x="156" y="62" width="22" height="26" /><path d="M156 62q11-16 22 0z" />
        <rect x="186" y="48" width="5" height="40" /><path d="M186 48l2.5-9 2.5 9z" />
        <rect x="50" y="66" width="4" height="22" /><rect x="146" y="66" width="4" height="22" />
      </g>
      {/* cube */}
      <path d="M68 40h64l8 48H60z" fill="#1d2523" />
      <path d="M63 56h74l1.5 9h-77z" fill="#c39a54" />
      <rect x="92" y="68" width="16" height="20" rx="2" fill="#c39a54" fillOpacity=".85" />
      <path d="M68 40h64" stroke="#c39a54" strokeWidth="1.5" />
      <path d="M40 88h120" stroke="#b9c7c2" strokeWidth="1.5" />
    </svg>
  );
}

export function Skyline() {
  return (
    <svg viewBox="0 0 320 150" fill="#c39a54">
      {/* tall minaret */}
      <rect x="22" y="40" width="8" height="110" /><rect x="19" y="62" width="14" height="4" />
      <path d="M26 14l5 26H21z" /><rect x="24" y="30" width="4" height="10" />
      {/* big dome mosque */}
      <rect x="58" y="96" width="120" height="54" />
      <path d="M72 96c0-34 22-48 46-48s46 14 46 48z" />
      <path d="M118 26v22M113 33h10" stroke="#c39a54" strokeWidth="2.5" fill="none" />
      <rect x="52" y="70" width="8" height="80" /><path d="M56 48l5 22h-10z" />
      <rect x="176" y="70" width="8" height="80" /><path d="M180 48l5 22h-10z" />
      {/* small dome */}
      <rect x="196" y="116" width="62" height="34" />
      <path d="M202 116c0-20 12-28 25-28s25 8 25 28z" />
      {/* far minaret */}
      <rect x="276" y="66" width="7" height="84" /><path d="M279.5 44l4.5 22h-9z" />
      <rect x="0" y="146" width="320" height="4" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.93 9.93 0 1 0 12.04 2Zm0 18.1c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.12.82.83-3.04-.2-.31A8.1 8.1 0 1 1 12.04 20.1Zm4.45-6.07c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.47-.4-.4-.55-.41h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}