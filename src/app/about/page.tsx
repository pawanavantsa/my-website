import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { InnerPageShell } from "@/components/layout/InnerPageShell";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { ip } from "@/lib/inner-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${site.legalName}: our hybrid model, vision, mission, and how we build intelligent digital solutions.`,
};

export default function AboutPage() {
  return (
    <InnerPageShell>
      <section className={ip.section}>
        <div className={ip.container}>
          <Reveal>
            <p className={ip.eyebrow}>About Xeroura</p>
            <h1 className={ip.h1}>Forward-thinking technology for the modern world</h1>
            <p className={ip.lead}>
              {site.legalName} is a forward-thinking technology company focused on building
              intelligent digital solutions for the modern world. We operate through a unique
              hybrid model that blends AI product development, client-driven project execution,
              and end-to-end IT services.
            </p>
          </Reveal>
        </div>
      </section>

      <section className={ip.sectionAlt}>
        <div className={ip.container}>
          <Reveal>
            <SectionHeading
              theme="dark"
              eyebrow="Principles"
              title="Build with purpose. Innovate with clarity. Deliver with excellence."
              description={
                <>
                  We believe in creating a workspace where ideas thrive, employees grow, and
                  clients experience technology that truly transforms their business. Our
                  approach is simple on paper—disciplined in execution.
                </>
              }
            />
          </Reveal>
        </div>
      </section>

      <section className={ip.section}>
        <div className={`${ip.container} grid gap-12 lg:grid-cols-2`}>
          <Reveal>
            <article className={ip.card}>
              <h2 className={ip.h2}>Vision</h2>
              <p className={`${ip.bodyLg} mt-4`}>
                To build a future-ready technology ecosystem where innovation, AI-driven products,
                and human potential come together — empowering businesses, clients, and employees
                to grow without limits.
              </p>
            </article>
          </Reveal>
          <Reveal delayMs={100}>
            <article className={ip.card}>
              <h2 className={ip.h2}>Mission</h2>
              <p className={`${ip.bodyLg} mt-4`}>
                Our mission is to deliver intelligent digital solutions through a hybrid model that
                blends AI product development, client-focused project execution, and high-quality IT
                services. We aim to create a workplace where ideas are nurtured, employees thrive,
                and clients experience measurable impact.
              </p>
            </article>
          </Reveal>
        </div>
      </section>

      <section className={`${ip.section} border-b-0`}>
        <div className={`${ip.container} max-w-3xl text-center`}>
          <Reveal>
            <h2 className={ip.h2}>Ready to work with us?</h2>
            <p className={`${ip.bodyLg} mt-3`}>
              Tell us about your roadmap—we&apos;ll help you ship, scale, and support it.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/contact">Contact</ButtonLink>
              <ButtonLink href="/careers" variant="secondary">
                Careers
              </ButtonLink>
            </div>
            <p className={`${ip.muted} mt-8 text-sm`}>
              Prefer email?{" "}
              <Link className={ip.link} href={`mailto:${site.email}`}>
                {site.email}
              </Link>
            </p>
          </Reveal>
        </div>
      </section>
    </InnerPageShell>
  );
}
