import type { Metadata } from "next";
import { CareersForm } from "@/components/CareersForm";
import { InnerPageShell } from "@/components/layout/InnerPageShell";
import { Reveal } from "@/components/Reveal";
import { ip } from "@/lib/inner-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers",
  description: `Join ${site.legalName} — submit your profile for current and future opportunities.`,
};

export default function CareersPage() {
  return (
    <InnerPageShell>
      <section className={ip.section}>
        <div className={`${ip.container} relative`}>
          <div className="pointer-events-none absolute inset-0 grid-glow opacity-20" />
          <Reveal className="relative">
            <p className={ip.eyebrow}>Careers</p>
            <h1 className={ip.h1}>Join a team that builds the future</h1>
            <p className={ip.lead}>
              We welcome passionate developers, designers, analysts, and innovators who want to
              work on meaningful technology. Even if hiring is not active, you can submit your
              details for future opportunities.
            </p>
          </Reveal>
        </div>
      </section>

      <section className={`${ip.section} border-b-0`}>
        <div className={`${ip.container} max-w-3xl`}>
          <Reveal>
            <CareersForm theme="dark" />
          </Reveal>
        </div>
      </section>
    </InnerPageShell>
  );
}
