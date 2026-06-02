import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { InnerPageShell } from "@/components/layout/InnerPageShell";
import { ProductIcon } from "@/components/products/ProductIcon";
import { Reveal } from "@/components/Reveal";
import { ip } from "@/lib/inner-page";
import { products } from "@/lib/products";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Products",
  description: `Explore ${products.length}+ AI products and solutions from ${site.legalName} — Xeroura CS, LiveBot, Xeroura AI, and more.`,
};

export default function ProductsPage() {
  return (
    <InnerPageShell>
      <section className={ip.section}>
        <div className={`${ip.container} relative`}>
          <div className="pointer-events-none absolute inset-0 grid-glow opacity-20" />
          <Reveal className="relative">
            <p className={ip.eyebrow}>Products</p>
            <h1 className={ip.h1}>Intelligent, scalable, user-centric digital products</h1>
            <p className={ip.lead}>
              {site.legalName} ships a growing portfolio of AI copilots, automation platforms, and
              enterprise tools — from customer service and employee assist to document intelligence,
              voice, and secure integrations.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/contact">Request a demo</ButtonLink>
              <ButtonLink href="/services" variant="secondary">
                Custom engineering
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={`${ip.section} border-b-0`}>
        <div className={`${ip.container} flex flex-col gap-16`}>
          {products.map((p, index) => (
            <Reveal key={p.slug} delayMs={index * 80}>
              <article className={`${ip.cardLg} grid gap-10 lg:grid-cols-[0.35fr_1fr]`}>
                <div className="flex flex-col items-start gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <ProductIcon slug={p.slug} />
                  </div>
                  <div>
                    <h2 className={ip.h2}>{p.name}</h2>
                    <p className="mt-1 text-sm font-medium text-brand-accent">{p.tag}</p>
                  </div>
                  <div className={`mt-2 h-1 w-full max-w-[10rem] rounded-full bg-gradient-to-r ${p.accent}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Overview
                  </h3>
                  <p className={`${ip.bodyLg} mt-2`}>{p.overview}</p>
                  <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-brand-accent">
                    Key features
                  </h3>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-slate-300"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </InnerPageShell>
  );
}
