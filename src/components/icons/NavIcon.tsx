import Image from "next/image";
import { logoSrc } from "@/lib/media";

type NavIconProps = {
  href: string;
  className?: string;
};

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Xeroura mark with muted tones for dark menu chrome. */
export function MenuBrandLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 ${className}`}>
      <Image
        src={logoSrc}
        alt=""
        fill
        className="object-contain opacity-[0.9] saturate-[0.42] brightness-[1.1] contrast-[0.94]"
        sizes="24px"
      />
    </span>
  );
}

export function NavIcon({ href, className = "h-7 w-7" }: NavIconProps) {
  const shared = `${className} text-white`;

  switch (href) {
    case "/":
      return (
        <svg viewBox="0 0 24 24" className={shared} fill="none" aria-hidden>
          <path d="M4 11.5L12 5l8 6.5" {...stroke} />
          <path d="M6 10.5V19h12v-8.5" {...stroke} />
        </svg>
      );
    case "/about":
      return (
        <svg viewBox="0 0 24 24" className={shared} fill="none" aria-hidden>
          <circle cx="12" cy="8" r="3.5" {...stroke} />
          <path d="M5 20c0-4 3.5-6 7-6s7 2 7 6" {...stroke} />
        </svg>
      );
    case "/products":
      return (
        <svg viewBox="0 0 24 24" className={shared} fill="none" aria-hidden>
          <rect x="4" y="4" width="7" height="7" rx="1.5" {...stroke} />
          <rect x="13" y="4" width="7" height="7" rx="1.5" {...stroke} />
          <rect x="4" y="13" width="7" height="7" rx="1.5" {...stroke} />
          <rect x="13" y="13" width="7" height="7" rx="1.5" {...stroke} />
        </svg>
      );
    case "/services":
      return (
        <svg viewBox="0 0 24 24" className={shared} fill="none" aria-hidden>
          <path d="M12 3l8 4v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" {...stroke} />
          <path d="M9 12l2 2 4-4" {...stroke} />
        </svg>
      );
    case "/careers":
      return (
        <svg viewBox="0 0 24 24" className={shared} fill="none" aria-hidden>
          <rect x="3" y="8" width="18" height="12" rx="2" {...stroke} />
          <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2M3 14h18" {...stroke} />
        </svg>
      );
    case "/contact":
      return (
        <svg viewBox="0 0 24 24" className={shared} fill="none" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" {...stroke} />
          <path d="M3 7l9 6 9-6" {...stroke} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={shared} fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" {...stroke} />
        </svg>
      );
  }
}
