import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { InnerPageShell } from "@/components/layout/InnerPageShell";
import { ProductIcon } from "@/components/products/ProductIcon";
import { Reveal } from "@/components/Reveal";
import { ip } from "@/lib/inner-page";
import { getProductBySlug, products } from "@/lib/products";
import { site } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.overview,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <InnerPageShell>
      <section className={ip.section}>
        <div className={`${ip.container} relative`}>
          <div className="pointer-events-none absolute inset-0 grid-glow opacity-20" />
          <Reveal className="relative">
            <p className={ip.eyebrow}>Product</p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ProductIcon slug={product.slug} />
              </div>
              <div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {product.name}
                </h1>
                <p className="mt-2 text-sm font-medium text-brand-accent">{product.tag}</p>
              </div>
            </div>
            <div className={`mt-6 h-1 w-full max-w-[12rem] rounded-full bg-gradient-to-r ${product.accent}`} />
            <p className={`${ip.lead} max-w-3xl`}>{product.overview}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/contact">Request a demo</ButtonLink>
              <ButtonLink href="/products" variant="secondary">
                All products
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={`${ip.section} border-b-0`}>
        <div className={ip.container}>
          <Reveal>
            <h2 className={ip.h2}>Key features</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                  {feature}
                </li>
              ))}
            </ul>
            <p className={`${ip.muted} mt-10 text-sm`}>
              Built by {site.legalName}. Need this tailored to your stack?{" "}
              <a href="/contact" className={ip.link}>
                Talk to us
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </InnerPageShell>
  );
}
