"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TechLogoMarquee } from "@/components/landing/TechLogoMarquee";

const capabilities = [
  "AI copilots",
  "Cloud platforms",
  "Data pipelines",
  "Enterprise apps",
  "Automation",
  "Security",
  "DevOps",
  "Workforce pods",
];

const paragraph =
  "We partner with teams that need production-grade AI and software — from greenfield products to modernizing legacy systems. Focused delivery, clear communication, measurable outcomes.";

export function AchievementsSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".achievements-heading", {
        opacity: 0,
        y: 28,
        duration: 0.65,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 72%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(".achievements-copy", {
        opacity: 0,
        y: 36,
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 68%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(".cap-pill", {
        opacity: 0,
        y: 16,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".capabilities-pills",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-10">
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="achievements-heading text-sm font-semibold uppercase tracking-[0.22em] text-[#666]">
              Expertise
            </p>
            <h2 className="achievements-heading mt-3 text-3xl font-medium tracking-tight text-black lg:text-4xl">
              Capabilities
            </h2>
          </div>

          <div className="lg:col-span-8">
            <p className="achievements-copy text-2xl font-normal leading-[1.35] tracking-tight text-black sm:text-3xl lg:text-[2rem] lg:leading-[1.3]">
              {paragraph}
            </p>
          </div>
        </div>

        <ul className="capabilities-pills mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2 md:mt-12 md:gap-3">
          {capabilities.map((cap) => (
            <li
              key={cap}
              className="cap-pill rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black"
            >
              {cap}
            </li>
          ))}
        </ul>

      </div>

      <div className="tech-logos-marquee mt-10 border-t border-black/10 pt-8 md:mt-12">
        <p className="mx-auto max-w-6xl px-4 text-xs font-medium uppercase tracking-[0.22em] text-[#888] lg:px-10">
          Technologies we work with
        </p>
        <TechLogoMarquee />
      </div>
    </section>
  );
}
