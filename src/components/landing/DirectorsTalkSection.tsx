"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const directors = [
  {
    quote:
      "We are building Xeroura on a clear premise: AI must earn trust in production, not only impress in demos. Our products are shaped for measurable outcomes—faster resolution, stronger operations, and teams that remain in control as they scale.",
    name: "Pawankumar Avantsa",
    role: "Director",
  },
  {
    quote:
      "Our focus is disciplined delivery—combining rigorous engineering with software people adopt. We invest in platforms that translate across industries, while keeping implementation practical for the teams who operate them every day.",
    name: "Gouthami Nali",
    role: "Director",
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
    <section ref={containerRef} className="bg-[#eeeeee] px-4 py-14 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="directors-heading mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
          <h2 className="text-3xl font-medium tracking-tight">Directors&apos; talk</h2>
          <p className="max-w-md text-sm leading-relaxed text-[#666]">
            Perspective from our leadership on how we build AI products and deliver for the long term.
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
                <p className="mt-1 text-sm text-[#666]">{director.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
