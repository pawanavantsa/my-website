"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { technologyLogos, techLogoUrl } from "@/lib/tech-logos";

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
        y: 24,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(".achievements-copy", {
        opacity: 0,
        y: 20,
        duration: 0.55,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(".cap-pill", {
        opacity: 0,
        y: 12,
        duration: 0.45,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".capabilities-pills",
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="p-4 pb-8 lg:p-10 lg:pb-10">
      <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-10">
        <div className="md:flex-1">
          <h2 className="achievements-heading text-3xl">Capabilities</h2>
        </div>

        <div className="md:flex-1">
          <p className="achievements-copy text-sm leading-relaxed text-[#444444] md:text-base">
            {paragraph}
          </p>

          <ul className="capabilities-pills mt-6 flex flex-wrap gap-2 md:mt-8 md:gap-3">
            {capabilities.map((cap) => (
              <li key={cap}>
                <span className="cap-pill inline-block rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black md:text-sm">
                  {cap}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="tech-logos-grid mt-10 border-t border-black/10 pt-8 md:mt-12">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#888]">
          Technologies we work with
        </p>
        <ul className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-7 sm:gap-x-12 md:gap-x-14">
          {technologyLogos.map((tech) => (
            <li key={tech.name} className="group flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={techLogoUrl(tech.slug)}
                alt={tech.name}
                width={40}
                height={40}
                className="h-8 w-auto max-w-[5.5rem] object-contain opacity-[0.42] grayscale transition duration-300 group-hover:opacity-90 group-hover:grayscale-0 sm:h-9"
                loading="lazy"
                draggable={false}
              />
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#999] transition group-hover:text-[#444] sm:text-[11px]">
                {tech.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
