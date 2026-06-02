import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-glow-sm hover:scale-[1.04] hover:shadow-glow hover:brightness-[1.03]",
  secondary:
    "border border-white/20 bg-white/5 text-white backdrop-blur hover:border-brand-accent/50 hover:bg-white/10",
  ghost:
    "text-brand-primary hover:text-brand-accent dark:text-cyan-200 dark:hover:text-brand-accent",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
