"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const directors = [
  {
    quote:
      "Reliable AI only matters when it survives real workloads, not boardroom demos that never reach production. At Xeroura, we design and ship copilots, platforms, and automation built for the teams who run them every day. We are committed to engineering systems that deliver measurable outcomes: faster resolution, stronger operations, and lasting control as our clients scale.",
    name: "Pawankumar Avantsa",
  },
  {
    quote:
      "True digital transformation happens when cutting-edge technology aligns perfectly with strategic business vision. At Xeroura, our goal is to be more than a technology provider. We aim to be a catalyst for our clients' success. We are committed to delivering agile, intelligent, and secure IT ecosystems that drive efficiency and unlock new corporate potential.",
    name: "Sai Gouthami Nali",
  },
];

export function DirectorsTalkSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".directors-heading", {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(".director-card", {
        opacity: 0,
        y: 32,
        duration: 0.65,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".directors-grid",
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative z-[5] bg-[#eeeeee] px-4 pb-14 pt-6 lg:px-10 lg:pb-16 lg:pt-8">
      <div className="mx-auto max-w-6xl">
        <div className="directors-heading mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
          <h2 className="text-3xl font-medium tracking-tight">Directors&apos; words</h2>
          <p className="max-w-md text-sm leading-relaxed text-[#666]">
            Notes from our leadership on how we build AI products and deliver for the long term.
          </p>
        </div>

        <div className="directors-grid grid gap-8 md:grid-cols-2 md:gap-10">
          {directors.map((director) => (
            <article
              key={director.name}
              className="director-card flex flex-col justify-between rounded-2xl border border-black/[0.08] bg-white p-6 md:p-8"
            >
              <p className="text-lg font-medium leading-snug text-black md:text-xl lg:text-2xl">
                &ldquo;{director.quote}&rdquo;
              </p>
              <div className="mt-8 border-t border-black/[0.06] pt-6">
                <h3 className="text-base font-semibold text-black">{director.name}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
