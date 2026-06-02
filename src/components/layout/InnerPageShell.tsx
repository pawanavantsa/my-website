import Link from "next/link";
import type { ReactNode } from "react";
import { ip } from "@/lib/inner-page";
import { site } from "@/lib/site";

export function InnerPageShell({ children }: { children: ReactNode }) {
  return (
    <div className={ip.page}>
      {children}
      <footer className={`${ip.section} ${ip.container} text-center`}>
        <p className={`${ip.muted} text-xs`}>
          © {new Date().getFullYear()} {site.legalName}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          <Link href="/privacy-policy" className="text-slate-400 transition hover:text-brand-accent">
            Privacy Policy
          </Link>
          <span className="text-slate-600" aria-hidden>
            ·
          </span>
          <Link
            href="/terms-and-conditions"
            className="text-slate-400 transition hover:text-brand-accent"
          >
            Terms &amp; Conditions
          </Link>
        </div>
      </footer>
    </div>
  );
}
