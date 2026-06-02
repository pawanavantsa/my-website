type ProductIconProps = {
  slug: string;
  className?: string;
};

const stroke = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ProductIcon({ slug, className = "h-10 w-10" }: ProductIconProps) {
  const shared = `${className} text-brand-primary`;

  switch (slug) {
    case "xeroura-cs":
      return (
        <svg viewBox="0 0 48 48" className={shared} fill="none" aria-hidden>
          <path d="M8 14h32M8 24h20M8 34h14" {...stroke} />
          <rect x="32" y="20" width="8" height="18" rx="2" {...stroke} className="text-brand-accent" />
          <circle cx="36" cy="26" r="1.5" fill="currentColor" className="text-brand-accent" />
        </svg>
      );
    case "livebot":
      return (
        <svg viewBox="0 0 48 48" className={shared} fill="none" aria-hidden>
          <rect x="8" y="10" width="32" height="24" rx="4" {...stroke} className="text-brand-accent" />
          <path d="M14 20h20M14 26h12" {...stroke} />
          <path d="M20 38h8" {...stroke} />
        </svg>
      );
    case "xeroura-ai":
      return (
        <svg viewBox="0 0 48 48" className={shared} fill="none" aria-hidden>
          <circle cx="24" cy="24" r="12" {...stroke} className="text-brand-accent" />
          <path d="M18 28c2 2 10 2 12 0M20 20h.01M28 20h.01" {...stroke} />
          <path d="M24 8v4M24 36v4M8 24h4M36 24h4" {...stroke} className="opacity-50" />
        </svg>
      );
    case "xeroura-flow":
      return (
        <svg viewBox="0 0 48 48" className={shared} fill="none" aria-hidden>
          <circle cx="14" cy="24" r="4" {...stroke} />
          <circle cx="34" cy="14" r="4" {...stroke} className="text-brand-accent" />
          <circle cx="34" cy="34" r="4" {...stroke} className="text-brand-accent" />
          <path d="M18 22l10-6M18 26l10 6" {...stroke} />
        </svg>
      );
    case "xeroura-docai":
      return (
        <svg viewBox="0 0 48 48" className={shared} fill="none" aria-hidden>
          <path d="M14 8h14l8 8v24a2 2 0 01-2 2H14a2 2 0 01-2-2V10a2 2 0 012-2z" {...stroke} />
          <path d="M28 8v8h8M16 22h16M16 28h12M16 34h10" {...stroke} className="text-brand-accent" />
        </svg>
      );
    case "xeroura-insight":
      return (
        <svg viewBox="0 0 48 48" className={shared} fill="none" aria-hidden>
          <path d="M10 36V22M20 36V16M30 36V26M38 36V10" {...stroke} className="text-brand-accent" />
          <path d="M8 38h32" {...stroke} />
        </svg>
      );
    case "xeroura-voice":
      return (
        <svg viewBox="0 0 48 48" className={shared} fill="none" aria-hidden>
          <rect x="18" y="8" width="12" height="20" rx="6" {...stroke} className="text-brand-accent" />
          <path d="M12 22a12 12 0 0024 0M24 34v6M16 40h16" {...stroke} />
        </svg>
      );
    case "xeroura-guard":
      return (
        <svg viewBox="0 0 48 48" className={shared} fill="none" aria-hidden>
          <path d="M24 6l14 6v12c0 9-6 14-14 18-8-4-14-9-14-18V12l14-6z" {...stroke} className="text-brand-accent" />
          <path d="M18 24l4 4 8-8" {...stroke} />
        </svg>
      );
    case "xeroura-teams":
      return (
        <svg viewBox="0 0 48 48" className={shared} fill="none" aria-hidden>
          <circle cx="18" cy="16" r="5" {...stroke} />
          <circle cx="32" cy="18" r="4" {...stroke} className="text-brand-accent" />
          <path d="M8 36c0-6 4-10 10-10s10 4 10 10M26 36c0-5 3-8 8-8" {...stroke} />
        </svg>
      );
    case "xeroura-connect":
      return (
        <svg viewBox="0 0 48 48" className={shared} fill="none" aria-hidden>
          <circle cx="12" cy="24" r="4" {...stroke} />
          <circle cx="36" cy="14" r="4" {...stroke} className="text-brand-accent" />
          <circle cx="36" cy="34" r="4" {...stroke} className="text-brand-accent" />
          <path d="M16 22h8l6-6M16 26h8l6 6" {...stroke} />
        </svg>
      );
    case "more":
      return (
        <svg viewBox="0 0 48 48" className={shared} fill="none" aria-hidden>
          <rect x="8" y="8" width="12" height="12" rx="2" {...stroke} />
          <rect x="28" y="8" width="12" height="12" rx="2" {...stroke} />
          <rect x="8" y="28" width="12" height="12" rx="2" {...stroke} />
          <path d="M34 28h6M37 25v6" {...stroke} className="text-brand-accent" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" className={shared} fill="none" aria-hidden>
          <rect x="10" y="10" width="28" height="28" rx="6" {...stroke} />
          <path d="M18 24h12M24 18v12" {...stroke} className="text-brand-accent" />
        </svg>
      );
  }
}
