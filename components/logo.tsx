import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <defs>
        <linearGradient id="dl-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7b79a" />
          <stop offset="55%" stopColor="#d98aa8" />
          <stop offset="100%" stopColor="#8f5ab8" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#dl-mark)" />
      <path
        d="M16 23.2s-6.4-3.9-6.4-8.4a3.6 3.6 0 0 1 6.4-2.3 3.6 3.6 0 0 1 6.4 2.3c0 4.5-6.4 8.4-6.4 8.4Z"
        fill="#fff8f1"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-fg text-[21px] font-medium tracking-tight italic">Dear Lola</span>
    </span>
  );
}
