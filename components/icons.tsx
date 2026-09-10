interface IconProps {
  className?: string;
}

function base(className?: string) {
  return (
    className ?? "h-5 w-5"
  );
}

export function CartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="17" cy="20" r="1.6" />
      <path d="M2.5 3.5h2.6l2.5 12.2a1.5 1.5 0 0 0 1.5 1.2h7.9a1.5 1.5 0 0 0 1.5-1.2L20.5 7H6" />
    </svg>
  );
}

export function HeartIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6.1a5 5 0 1 1 7.5 6.5Z" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.4-3.6 4.4-5.5 8-5.5s6.6 1.9 8 5.5" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function StarIcon({ className, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className={base(className)} strokeLinejoin="round">
      <path d="m12 2.7 2.8 5.9 6.5.8-4.8 4.5 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.7 9.4l6.5-.8L12 2.7Z" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-.8 12a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8L6 7" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function TruckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 6.5h11v10h-11zM13.5 10h4l3.5 3.5v3h-7.5" />
      <circle cx="6.5" cy="18.5" r="1.8" />
      <circle cx="17" cy="18.5" r="1.8" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.8 4.5 5.8v6.1c0 4.6 3.1 8 7.5 9.3 4.4-1.3 7.5-4.7 7.5-9.3V5.8L12 2.8Z" />
      <path d="m9 11.5 2.2 2.2 4-4.2" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h4l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h15m-6-7 7 7-7 7" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function BoxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2.7 8.5 4.7v9.2L12 21.3l-8.5-4.7V7.4L12 2.7Z" />
      <path d="M3.5 7.4 12 12l8.5-4.6M12 12v9.3" />
    </svg>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.8 2.8m6.4 6.4L18 18M18 6l-2.8 2.8M8.8 15.2 6 18" />
    </svg>
  );
}

export function ScissorsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M8 7.5 20 19M8 16.5 20 5" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={base(className)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h8M10 8l4 4-4 4M14 12H21" />
    </svg>
  );
}
