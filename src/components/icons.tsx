import type { CSSProperties } from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export function CheckIcon({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <path d="M4 12.5L9.5 18L20 6" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowIcon({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <path d="M4 6H20M4 12H20M4 18H20" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ size = 22, color = '#e0483c', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M5 7H19M9 7V5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5V7M17 7L16.3 18.3C16.2 19.7 15.5 20 14.1 20H9.9C8.5 20 7.8 19.7 7.7 18.3L7 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon({ size = 22, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <path d="M5 5L19 19M19 5L5 19" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ size = 22, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <path d="M12 5V19M5 12H19" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

export function RotateIcon({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <rect x="3" y="7" width="18" height="10" rx="2" stroke={color} strokeWidth={2} />
      <path
        d="M8 3.6A9 9 0 0 1 12 2.7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="M12 21.3a9 9 0 0 1-4-.9" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <path d="M15.5 2.2l1.9 1.6-1.9 1.6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 21.8l-1.9-1.6 1.9-1.6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeIcon({ size = 22, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M3 10.5L12 3l9 7.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 9.8V20h13V9.8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.8 20v-5.5h4.4V20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PencilIcon({ size = 20, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.5 6.5 17.5 9.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
