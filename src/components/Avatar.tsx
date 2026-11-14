import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  initials?: string;
  accentBg?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-14 w-14 text-lg',
};

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  initials,
  accentBg = '#634EE3',
  size = 'md',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);
  const label = initials || computeInitials(name);
  const sizeClass = SIZE_CLASSES[size];

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${sizeClass} shrink-0 rounded-full object-cover border border-[#E4E0F3] bg-[#EEEBFA] ${className}`}
      />
    );
  }

  return (
    <span
      aria-label={name}
      style={{ backgroundColor: accentBg }}
      className={`${sizeClass} inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white select-none ${className}`}
    >
      {label}
    </span>
  );
};
