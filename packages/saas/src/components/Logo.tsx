interface Props {
  size?:    number;
  variant?: 'light' | 'dark' | 'color';
  className?: string;
}

export function Logo({ size = 32, variant = 'color', className }: Props) {
  const textColor   = variant === 'light' ? '#f4ede4' : variant === 'dark' ? '#1a1208' : '#1a1208';
  const accentColor = '#c98f4a';
  const gemColor    = variant === 'light' ? '#c98f4a' : '#8a4b2f';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NexCMS"
      className={className}
    >
      {/* Background pill */}
      <rect width="64" height="64" rx="16" fill={variant === 'light' ? '#1a1208' : '#f4ede4'} />

      {/* Left column — N stroke */}
      <path
        d="M14 46 L14 18 L26 34 L26 18"
        stroke={textColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Accent gem — diamond */}
      <path
        d="M36 18 L42 26 L36 34 L30 26 Z"
        fill={accentColor}
      />

      {/* Right bar — C arc suggestion */}
      <path
        d="M50 24 C54 24 56 28 56 32 C56 36 54 40 50 40"
        stroke={gemColor}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bottom wordmark dot */}
      <circle cx="32" cy="52" r="3" fill={accentColor} />
    </svg>
  );
}
