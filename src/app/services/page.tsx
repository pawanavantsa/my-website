import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { InnerPageShell } from "@/components/layout/InnerPageShell";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { ip } from "@/lib/inner-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description: `AI & product development, software delivery, and workforce solutions from ${site.legalName}.`,
};

const engagementModels = [
  {
    title: "Embedded squads",
    body: "Engineers and leads join your tools, ceremonies, and compliance guardrails—so delivery feels native to your org, not bolted on.",
  },
  {
    title: "Milestone delivery",
    body: "Clear scope slices, demos on a cadence, and explicit acceptance criteria—ideal when you need predictability alongside speed.",
  },
  {
    title: "Ramp & transition",
    body: "Structured onboarding, documentation, and handover so capability lands with your team and does not walk out the door on day one.",
  },
] as const;

const practices = [
  {
    title: "Architecture & security",
    detail: "Threat modeling, access patterns, and review gates suited to regulated and high-trust environments.",
  },
  {
    title: "Data & integrations",
    detail: "Pipelines, APIs, and observability so systems stay connected and measurable as they grow.",
  },
  {
    title: "Reliability & ownership",
    detail: "Runbooks, on-call expectations, and SLAs that match how your business actually operates.",
  },
] as const;

export default function ServicesPage() {
  return (
    <InnerPageShell>
      <section className={ip.section}>
        <div className={ip.container}>
          <Reveal>
            <p className={ip.eyebrow}>Services</p>
            <h1 className={ip.h1}>Outcome-led partnerships—not generic staff aug</h1>
            <p className={ip.lead}>
              {site.legalName} helps you ship and scale with clear ownership: how we engage, how we
              govern risk, and how we transfer capability back to your team when you are ready.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/contact">Start a conversation</ButtonLink>
              <ButtonLink href="/products" variant="secondary">
                View products
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={ip.sectionAlt}>
        <div className={ip.container}>
          <Reveal>
            <SectionHeading
              theme="dark"
              eyebrow="Engagements"
              title="Ways we work with you"
              description="Pick the shape that matches your constraints—same standards across every model."
            />
          </Reveal>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {engagementModels.map((p, i) => (
              <Reveal key={p.title} delayMs={i * 80}>
                <article
                  id={i === engagementModels.length - 1 ? "workforce" : undefined}
                  className={`${ip.card} h-full transition hover:border-brand-accent/30`}
                >
                  <div className="mb-4 h-1 w-14 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent" />
                  <h2 className={ip.h2}>{p.title}</h2>
                  <p className={`${ip.body} mt-3`}>{p.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${ip.section} border-b-0`}>
        <div className={ip.container}>
          <Reveal>
            <SectionHeading
              theme="dark"
              eyebrow="How we run delivery"
              title="Engineering discipline you can audit"
              description="Under the hood, the same practices apply whether we are embedded, milestone-based, or helping you ramp internal capacity."
            />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {practices.map((row, i) => (
              <Reveal key={row.title} delayMs={i * 70}>
                <div className={ip.card}>
                  <h3 className={ip.h3}>{row.title}</h3>
                  <p className={`${ip.body} mt-2`}>{row.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delayMs={200}>
            <div className={`${ip.cardLg} mt-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center`}>
              <p className={`${ip.bodyLg} max-w-2xl`}>
                Product innovation, client programs, and workforce capacity sit in one operating
                fabric—so velocity does not trade off against continuity.
              </p>
              <ButtonLink href="/contact" variant="secondary">
                Talk through your context
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </InnerPageShell>
  );
}
