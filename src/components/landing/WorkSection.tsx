"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { unsplash } from "@/lib/media";
import { ProductIcon } from "@/components/products/ProductIcon";
import { products } from "@/lib/products";

const productsCard = {
  title: "Products & solutions",
  description:
    "Xeroura ships a growing portfolio of production-ready AI platforms and copilots. From customer service and employee assist to document intelligence and workflow automation, each product is built to deploy quickly, integrate with your stack, and prove value in live environments.",
  groups: [
    ["Xeroura CS", "LiveBot", "Xeroura AI", "Xeroura Flow", "Xeroura DocAI"],
    ["Xeroura Insight", "Xeroura Voice", "Xeroura Guard", "Xeroura Teams", "Xeroura Connect"],
  ],
};

const services = [
  {
    id: 1,
    title: "AI & Product Development",
    description:
      "Design and launch AI-powered SaaS platforms, copilots, and automation products that drive measurable outcomes. From discovery and architecture through production rollout, we help teams ship faster—with guardrails, observability, and clear ownership.",
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
      "Modernize enterprise systems with secure, scalable engineering across cloud, data, integration, and operations. We refactor legacy stacks, harden integrations, and keep platforms reliable as usage, compliance, and release cadence intensify.",
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
      "Embed vetted talent and delivery pods to close skill gaps, speed execution, and build long-term capability. Engineers, architects, and delivery leads plug into your rituals and tools—scaling capacity up or down without losing context or quality.",
    image: unsplash.heroCollaboration,
    groups: [] as string[][],
  },
];

const cardClassName =
  "sticky top-0 left-0 flex h-[100dvh] min-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-[#EEEEEE] p-2 md:flex-row md:p-4";

const lastServiceCardClassName =
  "sticky top-0 left-0 flex h-[78dvh] min-h-[78dvh] w-full flex-col justify-between overflow-hidden bg-[#EEEEEE] p-2 md:flex-row md:p-4";

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

      <div className="stack-track">
        <article ref={firstCardRef} className={cardClassName} style={{ zIndex: 1 }}>
          <div className="flex flex-[0.35] flex-row items-start justify-between p-2 md:p-4">
            <h3
              ref={numberRef}
              className="text-[clamp(3.25rem,11vw,7.5rem)] font-medium leading-none tracking-tight md:text-9xl"
              style={{ minWidth: "5ch" }}
            >
              0+
            </h3>
            <h4 className="max-w-[10rem] text-xl leading-snug">{productsCard.title}</h4>
          </div>

          <div className="mt-6 flex flex-[0.65] flex-col items-start gap-6 p-2 md:mt-0 md:gap-8 md:p-4">
            <p className="max-w-xl text-2xl leading-snug sm:text-3xl">{productsCard.description}</p>

            <div className="flex flex-wrap justify-start gap-10 md:gap-14">
              {productsCard.groups.map((group, i) => (
                <ul key={i} className="text-base font-medium text-black sm:text-lg">
                  {group.map((item) => {
                    const product = products.find((p) => p.name === item);
                    return (
                      <li key={item} className="flex items-center gap-3 py-1.5 sm:py-2">
                        {product ? (
                          <ProductIcon slug={product.slug} className="h-6 w-6 shrink-0 text-brand-primary sm:h-7 sm:w-7" />
                        ) : null}
                        {item}
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>

            <Link
              href="/products"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand-primary transition hover:text-brand-accent sm:text-base"
            >
              View all {products.length}+ products
              <span aria-hidden>→</span>
            </Link>
          </div>
        </article>

        {services.map((service, index) => {
          const isLast = index === services.length - 1;
          return (
            <article
              key={service.id}
              className={isLast ? lastServiceCardClassName : cardClassName}
              style={{ zIndex: 2 + index }}
            >
              <div className="flex flex-[0.35] flex-row items-start justify-between p-2 md:p-4">
                <h3 className="text-7xl font-medium md:text-9xl">{service.id}</h3>
                <h4 className="max-w-[10rem] text-xl leading-snug">{service.title}</h4>
              </div>

              <div className="mt-6 flex flex-[0.65] flex-col items-start gap-6 p-2 md:mt-0 md:gap-8 md:p-4">
                <p className="max-w-xl text-2xl leading-snug sm:text-3xl">{service.description}</p>

                <div className="relative h-[200px] w-full max-w-[340px] shrink-0 overflow-hidden rounded-xl">
                  <Image src={service.image} alt="" fill className="object-cover" sizes="340px" />
                </div>

                {service.groups.length > 0 ? (
                  <div className="flex flex-wrap justify-start gap-8">
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
          );
        })}
      </div>
    </div>
  );
}
