interface Props {
  size?:    number;
  variant?: 'light' | 'dark' | 'color';
  className?: string;
}

/**
 * Plated logo mark.
 * Icon: a stylised plate — clean circle with an inner ring and a subtle
 * fork-tine accent on the left, rendered in warm brand colours.
 * Variants: light (on dark bg), dark (on light bg), color (default).
 */
export function Logo({ size = 32, variant = 'color', className }: Props) {
  const bg      = variant === 'light' ? '#1a1208' : '#f4ede4';
  const plate   = variant === 'light' ? '#f4ede4' : '#1a1208';
  const accent  = '#c98f4a';
  const sienna  = '#8a4b2f';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Plated"
      className={className}
    >
      {/* Background tile */}
      <rect width="64" height="64" rx="16" fill={bg} />

      {/* Outer plate ring */}
      <circle cx="32" cy="32" r="18" stroke={plate} strokeWidth="3" fill="none" />

      {/* Inner plate ring */}
      <circle cx="32" cy="32" r="12" stroke={plate} strokeWidth="1.5" fill="none" opacity="0.45" />

      {/* Fork tines — left side, three vertical lines */}
      <line x1="16" y1="20" x2="16" y2="28" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="20" x2="19" y2="28" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="20" x2="22" y2="28" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      {/* Fork handle */}
      <line x1="19" y1="28" x2="19" y2="44" stroke={accent} strokeWidth="2" strokeLinecap="round" />

      {/* Knife — right side */}
      <line x1="45" y1="20" x2="45" y2="44" stroke={sienna} strokeWidth="2" strokeLinecap="round" />
      <path d="M45 20 C48 22 48 28 45 30" stroke={sienna} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
