import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { InnerPageShell } from "@/components/layout/InnerPageShell";
import { Reveal } from "@/components/Reveal";
import { ip } from "@/lib/inner-page";
import { mailtoHref, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${site.legalName} — email, office address, and location in HITEC City, Hyderabad.`,
};

export default function ContactPage() {
  return (
    <InnerPageShell>
      <section className={ip.section}>
        <div className={ip.container}>
          <Reveal>
            <p className={ip.eyebrow}>Contact</p>
            <h1 className={ip.h1}>Let&apos;s build what&apos;s next</h1>
            <p className={ip.lead}>
              Reach out for partnerships, services, product inquiries, or media. We respond to
              thoughtful messages quickly.
            </p>
          </Reveal>
        </div>
      </section>

      <section className={`${ip.section} border-b-0`}>
        <div className={`${ip.container} grid items-stretch gap-10 lg:grid-cols-2`}>
          <Reveal className="flex min-h-0 h-full flex-col">
            <div className="flex h-full min-h-0 flex-col gap-8">
              <div className={ip.card}>
                <h2 className={ip.h3}>Email</h2>
                <a className={`${ip.link} mt-2 inline-flex text-sm`} href={mailtoHref()}>
                  {site.email}
                </a>
              </div>
              <div className={ip.card}>
                <h2 className={ip.h3}>Office address</h2>
                <address className={`${ip.body} mt-3 not-italic`}>
                  {site.address.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <p className={`${ip.muted} mt-4 text-xs`}>
                  Coordinates: {site.address.lat}, {site.address.lng} (Awfis N Heights, HITEC City)
                </p>
              </div>
              <div className="group relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10">
                <iframe
                  title="Office location preview (Google Maps)"
                  src={site.address.googleMapsEmbedUrl}
                  width="100%"
                  className="pointer-events-none min-h-[280px] w-full flex-1 border-0 bg-black"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={site.address.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/90 via-transparent to-transparent px-4 pb-4 pt-24 text-center text-sm font-semibold text-white outline-none ring-inset ring-brand-accent/0 transition hover:from-black focus-visible:ring-2"
                  aria-label="Open office location in Google Maps"
                >
                  <span className="drop-shadow-md">
                    Open in Google Maps
                    <span className="ml-1 inline-block transition group-hover:translate-x-0.5" aria-hidden>
                      →
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal delayMs={120} className="flex min-h-0 h-full flex-col">
            <ContactForm theme="dark" />
          </Reveal>
        </div>
      </section>
    </InnerPageShell>
  );
}
