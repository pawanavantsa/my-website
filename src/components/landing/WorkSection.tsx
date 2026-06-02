"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { unsplash } from "@/lib/media";
import { ProductIcon } from "@/components/products/ProductIcon";
import { featuredProductNames, getProductByName } from "@/lib/products";

const services = [
  {
    id: 1,
    title: "AI & Product Development",
    description:
      "Design and launch AI-powered SaaS platforms, copilots, and automation products that drive measurable outcomes.",
    image: unsplash.aiNeural,
    groups: [
      ["AI copilots", "Workflow automation", "SaaS acceleration"],
      ["Product strategy", "MVP to scale", "Analytics"],
    ],
  },
  {
    id: 2,
    title: "Software & IT Services",
    description:
      "Modernize enterprise systems with secure, scalable engineering across cloud, data, integration, and operations.",
    image: unsplash.cloudServer,
    groups: [
      ["Cloud-native", "API integration", "Reliability"],
      ["Security", "DevOps", "Observability"],
    ],
  },
  {
    id: 3,
    title: "Staff Augmentation",
    description:
      "Embed vetted talent and delivery pods to close skill gaps, speed execution, and build long-term capability.",
    image: unsplash.heroCollaboration,
    groups: [] as string[][],
  },
];

const cardClassName =
  "sticky top-0 left-0 flex h-[100dvh] min-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-[#EEEEEE] p-2 md:flex-row md:p-4";

function progressToCount(progress: number): number {
  if (progress >= 0.92) return 10;
  return Math.min(10, Math.round(progress * 10));
}

export function WorkSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLElement | null>(null);
  const numberRef = useRef<HTMLHeadingElement | null>(null);
  const displayedRef = useRef(0);
  const prevTopRef = useRef<number | null>(null);
  const countTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const updateCounter = (scrollProgress: number, direction: number) => {
      const el = numberRef.current;
      if (!el) return;

      if (reduced) {
        el.innerText = "10+";
        return;
      }

      const rect = el.getBoundingClientRect();
      const slightlyVisible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!slightlyVisible) return;

      const target = progressToCount(scrollProgress);
      const prevTop = prevTopRef.current;
      const movingDownOnScreen = prevTop !== null && rect.top > prevTop + 0.5;
      prevTopRef.current = rect.top;

      if (direction === 1) {
        displayedRef.current = Math.max(displayedRef.current, target);
      } else if (movingDownOnScreen) {
        displayedRef.current = target;
      }

      el.innerText = `${displayedRef.current}+`;
    };

    const ctx = gsap.context(() => {
      gsap.from(".work-title span", {
        y: "100%",
        duration: 0.6,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      const el = numberRef.current;
      const card = firstCardRef.current;
      if (!el || !card) return;

      countTriggerRef.current = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        endTrigger: card,
        end: "top top",
        invalidateOnRefresh: true,
        onUpdate(self) {
          updateCounter(self.progress, self.direction);
        },
      });
    }, containerRef);

    const refresh = () => {
      ScrollTrigger.refresh();
      const st = countTriggerRef.current;
      if (st) updateCounter(st.progress, 1);
    };

    window.addEventListener("welcome-loader-done", refresh);
    refresh();

    return () => {
      window.removeEventListener("welcome-loader-done", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} id="services" className="relative px-4 pb-0 pt-2 lg:px-10">
      <h2 className="work-title mb-3 max-w-[950px] overflow-hidden text-2xl lg:text-3xl">
        <span className="block">What we do</span>
      </h2>

      <div className="stack-track pb-px">
        <article ref={firstCardRef} className={cardClassName} style={{ zIndex: 1 }}>
          <div className="flex flex-[0.35] flex-col justify-between p-2 md:p-4">
            <div>
              <p className="text-lg text-black/80">Products &amp; solutions</p>
              <h3
                ref={numberRef}
                className="mt-1 text-[clamp(4.5rem,14vw,9rem)] font-bold leading-none tracking-tight"
                style={{ minWidth: "5ch" }}
              >
                0+
              </h3>
              <p className="mt-2 max-w-sm text-sm text-[#444444]">products and solutions ready</p>
            </div>
          </div>
          <div className="flex flex-[0.65] flex-col justify-end gap-5 p-2 md:justify-center md:p-4">
            <p className="max-w-lg text-xl leading-snug sm:text-2xl lg:text-3xl">
              A portfolio of production-ready AI products and platforms — including{" "}
              {featuredProductNames.slice(0, -1).join(", ")}, and {featuredProductNames.at(-1)}.
            </p>
            <ul className="flex max-w-lg flex-wrap gap-2">
              {featuredProductNames.map((name) => {
                const product = getProductByName(name);
                return (
                  <li
                    key={name}
                    className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white py-1 pl-2 pr-3 text-xs font-medium text-black sm:text-sm"
                  >
                    {product ? (
                      <ProductIcon slug={product.slug} className="h-4 w-4 shrink-0" />
                    ) : null}
                    {name}
                  </li>
                );
              })}
              <li className="flex items-center gap-1.5 rounded-full border border-dashed border-black/20 py-1 pl-2 pr-3 text-xs text-[#555] sm:text-sm">
                <ProductIcon slug="more" className="h-4 w-4 shrink-0 opacity-60" />
                +5 more
              </li>
            </ul>
            <Link
              href="/products"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand-primary transition hover:text-brand-accent sm:text-base"
            >
              View all products &amp; solutions
              <span aria-hidden>→</span>
            </Link>
          </div>
        </article>

        {services.map((service, index) => (
          <article
            key={service.id}
            className={cardClassName}
            style={{ zIndex: 2 + index }}
          >
            <div className="flex flex-[0.35] flex-row items-start justify-between p-2">
              <h3 className="text-7xl font-medium md:text-9xl">{service.id}</h3>
              <h4 className="max-w-[10rem] text-xl">{service.title}</h4>
            </div>

            <div className="mt-6 flex flex-[0.65] flex-col items-start justify-between gap-6 md:mt-0 md:gap-4">
              <p className="text-2xl sm:text-3xl">{service.description}</p>

              <div className="relative h-[200px] w-full max-w-[340px] overflow-hidden rounded-xl">
                <Image src={service.image} alt="" fill className="object-cover" sizes="340px" />
              </div>

              {service.groups.length > 0 ? (
                <div className="mt-2 flex flex-wrap justify-start gap-8 md:mt-3">
                  {service.groups.map((group, i) => (
                    <ul key={i} className="text-sm text-[#444444]">
                      {group.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
